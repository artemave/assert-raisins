const rgb = require('barecolor')
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

function getParentModule() {
  return require.cache[getParentModuleName()]
}

async function runTests(tests) {
  let [success, failure] = [0, 0]

  for (const test of tests) {
    try {
      await test.fn()
      rgb.gray('•')
      success++

    } catch(e) {
      rgb.red(`\n\n✗ ${test.name} \n\n`)
      prettyError(e)
      failure++
    }
  }

  return [success, failure]
}

function prettyError(e) {
  const msg = e.stack
  if (!msg) return rgb.yellow(e)

  const i = msg.indexOf('\n')
  rgb.yellowln(msg.slice(0, i))
  rgb.gray(msg.slice(i))
  console.info('\n')
}

function getCurrentSuite() {
  const headline = getParentModule().filename.replace(process.cwd() + '/', '')

  if (!suites[headline]) {
    suites[headline] = {
      beforeAll: [],
      afterAll: [],
      tests: []
    }
  }
  return suites[headline]
}

function test(name, fn) {
  if (!isOnly) {
    getCurrentSuite().tests.push({name, fn})
  }
}

test.only = function(name, fn) {
  suites = []
  test(name, fn)
  isOnly = true
}

module.exports = {
  test,

  afterSuite(fn) {
    afterSuiteCallbacks.push(fn)
  },

  beforeSuite(fn) {
    beforeSuiteCallbacks.push(fn)
  },

  beforeAll(fn) {
    getCurrentSuite().beforeAll.push(fn)
  },

  afterAll(fn) {
    getCurrentSuite().afterAll.push(fn)
  },

  async run() {
    const parentModule = getParentModule()

    if (!parentModule.parent) {
      await Promise.all(beforeSuiteCallbacks.map(fn => fn()))

      for (const headline in suites) {
        rgb.cyan(headline + ' ')

        await Promise.all(suites[headline].beforeAll.map(fn => fn()))

        const [success, failure] = await runTests(suites[headline].tests)

        await Promise.all(suites[headline].afterAll.map(fn => fn()))

        if (failure) {
          rgb.redln(`✗ ${success}/${failure}`)
        } else {
          rgb.greenln(` ✓ ${success}/0`)
        }
      }

      await Promise.all(afterSuiteCallbacks.map(fn => fn()))
    }
  }
}
