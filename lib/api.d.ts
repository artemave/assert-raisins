export type TestFn = () => void | Promise<void>
export type CleanupFn = (fn: () => void | Promise<void>) => void
export type HookFn = (fn: CleanupFn) => void | Promise<void>

export interface Test {
  name: string
  fn: TestFn
}

export interface TestFile {
  tests: Array<Test>
  beforeFile: Array<HookFn>
  beforeEach: Array<HookFn>
}

export function test(name: string, fn: TestFn, testFile?: TestFile): void
export namespace test {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function only(name: string, fn: TestFn): void
}
export { test as it }

export declare function beforeSuite(fn: HookFn): void
export declare function beforeEach(fn: HookFn, testFile?: TestFile): void
export declare function beforeFile(fn: HookFn, testFile?: TestFile): void

export declare function run({ only, stdout }?: {
  only?: string
  stdout?: { write: (text: string) => void }
  suite?: Record<string, TestFile>
}): Promise<boolean | undefined>
