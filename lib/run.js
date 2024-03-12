async function runTests({tests, beforeEach, reporter}) {
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

      reporter.report({
        testName: test.name,
      })
      success++

    } catch(error) {
      reporter.report({
        testName: test.name,
        error
      })

      failure++
    }
  }

  return [success, failure]
}

export async function run({ only, reporter, currentSuite = suite } = {}) {
  // TODO: get rid of this
  let pass = true

  for (const fileName in currentSuite.testFiles) {
    const testFile = currentSuite.testFiles[fileName]

    const tests = only ? testFile.tests.filter(test => test.name === only) : testFile.tests
    if (!tests.length) {
      continue
    }

    const afterAll = []
    const registerAfterAllCleanup = fn => {
      afterAll.push(fn)
    }

    try {
      await Promise.all(testFile.beforeAll.map(fn => fn(registerAfterAllCleanup)))
    } catch (error) {
      pass = false

      reporter.report({
        fileName,
        beforeAll: {
          error
        }
      })
    }

    const [, failure] = await runTests({
      tests,
      beforeEach: testFile.beforeEach,
      reporter: {
        report: (msg) => {
          reporter.report(Object.assign(msg, { fileName }))
        }
      }
    })

    try {
      await Promise.all(afterAll.map(fn => fn()))
    } catch (error) {
      pass = false

      reporter.report({
        fileName,
        afterAll: {
          error
        }
      })
    }

    if (failure) {
      pass = false
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
