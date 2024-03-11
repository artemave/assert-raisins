#!/usr/bin/env node

import cluster from 'node:cluster'
import parseArgv from '../lib/parseArgv.js'
import { run } from '../lib/run.js'
import ClusterJobProcessor from '../lib/ClusterJobProcessor.js'

const { files, options } = parseArgv(process.argv.slice(2))

if (cluster.isPrimary) {
  if (options.help) {
    console.info('Usage: ars [files]')
    process.exit()
  }

  if (!files.length) {
    console.error('No test files given/found.')
    process.exit(1)
  }

  if (files.length === 1) {
    await import(files[0])

    try {
      const success = await run(options)
      process.exit(success ? 0 : 1)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  } else {
    const results = await ClusterJobProcessor.addJobs(files)
    process.exit(results.every(Boolean) ? 0 : 1)
  }
} else {
  ClusterJobProcessor.processJobs(async job => {
    await import(job.payload)
    return run()
  })
}
