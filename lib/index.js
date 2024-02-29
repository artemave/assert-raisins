import colors from './colors.js'

let suites = []
let isOnly = false
let afterSuiteCallbacks = []
let beforeSuiteCallbacks = []

function callsites() {
  const originalPrepareStackTrace = Error.prepareStackTrace

  try {
    Error.prepareStackTrace = (_, stack) => {
      return stack.slice(1)
    }
    return new Error().stack

  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace
  }
}

function getCallerModule() {
  const stack = callsites().filter(s => !s.getFileName().startsWith('node:internal'))
  return stack.pop()
}

function registerAfterSuiteCleanup(fn) {
  afterSuiteCallbacks.push(fn)
}

async function runTests({tests, beforeEach}) {
  let [success, failure] = [0, 0]

  for (const test of tests) {
    try {
      const afterEach = []
      const registerAfterEachCleanup = fn => {
        afterEach.push(fn)
      }

      await Promise.all(beforeEach.map(fn => fn(registerAfterEachCleanup)))
      await test.fn()
      await Promise.all(afterEach.map(fn => fn()))

      colors.green('•')
      success++

    } catch(e) {
      colors.red(`\n\n✗ ${test.name} \n\n`)
      prettyError(e)
      failure++
    }
  }

  return [success, failure]
}

function prettyError(e) {
  const msg = e.stack
  if (!msg) return colors.yellow(e)

  const i = msg.indexOf('\n')
  colors.yellowln(msg.slice(0, i))
  colors.gray(msg.slice(i))
  console.info('\n')
}

function getCurrentSuite() {
  const headline = getCallerModule().getFileName().replace('file://' + process.cwd() + '/', '')

  if (!suites[headline]) {
    suites[headline] = {
      beforeFile: [],
      beforeEach: [],
      tests: []
    }
  }
  return suites[headline]
}

export function test(name, fn) {
  if (isOnly) {
    return
  }
  getCurrentSuite().tests.push({name, fn})
}

test.only = function(name, fn) {
  if (isOnly) {
    return
  }
  suites = []
  test(name, fn)
  isOnly = true
}

export const it = test

export function beforeSuite(fn) {
  beforeSuiteCallbacks.push(fn)
}

export function beforeEach(fn) {
  getCurrentSuite().beforeEach.push(fn)
}

export function beforeFile(fn) {
  getCurrentSuite().beforeFile.push(fn)
}

export async function run({ only = undefined } = {}) {
  const callerModule = getCallerModule()

  if (callerModule.getFileName().match(process.argv[1])) {
    let pass = true

    await Promise.all(beforeSuiteCallbacks.map(fn => fn(registerAfterSuiteCleanup)))

    for (const headline in suites) {
      const suite = suites[headline]

      const tests = only ? suite.tests.filter(test => test.name === only) : suite.tests
      if (!tests.length) {
        continue
      }

      colors.cyan(headline + ' ')

      const afterAll = []
      const registerAfterAllCleanup = fn => {
        afterAll.push(fn)
      }

      await Promise.all(suite.beforeFile.map(fn => fn(registerAfterAllCleanup)))
      const [success, failure] = await runTests({tests, beforeEach: suite.beforeEach})
      await Promise.all(afterAll.map(fn => fn()))

      if (failure) {
        pass = false
        colors.redln(`✗ ${success}/${failure}`)
      } else {
        colors.greenln(` ✓ ${success}/0`)
      }
    }

    await Promise.all(afterSuiteCallbacks.map(fn => fn()))

    return pass
  }
}
