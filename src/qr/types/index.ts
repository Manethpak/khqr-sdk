/**
 * Simplified KHQR TypeScript types
 */

export * from './core.type'

export * from './constant.type'

/**
 * Utility types
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>
