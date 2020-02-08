const rgb = require('barecolor')
const suites = []

function getParentModuleName() {
  const caller = new Error().stack.split('\n')[4]
  let path = caller.split(' ').pop()
  path = path.replace(/^\(/, '')
  path = path.replace(/\)$/, '')
  path = path.replace(/:\d+:\d+$/, '')
  return path
}

function getParentModule(stack) {
  return require.cache[getParentModuleName(stack)]
}

async function runTests(tests) {
  let [success, failure] = [0, 0]

  for (const test of tests) {
    try {
      await test.fn()
      rgb.gray('•')
      success++

    } catch(e) {
      rgb.red(`\n\n! ${test.name} \n\n`)
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

module.exports = {
  test(name, fn) {
    const headline = getParentModule().filename.replace(process.cwd() + '/', '')
    if (!suites[headline]) {
      suites[headline] = []
    }
    suites[headline].push({name, fn})
  },

  async run() {
    const parentModule = getParentModule()

    if (!parentModule.parent) {
      for (const headline in suites) {
        rgb.cyan(headline + ' ')

        const [success, failure] = await runTests(suites[headline])

        if (failure) {
          rgb.redln(`✗ ${success}/${failure}`)
        } else {
          rgb.greenln(` ✓ ${success}/0`)
        }
      }
    }
  }
}
