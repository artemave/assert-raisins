(async () => {
  const {test, run} = require('..')
  const assert = require('assert')

  let invoke = 0

  test.only('test 1', () => invoke++)
  test.only('test 3', () => invoke++)
  test('test 2', async () => Promise.resolve(invoke++))

  await run()

  assert.equal(invoke, 1)

})().catch((e) => {
  console.error(e)
  process.exit(1)
})
