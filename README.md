# Assert-raisins

Minimalistic, debugger friendly test runner for Node.

## Features

- fast
- parallel (when running more than test file)
- runs test for a line number (failing tests can be rerun by copying a line from a stacktrace)
- no nesting
- no separate `after*` callbacks (instead each `before*` can register cleanup)
- esm
- typescript types included

## Usage

Install:

    npm i --save-dev assert-raisins


Write a test `test/firstTest.js`:

```javascript
import { test } from 'assert-raisins'
import assert from 'node:assert'

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
- `beforeAll()` to run some code before all tests in a file

Each hook callback is passed a cleanup function:

```javascript
beforeEach(async (cleanup) => {
  const server = new Server()
  await server.start()

  // can be invoked multiple times
  cleanup(async () => await server.stop())
})
```
