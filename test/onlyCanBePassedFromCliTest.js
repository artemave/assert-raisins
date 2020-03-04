(async () => {
  const {it, run} = require('..')
  const assert = require('assert')

  let invoke = 0

  it('test 1', () => invoke++)
  it('test 3', () => invoke++)

  await run({only: 'test 1'})

  assert.equal(invoke, 1)

})().catch((e) => {
  console.error(e)
  process.exit(1)
})
