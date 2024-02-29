import {test, run} from '../../index.js'
import assert from 'assert'

(async () => {
  let invoke = 0

  test('test 1', () => invoke++)
  test('test 2', async () => Promise.resolve(invoke++))

  await run()

  assert.equal(invoke, 2)
})()
