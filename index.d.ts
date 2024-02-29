export function test(name: string, fn: () => void): void
export namespace test {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function only(name: string, fn: () => void): void
}
export { test as it }

export type CleanupFn = (fn: () => void) => void
export declare function beforeSuite(fn: (cleanup: CleanupFn) => void): void
export declare function beforeEach(fn: (cleanup: CleanupFn) => void): void
export declare function beforeFile(fn: (cleanup: CleanupFn) => void): void

export declare function run({ only }?: {
  only?: string
}): Promise<boolean | undefined>
