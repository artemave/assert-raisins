const colors = require('./colors')
let suites = []
let isOnly = false
let afterSuiteCallbacks = []
let beforeSuiteCallbacks = []

function getParentModuleName() {
  let stack = new Error().stack.split('\n')
  stack.shift()
  stack = stack.filter(line => !line.match(__filename))
  const caller = stack.shift()

  let path = caller.split(' ').pop()
  path = path.replace(/^\(/, '')
  path = path.replace(/\)$/, '')
  path = path.replace(/:\d+:\d+$/, '')

  return path
}

function registerAfterSuiteCleanup(fn) {
  afterSuiteCallbacks.push(fn)
}

function getParentModule() {
  return require.cache[getParentModuleName()]
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

      colors.gray('•')
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
  const headline = getParentModule().filename.replace(process.cwd() + '/', '')

  if (!suites[headline]) {
    suites[headline] = {
      beforeFile: [],
      beforeEach: [],
      tests: []
    }
  }
  return suites[headline]
}

function test(name, fn) {
  if (isOnly) {
    suites = []
  }
  getCurrentSuite().tests.push({name, fn})
}

test.only = function(name, fn) {
  isOnly = true
  test(name, fn)
}

module.exports = {
  test,
  it: test,

  beforeSuite(fn) {
    beforeSuiteCallbacks.push(fn)
  },

  beforeEach(fn) {
    getCurrentSuite().beforeEach.push(fn)
  },

  beforeFile(fn) {
    getCurrentSuite().beforeFile.push(fn)
  },

  async run({only = undefined} = {}) {
    const parentModule = getParentModule()

    if (!parentModule.parent) {
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
}
