const realGlob = require('glob')
const fs = require('fs')
const getEnclosingTestName = require('./getEnclosingTestName')

function isDoncArg(arg) {
  return arg.match(/--only=|--skip-debug-url-copy-to-clipboard/)
}

function isNodeArg(arg) {
  return !isDoncArg(arg) && arg.match(/^-/)
}

function lastArgIsRequire(args) {
  return ['-r', '--require'].includes(args.slice().pop())
}

module.exports = function parseArgv(argv, glob = realGlob) {
  const node_args = []
  const donc_args = []
  const file_args = []

  for (const arg of argv) {
    if (isDoncArg(arg)) {
      donc_args.push(arg)
    } else if (isNodeArg(arg) || lastArgIsRequire(node_args)) {
      node_args.push(arg)
    } else {
      const pathWithLineNumberMatch = arg.match(/(.*):(\d+)$/)
      if (pathWithLineNumberMatch) {
        const fileContents = fs.readFileSync(`./${pathWithLineNumberMatch[1]}`, { encoding: 'utf-8' })
        const testName = getEnclosingTestName(fileContents, pathWithLineNumberMatch[2])

        donc_args.push(`--only=${testName}`)
        file_args.push('-r', `./${pathWithLineNumberMatch[1]}`)
      } else {
        const files = glob.sync(arg)

        if (files.length) {
          for (const file of files) {
            file_args.push('-r', `./${file}`)
          }
        } else {
          throw new Error(`No test files found in '${arg}'.`)
        }
      }
    }
  }

  if (!file_args.length) {
    const files = glob.sync('test/**/*{Spec,Test}.{j,t}s')

    for (const file of files) {
      file_args.push('-r', `./${file}`)
    }
  }

  return {
    file_args,
    node_args,
    donc_args
  }
}
