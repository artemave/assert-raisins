const {test, run} = require('../runner')

test('secondTest 1', () => {
  return 1
})

test('secondTest 2', async () => {
  return 2
})

!(async () => await run())()
