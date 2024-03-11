import { suite } from './run.js'

function callsites() {
  const originalPrepareStackTrace = Error.prepareStackTrace

  try {
    Error.prepareStackTrace = (_, stack) => {
      return stack.slice(1)
    }
    return new Error().stack

  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace
  }
}

function getCallerModule() {
  const stack = callsites().filter(s => s.getFileName() && !s.getFileName().startsWith('node:'))

  return stack.pop()
}

function getCurrentTestFile() {
  const fileName = getCallerModule().getFileName().replace('file://' + process.cwd() + '/', '')

  if (!suite.testFiles[fileName]) {
    suite.testFiles[fileName] = {
      beforeAll: [],
      beforeEach: [],
      tests: []
    }
  }
  return suite.testFiles[fileName]
}

export function test(name, fn, testFile) {
  (testFile || getCurrentTestFile()).tests.push({name, fn})
}

export const it = test

export function beforeEach(fn, testFile) {
  (testFile || getCurrentTestFile()).beforeEach.push(fn)
}

export function beforeAll(fn, testFile) {
  (testFile || getCurrentTestFile()).beforeAll.push(fn)
}
