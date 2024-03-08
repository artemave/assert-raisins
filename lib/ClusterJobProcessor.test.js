import { execSync } from 'child_process'
import fs from 'node:fs'
import { it, describe, beforeEach } from 'node:test'
import assert from 'node:assert'

const code = `import cluster from 'node:cluster'
import ClusterJobProcessor from '../../lib/ClusterJobProcessor.js'

if (cluster.isPrimary) {
  const results = await ClusterJobProcessor.addJobs(new Array(2))
  console.log(JSON.stringify(
    results.sort((a, b) => a.TEST_WORKER_ID > b.TEST_WORKER_ID ? 1 : -1)
  ))
  process.exit()
} else {
  ClusterJobProcessor.processJobs(_ => {
    return new Promise((resolve) => {
      // setTimeout guarantees that both workers will be used
      setTimeout(() => {
        resolve({ TEST_WORKER_ID: process.env.TEST_WORKER_ID })
      }, 20)
    })
  })
}
`

describe('ClusterJobProcessor', () => {
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
