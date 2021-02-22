import {test, run} from '../..'
import assert from 'assert'

(async () => {
  let invoke = 0
  let testName

  test.only('test 1', () => { invoke++; testName = 'test1' })
  test.only('test 3', () => { invoke++; testName = 'test3' })
  test('test 2', async () => Promise.resolve(invoke++))

  await run()

  assert.equal(invoke, 1)
  assert.equal(testName, 'test1')
})()
