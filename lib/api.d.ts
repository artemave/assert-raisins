export type TestFn = () => void | Promise<void>
export type CleanupFn = (fn: () => void | Promise<void>) => void
export type HookFn = (fn: CleanupFn) => void | Promise<void>

export function test(name: string, fn: TestFn): void
export { test as it }

export declare function beforeEach(fn: HookFn): void
export declare function beforeAll(fn: HookFn): void
