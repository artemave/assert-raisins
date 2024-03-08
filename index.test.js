import glob from 'fast-glob'
import assert from 'node:assert'
import path from 'node:path'
import { describe, it } from 'node:test'
import { execSync } from 'node:child_process'

describe('running tests', function() {
  it('works with bare node', function() {
    const stdout = execSync('node ./test/cli/someTest.js', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('✓ 1/0'))
  })

  it('works via cli using relative path', function() {
    const stdout = execSync('./bin/ars ./test/cli/someTest.js', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('✓ 1/0'))
  })

  it('works via cli using absolute path', function() {
    const stdout = execSync(`./bin/ars ${path.resolve('./test/cli/someTest.js')}`, { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('✓ 1/0'))
  })

  it('works via cli using short path', function() {
    const stdout = execSync('./bin/ars test/cli/someTest.js', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('✓ 1/0'))
  })

  it('takes a glob for list of files', function() {
    const stdout = execSync('./bin/ars "./test/cli/**/*Test.js"', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('✓ 2/0'))
    assert.match(stdout, new RegExp('✓ 1/0'))
  })

  it('sets exit 1 if test fails', function() {
    try {
      execSync('node ./test/error/failTest.js', { encoding: 'utf-8' })
    } catch (err) {
      assert(err.status === 1)
    }
  })

  it('accepts --only option', function() {
    const stdout = execSync('./bin/ars --only="also works" "test/cli/**/*Test.js"', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('✓ 1/0'))
  })

  it('accepts line number', function() {
    const stdout = execSync('./bin/ars test/cli/one/otherTest.js:9', { encoding: 'utf-8' })
    assert.match(stdout, new RegExp('✓ 1/0'))
  })

  it('runs parallel tests only once', async function() {
    execSync('./bin/ars "./test/cli/**/*Test.js"', { encoding: 'utf-8' })
    // assert that there is only one file that matches `someTest.*`
    const files = glob.sync('./test/tmp/someTest*')
    assert.equal(files.length, 1)
  })
})
