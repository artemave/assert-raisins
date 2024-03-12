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

export async function run({ only, reporter, fileName } = {}) {
  const tests = only ? testFileDefinition.tests.filter(test => test.name === only) : testFileDefinition.tests

  const afterAll = []
  const registerAfterAllCleanup = fn => {
    afterAll.push(fn)
  }

  try {
    await Promise.all(testFileDefinition.beforeAll.map(fn => fn(registerAfterAllCleanup)))
  } catch (error) {
    reporter.report({
      fileName,
      beforeAll: {
        error
      }
    })
  }

  await runTests({
    tests,
    beforeEach: testFileDefinition.beforeEach,
    reporter: {
      report: (msg) => {
        reporter.report(Object.assign(msg, { fileName }))
      }
    }
  })

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
