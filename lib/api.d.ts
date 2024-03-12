import { TestFile, TestFn, HookFn } from './run'

export function test(name: string, fn: TestFn, testFile?: TestFile): void
export { test as it }

export declare function beforeEach(fn: HookFn, testFile?: TestFile): void
export declare function beforeAll(fn: HookFn, testFile?: TestFile): void
