export interface TestReport {
  fileName: string,
  testName: string,
  error?: Error
}

export interface Reporter {
  report(msg: TestReport): void
}

interface RunOptions {
  only?: string;
  reporter?: Reporter;
  fileName: string;
}

export function run(options?: RunOptions): Promise<void>
