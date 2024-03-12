import { testFileDefinition } from './run.js'

export function test(name, fn) {
  testFileDefinition.tests.push({name, fn})
}

export const it = test

export function beforeEach(fn) {
  testFileDefinition.beforeEach.push(fn)
}

export function beforeAll(fn) {
  testFileDefinition.beforeAll.push(fn)
}
