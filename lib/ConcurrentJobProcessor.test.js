import { execSync } from 'child_process'
import fs from 'node:fs'
import { it, describe, beforeEach } from 'node:test'
import assert from 'node:assert'

const code = `import ConcurrentJobProcessor from '../../lib/ConcurrentJobProcessor.js'

const jobFn = async () => {
  return new Promise((resolve) => {
    // setTimeout guarantees that both workers will be used
    setTimeout(() => {
      parentPort.postMessage({ TEST_WORKER_ID: process.env.TEST_WORKER_ID })
      resolve()
    }, 20)
  })
}

const results = []
await ConcurrentJobProcessor.processJobs(
  [...Array(2)],
  jobFn.toString(),
  msg => {
    results.push(msg)
  }
)
console.log(JSON.stringify(
  results.sort((a, b) => a.TEST_WORKER_ID > b.TEST_WORKER_ID ? 1 : -1)
))
process.exit()
`

describe('ConcurrentJobProcessor', () => {
  beforeEach(function() {
    fs.rmSync('./test/tmp', { recursive: true, force: true })
    fs.mkdirSync('./test/tmp', { recursive: true })
    fs.writeFileSync('./test/tmp/code.js', code)
  })

  it('runs parallel jobs', function() {
    const stdout = execSync('node ./test/tmp/code.js', { encoding: 'utf-8' })
    assert.equal(stdout.trim(), JSON.stringify([ { TEST_WORKER_ID: '0' }, { TEST_WORKER_ID: '1' } ]))
  })
})
