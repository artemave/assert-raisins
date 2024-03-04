import { it, describe } from 'node:test'
import path from 'node:path'
import parseArgv from './parseArgv.js'
import assert from 'assert'

class FakeGlob {
  constructor(public files: {[key: string]: string[]}) {}

  sync(expr: string) {
    return this.files[expr] || []
  }
}

describe('parseArgv', function() {
  it('returns files to require', function() {
    const args = parseArgv(['test/*Test.js'], new FakeGlob({
      'test/*Test.js': ['./file1', './file2']
    }))
    assert.deepEqual(args, {
      file_args: ['--import=./file1', '--import=./file2'],
      node_args: [],
      ars_args: []
    })
  })

  it('throws if bad path given', function() {
    assert.throws(() => {
      parseArgv(['blablah/stuff'])
    }, /No test files found in 'blablah\/stuff'./)
  })

  it('throws when no test files are given', function() {
    assert.throws(() => {
      parseArgv([])
    }, /No test files given./)
  })

  it('knows ars args', function() {
    const args = parseArgv(['--stuff', '--only=bananas', 'test/*Test.js'], new FakeGlob({
      'test/*Test.js': ['./file1', './file2']
    }))
    assert.deepEqual(args, {
      file_args: ['--import=./file1', '--import=./file2'],
      node_args: ['--stuff'],
      ars_args: ['--only=bananas']
    })
  })
})
