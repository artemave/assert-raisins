import {test, run} from '../../index.js'
import assert from 'assert'

let invoke = 0
let testName: string

test.only('test 1', () => { invoke++; testName = 'test1' })
test.only('test 3', () => { invoke++; testName = 'test3' })
test('test 2', async () => Promise.resolve(invoke++))

run().then(() => {
  assert.equal(invoke, 1)
  assert.equal(testName, 'test1')
})
