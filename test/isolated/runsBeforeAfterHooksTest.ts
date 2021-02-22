import {test, run, beforeFile, beforeEach, beforeSuite} from '../..'
import assert from 'assert'

let invoke = 0
let beforeEachInvoke = 0
let afterEachInvoke = 0
let beforeSuiteInvoke = 0
let afterSuiteInvoke = 0
let beforeFileInvoke = 0
let afterAllInvoke = 0

beforeSuite(cleanup => {
  beforeSuiteInvoke++
  cleanup(() => afterSuiteInvoke++)
  cleanup(async () => afterSuiteInvoke++)
})
beforeSuite(async () => Promise.resolve(beforeSuiteInvoke++))

beforeFile(cleanup => {
  beforeFileInvoke++
  cleanup(() => afterAllInvoke++)
  cleanup(async () => afterAllInvoke++)
})
beforeFile(async () => Promise.resolve(beforeFileInvoke++))

beforeEach(cleanup => {
  beforeEachInvoke++
  cleanup(() => afterEachInvoke++)
  cleanup(async () => afterEachInvoke++)
})
beforeEach(async () => Promise.resolve(beforeEachInvoke++))

test('test 1', () => invoke++)
test('test 2', async () => Promise.resolve(invoke++))

run().then(() => {
  assert.equal(invoke, 2)
  assert.equal(beforeSuiteInvoke, 2)
  assert.equal(afterSuiteInvoke, 2)
  assert.equal(beforeFileInvoke, 2)
  assert.equal(afterAllInvoke, 2)
  assert.equal(beforeEachInvoke, 4)
  assert.equal(afterEachInvoke, 4)
})
