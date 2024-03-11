import Colors from './colors.js'

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

/**
 * @interface TestSuite
 * @property {Record<string, TestFile>} testFiles
 */

/**
 * @param {Object} [options] - The options for the run function.
 * @param {string} [options.only] - If provided, only the specified task will be run.
 * @param {Object} [options.stdout] - Custom standard output for logging.
 * @param {function(string):void} options.stdout.write - Function to write text to stdout.
 * @param {TestSuite} [options.currentSuite] - A record of test files, overwriting global suite.
 * @returns {Promise<boolean|undefined>} A promise that resolves with a boolean or undefined upon completion.
 */
export async function run({ only, stdout = process.stdout, currentSuite = suite } = {}) {
  const colors = new Colors({ stdout })
  let pass = true

  for (const fileName in currentSuite.testFiles) {
    const testFile = currentSuite.testFiles[fileName]

    const tests = only ? testFile.tests.filter(test => test.name === only) : testFile.tests
    if (!tests.length) {
      continue
    }

    colors.cyan(fileName + ' ')

    const afterAll = []
    const registerAfterAllCleanup = fn => {
      afterAll.push(fn)
    }

    await Promise.all(testFile.beforeAll.map(fn => fn(registerAfterAllCleanup)))
    const [success, failure] = await runTests({ tests, beforeEach: testFile.beforeEach, colors })
    await Promise.all(afterAll.map(fn => fn()))

    if (failure) {
      pass = false
      colors.redln(`✗ ${success}/${failure}`)
    } else {
      colors.greenln(` ✓ ${success}/0`)
    }
  }

  suite = {
    testFiles: {}
  }

  return pass
}

/**
 * @type {TestSuite}
 */
export let suite = {
  testFiles: {}
}
