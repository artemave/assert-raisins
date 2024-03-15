export type TestFn = () => void | Promise<void>
export type CleanupFn = () => void | Promise<void>
export type HookFn = () => void | Promise<void>

export function test(name: string, fn: TestFn): void
export { test as it }

export declare function beforeEach(fn: HookFn): void
export declare function beforeAll(fn: HookFn): void
export declare function cleanup(fn: CleanupFn): void
