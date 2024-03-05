#!/usr/bin/env node

import { spawn } from 'child_process'
import path from 'path'
import parseArgv from '../lib/parseArgv.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { node_args, file_args, ars_args } = parseArgv(process.argv.slice(2))

if (['--help', '-h'].some(o => node_args.includes(o))) {
  console.info('Usage: ars [node options] [ars options] [files]')
  console.info('')
  console.info('Options:')
  console.info(' --only="bananas"                         only run test named "bananas"')
  process.exit()
}

if (!file_args.length) {
  console.error('No test files given/found.')
  process.exit(1)
}

const child_args = [
  ...node_args,
  ...file_args,
  path.join(__dirname, '..', 'lib', 'runner.js'),
  ...ars_args
]

const proc = spawn(process.execPath, child_args, { stdio: 'inherit' })

proc.on('exit', (code, signal) => {
  process.on('exit', () => {
    if (signal) {
      process.kill(process.pid, signal)
    } else {
      process.exit(code)
    }
  })
})

process.on('SIGINT', () => {
  proc.kill('SIGINT')
  proc.kill('SIGTERM') // if that didn't work, we're probably in an infinite loop, so make it die.
})
