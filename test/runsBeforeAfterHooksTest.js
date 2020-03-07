(async () => {
  const {test, run, beforeAll, beforeEach, beforeSuite} = require('..')
  const assert = require('assert')

  let invoke = 0
  let beforeEachInvoke = 0
  let afterEachInvoke = 0
  let beforeSuiteInvoke = 0
  let afterSuiteInvoke = 0
  let beforeAllInvoke = 0
  let afterAllInvoke = 0

  beforeSuite(cleanup => {
    beforeSuiteInvoke++
    cleanup(() => afterSuiteInvoke++)
    cleanup(async () => afterSuiteInvoke++)
  })
  beforeSuite(async () => Promise.resolve(beforeSuiteInvoke++))

  beforeAll(cleanup => {
    beforeAllInvoke++
    cleanup(() => afterAllInvoke++)
    cleanup(async () => afterAllInvoke++)
  })
  beforeAll(async () => Promise.resolve(beforeAllInvoke++))

  beforeEach(cleanup => {
    beforeEachInvoke++
    cleanup(() => afterEachInvoke++)
    cleanup(async () => afterEachInvoke++)
  })
  beforeEach(async () => Promise.resolve(beforeEachInvoke++))

  test('test 1', () => invoke++)
  test('test 2', async () => Promise.resolve(invoke++))

  await run()

  assert.equal(invoke, 2)
  assert.equal(beforeSuiteInvoke, 2)
  assert.equal(afterSuiteInvoke, 2)
  assert.equal(beforeAllInvoke, 2)
  assert.equal(afterAllInvoke, 2)
  assert.equal(beforeEachInvoke, 4)
  assert.equal(afterEachInvoke, 4)

})().catch((e) => {
  console.error(e)
  process.exit(1)
})
