import assert from 'node:assert'
import { test, beforeEach, beforeAll } from './api.js'
import { run } from './run.js'
import { it, describe } from 'node:test'

describe('api', function() {
  describe('run', function() {
    it('runs tests', async function() {
      let invoke = 0

      test('test 1', () => { invoke++ })
      test('test 2', async () => { await Promise.resolve(invoke++) })

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 2)
    })

    it('runs faliing test', async function() {
      test('test 1', () => { assert.ok(false) })

      const result = await run({ stdout: { write() {} } })
      assert.deepStrictEqual(result, false)
    })
  })

  describe('beforeAll', function() {
    it('runs once per file', async function() {
      let invoke = 0
      const testFile1 = { tests: [], beforeAll: [], beforeEach: [] }
      const testFile2 = { tests: [], beforeAll: [], beforeEach: [] }
      const currentSuite = {
        testFiles: { testFile1, testFile2 }
      }

      beforeAll(() => { invoke++ }, testFile1)
      beforeAll(() => { invoke++ }, testFile2)

      test('test 1', () => {}, testFile1)
      test('test 11', () => {}, testFile1)
      test('test 2', () => {}, testFile2)
      test('test 22', () => {}, testFile2)

      await run({ stdout: { write() {} }, currentSuite })

      assert.equal(invoke, 2)
    })

    it('can cleanup after itself', async function() {
      let invoke = 0

      beforeAll(cleanup => { cleanup(() => { invoke++ }) })
      test('test 1', () => {})

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 1)
    })

    it('can cleanup multiple times', async function() {
      let invoke = 0

      beforeAll(cleanup => {
        cleanup(() => { invoke++ })
        cleanup(() => { invoke++ })
      })

      test('test 1', () => {})

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 2)
    })
  })

  describe('beforeEach', function() {
    it('runs before every test', async function() {
      let invoke = 0

      beforeEach(() => { invoke++ })

      test('test 1', () => {})
      test('test 2', () => {})

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 2)
    })

    it('can cleanup after itself', async function() {
      let invoke = 0

      beforeEach(cleanup => { cleanup(() => { invoke++ }) })
      test('test 1', () => {})

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 1)
    })

    it('can cleanup multiple times', async function() {
      let invoke = 0

      beforeEach(cleanup => {
        cleanup(() => { invoke++ })
        cleanup(() => { invoke++ })
      })

      test('test 1', () => {})

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 2)
    })
  })
})
