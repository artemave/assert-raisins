import realGlob from 'fast-glob'
import path from 'node:path'
import fs from 'fs'
import getEnclosingTestName from './getEnclosingTestName.js'

const validOptions = ['--help']

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
 * @returns { { files: Array<string>, options: { help?: boolean, only?: string } } }
 */
export default function parseArgv(argv, glob = realGlob) {
  const options = {}
  const files = []

  for (const arg of argv) {
    if (validOptions.includes(arg)) {
      const [option, value] = arg.replace('--', '').split('=')
      options[option] = value || true
    } else {
      const pathWithLineNumberMatch = arg.match(/(.*):(\d+)$/)

      if (pathWithLineNumberMatch) {
        const fileContents = fs.readFileSync(pathWithLineNumberMatch[1], { encoding: 'utf-8' })
        const testName = getEnclosingTestName(fileContents, pathWithLineNumberMatch[2])

        options.only = testName
        files.push(path.resolve(pathWithLineNumberMatch[1]))
      } else {
        files.push(...glob.sync(arg, { absolute: true }))
      }
    }
  }

  return {
    files,
    options
  }
}
