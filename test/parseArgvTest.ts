import {it, run} from '..'
import parseArgv from '../lib/parseArgv'
import assert from 'assert'

class FakeGlob {
  constructor(public files: {[key: string]: string[]}) {}

  sync(expr: string) {
    return this.files[expr] || []
  }
}

it('returns files to require', function() {
  const args = parseArgv(['test/*Test.js'], new FakeGlob({
    'test/*Test.js': ['file1', 'file2']
  }))
  assert.deepEqual(args, {
    file_args: ['-r', './file1', '-r', './file2'],
    node_args: [],
    donc_args: []
  })
})

it('assumes test files are in test/ if no path given', function() {
  const args = parseArgv(['--stuff'], new FakeGlob({
    'test/**/*{Spec,Test}.{j,t}s': ['file1', 'file2']
  }))
  assert.deepEqual(args, {
    file_args: ['-r', './file1', '-r', './file2'],
    node_args: ['--stuff'],
    donc_args: []
  })
})

it('throws if bad path given', function() {
  assert.throws(() => {
    parseArgv(['blablah/stuff'])
  }, /No test files found in 'blablah\/stuff'./)
})

it('knows donc args', function() {
  const args = parseArgv(['--stuff', '--only=bananas'], new FakeGlob({
    'test/**/*{Spec,Test}.{j,t}s': ['file1', 'file2']
  }))
  assert.deepEqual(args, {
    file_args: ['-r', './file1', '-r', './file2'],
    node_args: ['--stuff'],
    donc_args: ['--only=bananas']
  })
})

run().then(success => {
  if (success !== undefined) {
    process.exit(success ? 0 : 1)
  }
})
