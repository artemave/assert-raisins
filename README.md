# Donc [![Codeship Status for artemave/donc](https://app.codeship.com/projects/26cc3310-4549-0138-6faa-623c142c33e2/status?branch=master)](https://app.codeship.com/projects/388462)

Minimalistic, debugger friendly test runner for Node.

## Features

- fast
- runs test for a line number (failing tests can be rerun by copying a line from a stacktrace)
- loads test files before initial `--inspect-brk` breakpoint (breakpoints can be set when the debugger pops up, as an alternative to inserting `debugger` everywhere)
- no nesting (nested `describe`/`context`s spread test setup all over the test file, making it difficult to follow)
- no separate `after*` callbacks (instead each `before*` can register cleanup)

## Usage

Install:

    npm i --save-dev donc


Write a test `test/firstTest.js`:

```javascript
const {test} = require('donc')
const assert = require('assert')

test('first passing test', () => {
  assert.ok(true)
})

test('first failing test', async () => {
  assert.equal(1, 2)
})
```

Run all tests:

    ./node_modules/.bin/donc test/**/*Test.js

Run individual test:

    # by line number
    ./node_modules/.bin/donc test/someTest.js:123
    
    # or using --only option
    ./node_modules/.bin/donc --only='when bananas' test/someTest.js

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
