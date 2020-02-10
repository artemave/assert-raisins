# Donc

A minimalistic test runner for Node.

Motivation: avoid dynamicly requiring test files. Why? So that `donc --inspect-brk` has your project loaded on the first break point.

## Usage

Install:

    npm i --dev donc

Write a test `test/firstTest.js`:

```javascript
const {test} = require('donc')
const assert = require('assert')

test('firstTest 1', () => {
  assert.ok(true)
})

test('firstTest 2', async () => {
  assert.equal(1, 2)
})
```

Run all tests:

    ./node_modules/.bin/donc test/**/*Test.js

Other things available are: `test.only()`, `beforeAll()`, `afterAll()`, `beforeSuite()` and `afterSuite()`.
