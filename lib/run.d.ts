export type TestFn = () => void | Promise<void>
export type CleanupFn = (fn: () => void | Promise<void>) => void
export type HookFn = (fn: CleanupFn) => void | Promise<void>

interface Test {
  name: string
  fn: TestFn
}

export interface TestFile {
  tests: Array<Test>
  beforeAll: Array<HookFn>
  beforeEach: Array<HookFn>
}

export interface TestReport {
  fileName: string,
  testName: string,
  error?: Error
}

export interface Reporter {
  report(msg: TestReport): void
}

interface TestSuite {
  testFiles: Record<string, TestFile>;
}

interface RunOptions {
  only?: string;
  reporter?: Reporter;
  currentSuite?: TestSuite;
}

export function run(options?: RunOptions): Promise<boolean | undefined>
