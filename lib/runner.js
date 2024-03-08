import cluster from 'node:cluster'
import { run, _suite } from './api.js'
import ClusterJobProcessor from './ClusterJobProcessor.js'

const args = process.argv.reduce((result, arg) => {
  let [key, ...rest] = arg.split('=')
  const value = rest.join('=')

  key = key.replace('--', '')
  result[key] = value

  return result
}, {})

if (Object.keys(_suite).length > 1) {
  if (cluster.isPrimary) {
    const jobs = Object.entries(_suite).map(([k, v]) => ({ [k]: v }))

    const results = await ClusterJobProcessor.addJobs(jobs)
    process.exit(results.every(Boolean) ? 0 : 1)

  } else {
    ClusterJobProcessor.processJobs(job => {
      // _suite contains test/hook functions, but those are lost during ipc
      // hence get them back before passing to run
      const suite = {}
      for (const testFile in job.payload) {
        suite[testFile] = _suite[testFile]
      }
      return run({ suite })
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
