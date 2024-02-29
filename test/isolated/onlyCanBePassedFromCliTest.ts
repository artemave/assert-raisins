import { it, run } from '../../index.js'
import assert from 'assert'

let invoke = 0

it('test 1', () => invoke++)
it('test 3', () => invoke++)

run({only: 'test 1'}).then(() => {
  assert.equal(invoke, 1)
})
