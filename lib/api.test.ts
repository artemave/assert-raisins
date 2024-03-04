import assert from 'node:assert'
import { test, beforeEach, beforeFile, beforeSuite, run } from './api.js'
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

    it('runs only one test', async function() {
      let invoke = 0
      let testName

      test.only('test 1', () => { invoke++; testName = 'test1' })
      test.only('test 3', () => { invoke++; testName = 'test3' })
      test('test 2', async () => { await Promise.resolve(invoke++) })

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 1)
      assert.equal(testName, 'test1')
    })

    it('runs faliing test', async function() {
      test('test 1', () => { assert.ok(false) })

      const result = await run({ stdout: { write() {} } })
      assert.deepStrictEqual(result, false)
    })
  })

  describe('beforeSuite', function() {
    it('runs once per suite', async function() {
      let invoke = 0
      const testFile1 = { tests: [], beforeFile: [], beforeEach: [] }
      const testFile2 = { tests: [], beforeFile: [], beforeEach: [] }

      beforeSuite(() => { invoke++ })

      test('test 1', () => {}, testFile1)
      test('test 2', () => {}, testFile2)

      await run({ stdout: { write() {} }, suite: { testFile1, testFile2 } })

      assert.equal(invoke, 1)
    })

    it('can cleanup after itself', async function() {
      let invoke = 0

      beforeSuite(cleanup => { cleanup(() => { invoke++ }) })
      test('test 1', () => {})

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 1)
    })

    it('can cleanup multiple times', async function() {
      let invoke = 0

      beforeSuite(cleanup => {
        cleanup(() => { invoke++ })
        cleanup(() => { invoke++ })
      })

      test('test 1', () => {})

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 2)
    })
  })

  describe('beforeFile', function() {
    it('runs once per file', async function() {
      let invoke = 0
      const testFile1 = { tests: [], beforeFile: [], beforeEach: [] }
      const testFile2 = { tests: [], beforeFile: [], beforeEach: [] }

      beforeFile(() => { invoke++ }, testFile1)
      beforeFile(() => { invoke++ }, testFile2)

      test('test 1', () => {}, testFile1)
      test('test 11', () => {}, testFile1)
      test('test 2', () => {}, testFile2)
      test('test 22', () => {}, testFile2)

      await run({ stdout: { write() {} }, suite: { testFile1, testFile2 } })

      assert.equal(invoke, 2)
    })

    it('can cleanup after itself', async function() {
      let invoke = 0

      beforeFile(cleanup => { cleanup(() => { invoke++ }) })
      test('test 1', () => {})

      await run({ stdout: { write() {} } })

      assert.equal(invoke, 1)
    })

    it('can cleanup multiple times', async function() {
      let invoke = 0

      beforeFile(cleanup => {
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
