(async () => {
  const {test, run, beforeAll, afterAll, beforeSuite, afterSuite} = require('..')
  const assert = require('assert')

  let invoke = 0
  let beforeSuiteInvoke = 0
  let afterSuiteInvoke = 0
  let beforeAllInvoke = 0
  let afterAllInvoke = 0

  beforeSuite(() => beforeSuiteInvoke++)
  beforeSuite(async () => Promise.resolve(beforeSuiteInvoke++))

  beforeAll(() => beforeAllInvoke++)
  beforeAll(async () => Promise.resolve(beforeAllInvoke++))

  test('test 1', () => invoke++)
  test('test 2', async () => Promise.resolve(invoke++))

  afterSuite(() => afterSuiteInvoke++)
  afterSuite(async () => Promise.resolve(afterSuiteInvoke++))

  afterAll(() => afterAllInvoke++)
  afterAll(async () => Promise.resolve(afterAllInvoke++))

  await run()

  assert.equal(invoke, 2)
  assert.equal(beforeSuiteInvoke, 2)
  assert.equal(afterSuiteInvoke, 2)
  assert.equal(beforeAllInvoke, 2)
  assert.equal(afterAllInvoke, 2)

})().catch((e) => {
  console.error(e)
  process.exit(1)
})
