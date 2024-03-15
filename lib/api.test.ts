import assert from 'node:assert'
import { test, beforeEach, beforeAll, cleanup } from './api.js'
import { run, TestReport, Reporter } from './run.js'
import { it, describe, beforeEach as nodeBeforeEach } from 'node:test'

const context = describe

describe('api', function() {
  let reporter: Reporter
  let messages: Array<TestReport>

  nodeBeforeEach(function() {
    messages = []
    reporter = {
      report: msg => messages.push(msg)
    }
  })

  describe('run', function() {
    it('runs tests', async function() {
      let invoke = 0

      test('test 1', () => { invoke++ })
      test('test 2', async () => { await Promise.resolve(invoke++) })

      await run({ fileName: 'file1', reporter })

      assert.equal(invoke, 2)
      assert.deepStrictEqual(
        messages,
        [
          {
            fileName: 'file1',
            testName: 'test 1'
          },
          {
            fileName: 'file1',
            testName: 'test 2'
          }
        ]
      )
    })

    it('runs failing test', async function() {
      test('test 1', () => { assert.ok(false) })

      await run({ fileName: 'file2', reporter })

      assert.equal(messages.length, 1)
      assert.equal(messages[0].fileName, 'file2')
      assert.equal(messages[0].error?.constructor.name, 'AssertionError')
    })

    describe('cleanup', function() {
      it('cleans up only for this test', async function() {
        let invoke = 0
        test('test 1', () => {
          cleanup(() => { invoke++ })
        })
        test('test 2', () => {})

        await run({ fileName: 'file3', reporter })

        assert.equal(invoke, 1)
      })
    })

    describe('only', function() {
      it('runs only test with the matching name', async function() {
        test('test 1', () => {})
        test('test 2', () => {})

        await run({ only: 'test 1', fileName: 'file3', reporter })

        assert.equal(messages.length, 1)
        assert.equal(messages[0].testName, 'test 1')
      })

      context('no matching test', function() {
        it('throws an error', function() {
          test('test 1', () => {})

          return assert.rejects(
            async () => await run({ only: 'test 2', fileName: 'file3', reporter }),
            { message: 'No tests found' }
          )
        })
      })
    })
  })

  describe('beforeAll', function() {
    it('runs once per file', async function() {
      let invoke = 0
      beforeAll(() => { invoke++ })

      test('test 1', () => {
        assert.equal(invoke, 1)
      })
      test('test 11', () => {
        assert.equal(invoke, 1)
      })

      await run({ reporter, fileName: 'file3' })
    })

    it('cleans up after all tests', async function() {
      let invoke = 0

      beforeAll(() => { cleanup(() => { invoke++ }) })
      test('test 1', () => {
        assert.equal(invoke, 0)
      })

      await run({ reporter, fileName: 'file3' })

      assert.equal(invoke, 1)
    })

    it('can cleanup multiple times', async function() {
      let invoke = 0

      beforeAll(() => {
        cleanup(() => { invoke++ })
        cleanup(() => { invoke++ })
      })

      test('test 1', () => {})

      await run({ reporter, fileName: 'file3' })

      assert.equal(invoke, 2)
    })

    context('when it fails', function() {
      it('tests are skipped', async function() {
        const error = new Error('fail')
        beforeAll(() => { throw error })
        test('test 1', () => {})

        await run({ reporter, fileName: 'file3' })

        assert.deepStrictEqual(
          messages, [{
            fileName: 'file3',
            beforeAll: {
              error
            }
          }]
        )
      })
    })
  })

  describe('beforeEach', function() {
    it('runs before every test', async function() {
      let invoke = 0

      beforeEach(() => { invoke++ })

      test('test 1', () => {
        assert.equal(invoke, 2)
      })
      test('test 2', () => {
        assert.equal(invoke, 2)
      })

      await run({ reporter, fileName: 'file3' })
    })

    it('cleans up after each test', async function() {
      let invoke = 0

      beforeEach(() => { cleanup(() => { invoke++ }) })
      test('test 1', () => {})

      await run({ reporter, fileName: 'file3' })

      assert.equal(invoke, 1)
    })

    it('can cleanup multiple times', async function() {
      let invoke = 0

      beforeEach(() => {
        cleanup(() => { invoke++ })
        cleanup(() => { invoke++ })
      })

      test('test 1', () => {})

      await run({ reporter, fileName: 'file3' })

      assert.equal(invoke, 2)
    })

    context('when it fails', function() {
      it('tests are skipped', async function() {
        const error = new Error('fail')
        beforeEach(() => { throw error })
        test('test 1', () => {})

        await run({ reporter, fileName: 'file3' })

        assert.deepStrictEqual(
          messages, [{
            fileName: 'file3',
            beforeEach: {
              error
            }
          }]
        )
      })
    })
  })
})
