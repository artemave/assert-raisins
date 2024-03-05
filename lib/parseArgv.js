import realGlob from 'fast-glob'
import path from 'node:path'
import fs from 'fs'
import getEnclosingTestName from './getEnclosingTestName.js'

function isArsArg(arg) {
  return arg.match(/--only=/)
}

function isNodeArg(arg) {
  return !isArsArg(arg) && arg.match(/^-/)
}

function lastArgIsRequire(args) {
  return ['-r', '--require', '--loader', '--import'].includes(args.slice().pop())
}

/**
 * @interface Glob
 *
 * @function
 * @name Glob#sync
 * @param {string}
 * @returns {Array<string>}
 */

/**
 * Parses the command line arguments.
 *
 * @param {Array<string>} argv
 * @param {Glob} glob
 * @returns {void}
 */
export default function parseArgv(argv, glob = realGlob) {
  const node_args = []
  const ars_args = []
  const file_args = []

  for (const arg of argv) {
    if (isArsArg(arg)) {
      ars_args.push(arg)
    } else if (isNodeArg(arg) || lastArgIsRequire(node_args)) {
      node_args.push(arg)
    } else {
      const pathWithLineNumberMatch = arg.match(/(.*):(\d+)$/)
      if (pathWithLineNumberMatch) {
        const fileContents = fs.readFileSync(pathWithLineNumberMatch[1], { encoding: 'utf-8' })
        const testName = getEnclosingTestName(fileContents, pathWithLineNumberMatch[2])

        ars_args.push(`--only=${testName}`)
        file_args.push(`--import=${path.resolve(pathWithLineNumberMatch[1])}`)
      } else {
        const files = glob.sync(arg, { absolute: true })

        if (files.length) {
          for (const file of files) {
            file_args.push(`--import=${file}`)
          }
        } else {
          throw new Error(`No test files found in '${arg}'.`)
        }
      }
    }
  }

  if (!file_args.length) {
    throw new Error('No test files given.')
  }

  return {
    file_args,
    node_args,
    ars_args
  }
}
