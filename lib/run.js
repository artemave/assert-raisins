async function runTests({tests, beforeEach, reporter}) {
  for (const test of tests) {
    try {
      const afterEach = []
      const registerAfterEachCleanup = fn => {
        afterEach.push(fn)
      }

      try {
        await Promise.all(beforeEach.map(fn => fn(registerAfterEachCleanup)))
      } catch (error) {
        reporter.report({
          beforeEach: {
            error
          }
        })
        return
      }

      await test.fn()
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

  const afterAll = []
  const registerAfterAllCleanup = fn => {
    afterAll.push(fn)
  }

  try {
    await Promise.all(testFileDefinition.beforeAll.map(fn => fn(registerAfterAllCleanup)))

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

export let testFileDefinition = {
  tests: [],
  beforeAll: [],
  beforeEach: []
}
