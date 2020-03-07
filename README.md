# Donc

A minimalistic test runner for Node.

Motivation: avoid dynamicly requiring test files. Why? So that `donc --inspect-brk` has your project loaded on the first break point.

## Usage

Install:

    npm i --save-dev donc

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

Other things available:

- `it` which is an alias for `test`
- `test.only()` to run single test (also available as a command line argument: `--only='some test'`)
- `beforeEach()` to run some code before each test in a file
- `beforeFile()` to run some code before all tests in a file
- `beforeSuite()` to run some code before all tests

Each hook callback is passed a cleanup function:

```javascript
beforeEach(async (clenaup) => {
  const server = new Server()
  await server.start()

  // can be invoked multiple times
  clenaup(async () => await server.stop())
})
```
