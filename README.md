# Donc

A minimalistic test runner for Node.

## Motivation

Just about any Node test runner I've ever used loads test files from within a Node process. That's fine, but when you want to use Node debugger and you run tests with `--inspect-brk` the initial breakpoint stops before test files get required. As a result, none of your project code is present in the sources tab and it's impossible to add meaningful breakpoints.

Donc addresses that one thing. When run with `--inspect-brk`, all tests are already loaded before the initial breakpoint.

## Usage

Install:

    npm i --save-dev donc


> On OSX, you might need to `brew install bash` (donc relies on `globstar`, but the ancient version of Bash OSX ships with, does not have it)

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
