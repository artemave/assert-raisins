(async () => {
  const {test, run} = require('..')
  const assert = require('assert')

  let invoke = 0

  test('test 1', () => invoke++)
  test('test 2', async () => Promise.resolve(invoke++))

  await run()

  assert.equal(invoke, 2)

})().catch((e) => {
  console.error(e)
  process.exit(1)
})
