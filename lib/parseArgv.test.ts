import { it, describe } from 'node:test'
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
      files: ['./file1', './file2'],
      options: {}
    })
  })

  it('accepts valid options', function() {
    const { options } = parseArgv(['--help'])
    assert(options.help)
  })

  it('ignores invalid options', function() {
    const { options } = parseArgv(['--apple'])
    assert.deepEqual(options, {})
  })

  it.todo('turns path with line number into `only` option')
})
