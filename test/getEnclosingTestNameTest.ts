import {it, run} from '../index.js'
import getEnclosingTestName from '../lib/getEnclosingTestName.js'
import assert from 'assert'

it('finds closest test/it invokation to the line number', function() {
  const code = `const assert = require('assert')
  const a = 2

  it('works', function() {
    console.log(1);
  })

  test("really works", function() {
    console.log(2);
  })

  it('stuff', function() {
    console.log(3);
  })`

  assert.equal(getEnclosingTestName(code, '2'), null)
  assert.equal(getEnclosingTestName(code, '4'), 'works')
  assert.equal(getEnclosingTestName(code, '9'), 'really works')
})

run().then(success => {
  if (success !== undefined) {
    process.exit(success ? 0 : 1)
  }
})
