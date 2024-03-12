#!/usr/bin/env node

import parseArgv from '../lib/parseArgv.js'
import { run } from '../lib/run.js'
import { StdoutReporter } from '../lib/reporters.js'
import ConcurrentJobProcessor from '../lib/ConcurrentJobProcessor.js'

const { files, options } = parseArgv(process.argv.slice(2))

if (options.help) {
  console.info('Usage: ars [files]')
  process.exit()
}

if (!files.length) {
  console.error('No test files given/found.')
  process.exit(1)
}

const reporter = new StdoutReporter()

if (files.length === 1) {
  await import(files[0])
  let code

  const fileName = files[0].replace(process.cwd() + '/', '')

  try {
    await run(Object.assign({ reporter, fileName }, options))
    code = reporter.passed ? 0 : 1
  } catch (e) {
    console.error(e)
    code = 1
  } finally {
    reporter.printSummary()
    process.exit(code)
  }
} else {
  const jobFn = `async (job) => {
    const [{ run, suite }] = await Promise.all([
      import('${import.meta.resolve('../lib/run.js')}'),
      import(job.payload)
    ])

    const fileName = job.payload.replace(process.cwd() + '/', '')
    const reporter = {
      report(msg) {
        parentPort.postMessage(msg)
      }
    }

    return run({ fileName, reporter })
  }`

  await ConcurrentJobProcessor.processJobs(
    files,
    jobFn,
    msg => {
      reporter.report(msg)
    }
  )

  reporter.printSummary()

  process.exit(reporter.passed ? 0 : 1)
}
