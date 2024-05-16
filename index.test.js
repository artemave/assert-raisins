import glob from 'fast-glob'
import assert from 'node:assert'
import path from 'node:path'
import { describe, it } from 'node:test'
import { execSync } from 'node:child_process'

describe('running tests', function() {
  it('works via cli using relative path', function() {
    const stdout = execSync('./bin/runner.js ./test/cli/someTest.js', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('1/0'))
  })

  it('works via cli using absolute path', function() {
    const stdout = execSync(`./bin/runner.js ${path.resolve('./test/cli/someTest.js')}`, { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('1/0'))
  })

  it('works via cli using short path', function() {
    const stdout = execSync('./bin/runner.js test/cli/someTest.js', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('1/0'))
  })

  it('takes a glob for list of files', function() {
    const stdout = execSync('./bin/runner.js "./test/cli/**/*Test.js"', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('2/0'))
    assert.match(stdout, new RegExp('1/0'))
  })

  it('sets exit 1 if test fails', function() {
    try {
      execSync('./bin/runner.js ./test/error/failTest.js')
    } catch (err) {
      assert(err.status === 1)
    }
  })

  it('accepts line number', function() {
    const stdout = execSync('./bin/runner.js test/cli/one/otherTest.js:9', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('1/0'))
  })

  it('runs parallel tests only once', async function() {
    execSync('./bin/runner.js "./test/cli/**/*Test.js"', { encoding: 'utf-8' })
    // assert that there is only one file that matches `someTest.*`
    const files = glob.sync('./test/tmp/someTest*')
    assert.equal(files.length, 1)
  })

  it('exposes the whole API', function () {
    const stdout = execSync('./bin/runner.js "./test/api/kitchenSinkTest.js"', {
      encoding: 'utf-8',
    })
    const logs = [
      'beforeAll',
      'beforeEach',
      'test',
      'cleanup beforeEach',
      'beforeEach',
      'it',
      'cleanup beforeEach',
      'cleanup beforeAll'
    ]
    assert.match(stdout.trim(), new RegExp(logs.join('[\\n\\s\\S]+'), 'g'))
  });
})
