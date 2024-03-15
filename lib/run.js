async function runTests({tests, beforeEach, reporter}) {
  for (const test of tests) {
    try {
      cleanups = []
      let afterEach = []

      try {
        await Promise.all(beforeEach.map(fn => fn()))
        afterEach = cleanups.slice()
      } catch (error) {
        reporter.report({
          beforeEach: {
            error
          }
        })
        return
      }

      cleanups = []
      await test.fn()
      await Promise.all(cleanups.map(fn => fn()))

      await Promise.all(afterEach.map(fn => fn()))

      reporter.report({
        testName: test.name,
      })

    } catch(error) {
      reporter.report({
        testName: test.name,
        error
      })
    }
  }
}

export async function run({ only, reporter, fileName } = {}) {
  const tests = only ? testFileDefinition.tests.filter(test => test.name === only) : testFileDefinition.tests
  if (!tests.length) {
    throw new Error(`No tests found`)
  }

  cleanups = []
  let afterAll = []

  try {
    await Promise.all(testFileDefinition.beforeAll.map(fn => fn()))
    afterAll = cleanups.slice()

    await runTests({
      tests,
      beforeEach: testFileDefinition.beforeEach,
      reporter: {
        report: (msg) => {
          reporter.report(Object.assign(msg, { fileName }))
        }
      }
    })
  } catch (error) {
    reporter.report({
      fileName,
      beforeAll: {
        error
      }
    })
  }

  try {
    await Promise.all(afterAll.map(fn => fn()))
  } catch (error) {
    reporter.report({
      fileName,
      afterAll: {
        error
      }
    })
  }

  testFileDefinition = {
    tests: [],
    beforeAll: [],
    beforeEach: []
  }
}

export let cleanups = []

export let testFileDefinition = {
  tests: [],
  beforeAll: [],
  beforeEach: []
}
