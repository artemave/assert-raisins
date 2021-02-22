import {it, run} from '../..'
import assert from 'assert'

(async () => {
  let invoke = 0

  it('test 1', () => invoke++)
  it('test 3', () => invoke++)

  await run({only: 'test 1'})

  assert.equal(invoke, 1)
})()
