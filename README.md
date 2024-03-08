# Assert-raisins

Minimalistic, debugger friendly test runner for Node.

## Features

- fast
- parallel
- run test for a line number
- no nesting
- combined `before*` and `after*` hooks
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
