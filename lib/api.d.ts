export type TestFn = () => void | Promise<void>
export type CleanupFn = (fn: () => void | Promise<void>) => void
export type HookFn = (fn: CleanupFn) => void | Promise<void>

interface Test {
  name: string
  fn: TestFn
}

interface TestFile {
  tests: Array<Test>
  beforeAll: Array<HookFn>
  beforeEach: Array<HookFn>
}

export function test(name: string, fn: TestFn, testFile?: TestFile): void
export { test as it }

export declare function beforeEach(fn: HookFn, testFile?: TestFile): void
export declare function beforeAll(fn: HookFn, testFile?: TestFile): void
