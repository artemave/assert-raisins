# Assert-raisins [![Codeship Status for artemave/assert-raisins](https://app.codeship.com/projects/3127301f-c33a-4a4d-a68a-c2c0659bdfef/status?branch=master)](https://app.codeship.com/projects/430410)

Minimalistic, debugger friendly test runner for Node.

## Features

- fast
- runs test for a line number (failing tests can be rerun by copying a line from a stacktrace)
- inspector friendly (copies debug url to clipboard; loads test files before initial `--inspect-brk` breakpoint)
- no nesting (nested `describe`/`context`s spread test setup all over the test file, making it difficult to follow)
- no separate `after*` callbacks (instead each `before*` can register cleanup)
- includes typescript type declarations

## Usage

Install:

    npm i --save-dev assert-raisins


Write a test `test/firstTest.js`:

```javascript
const {test} = require('assert-raisins')
const assert = require('assert')

test('first passing test', () => {
  assert.ok(true)
})

test('first failing test', async () => {
  assert.equal(1, 2)
})
```

Run all tests:

    ./node_modules/.bin/ars test/**/*Test.js

Run individual test:

    # by line number
    ./node_modules/.bin/ars test/someTest.js:123
    
    # or using --only option
    ./node_modules/.bin/ars --only='when bananas' test/someTest.js

Other things available:

- `it` which is an alias for `test`
- `test.only()` to run single test (also available as a command line argument: `--only='some test'`)
- `beforeEach()` to run some code before each test in a file
- `beforeFile()` to run some code before all tests in a file
- `beforeSuite()` to run some code before all tests

Each hook callback is passed a cleanup function:

```javascript
beforeEach(async (cleanup) => {
  const server = new Server()
  await server.start()

  // can be invoked multiple times
  cleanup(async () => await server.stop())
})
```
