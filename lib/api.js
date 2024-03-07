import Colors from './colors.js'

// TODO: better name
export let _suite = {}
let isOnly = false

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
  const stack = callsites().filter(s => s.getFileName() && !s.getFileName().startsWith('node:'))

  return stack.pop()
}

async function runTests({tests, beforeEach, colors}) {
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
      prettyError(e, colors)
      failure++
    }
  }

  return [success, failure]
}

function prettyError(e, colors) {
  const msg = e.stack
  if (!msg) return colors.yellow(e)

  const i = msg.indexOf('\n')
  colors.yellowln(msg.slice(0, i))
  colors.gray(msg.slice(i))
  console.info('\n')
}

function getCurrentSuite() {
  const headline = getCallerModule().getFileName().replace('file://' + process.cwd() + '/', '')

  if (!_suite[headline]) {
    _suite[headline] = {
      beforeAll: [],
      beforeEach: [],
      tests: []
    }
  }
  return _suite[headline]
}

export function test(name, fn, testFile) {
  if (isOnly) {
    return
  }
  (testFile || getCurrentSuite()).tests.push({name, fn})
}

test.only = function(name, fn) {
  if (isOnly) {
    return
  }
  _suite = {}
  test(name, fn)
  isOnly = true
}

export const it = test

export function beforeEach(fn, testFile) {
  (testFile || getCurrentSuite()).beforeEach.push(fn)
}

export function beforeAll(fn, testFile) {
  (testFile || getCurrentSuite()).beforeAll.push(fn)
}

export async function run({ only, stdout = process.stdout, suite } = {}) {
  const callerModule = getCallerModule()
  let currentSuite = suite || _suite

  const callerFileName = callerModule.getFileName()

  if (callerFileName.endsWith('/ClusterJobProcessor.js') || callerFileName.match(process.argv[1])) {
    const colors = new Colors({stdout})
    let pass = true

    for (const headline in currentSuite) {
      const testFile = currentSuite[headline]

      const tests = only ? testFile.tests.filter(test => test.name === only) : testFile.tests
      if (!tests.length) {
        continue
      }

      colors.cyan(headline + ' ')

      const afterAll = []
      const registerAfterAllCleanup = fn => {
        afterAll.push(fn)
      }

      await Promise.all(testFile.beforeAll.map(fn => fn(registerAfterAllCleanup)))
      const [success, failure] = await runTests({tests, beforeEach: testFile.beforeEach, colors})
      await Promise.all(afterAll.map(fn => fn()))

      if (failure) {
        pass = false
        colors.redln(`✗ ${success}/${failure}`)
      } else {
        colors.greenln(` ✓ ${success}/0`)
      }
    }

    _suite = {}
    isOnly = false

    return pass
  }
}
