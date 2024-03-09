import cluster from 'node:cluster'
import { run, suite } from './run.js'
import ClusterJobProcessor from './ClusterJobProcessor.js'

const args = process.argv.reduce((result, arg) => {
  let [key, ...rest] = arg.split('=')
  const value = rest.join('=')

  key = key.replace('--', '')
  result[key] = value

  return result
}, {})

if (Object.keys(suite).length > 1) {
  if (cluster.isPrimary) {
    const jobs = Object.entries(suite).map(([k, v]) => ({ [k]: v }))

    const results = await ClusterJobProcessor.addJobs(jobs)
    process.exit(results.every(Boolean) ? 0 : 1)

  } else {
    ClusterJobProcessor.processJobs(job => {
      // suite contains test/hook functions, but those are lost during ipc
      // hence revive them back before passing to run
      const currentSuite = {}
      for (const testFile in job.payload) {
        currentSuite[testFile] = suite[testFile]
      }
      return run({ currentSuite })
    })
  }
} else {
  run(args).then(success => {
    process.exit(success ? 0 : 1)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
}
