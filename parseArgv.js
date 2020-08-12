const glob = require('glob')
const fs = require('fs')
const path = require('path')
const getEnclosingTestName = require('./getEnclosingTestName')

function isDoncArg(arg) {
  return arg.match(/--only=/)
}

module.exports = function parseArgv(argv) {
  const child_args = []
  const donc_args = []
  let skip_require_next_file = false

  for (const arg of argv) {
    if (isDoncArg(arg)) {
      donc_args.push(arg)
    } else if (skip_require_next_file) {
      child_args.push(arg)
    } else {
      const pathWithLineNumberMatch = arg.match(/(.*):(\d+)$/)
      if (pathWithLineNumberMatch) {
        const fileContents = fs.readFileSync(`./${pathWithLineNumberMatch[1]}`, { encoding: 'utf-8' })
        const testName = getEnclosingTestName(fileContents, pathWithLineNumberMatch[2])

        donc_args.push(`--only=${testName}`)
        child_args.push('-r', `./${pathWithLineNumberMatch[1]}`)
      } else {
        const files = glob.sync(arg)

        if (files.length) {
          for (const file of files) {
            child_args.push('-r', `./${file}`)
          }
        } else {
          child_args.push(arg)
        }
      }
    }

    skip_require_next_file = arg === '-r'
  }

  child_args.push(path.join(__dirname, 'runner.js'))
  child_args.push(...donc_args)

  return child_args
}
