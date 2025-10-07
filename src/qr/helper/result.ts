import { ERROR_CODES, ErrorCode, KHQRError, ErrorDetails } from './errors'

export type Result<T> = {
  result: T | null
  error: KHQRError | null
}

export const success = <T>(value: T): Result<T> => ({
  result: value,
  error: null,
})

export function failed<T = never>(
  errorOrMessage: KHQRError | string,
  details?: ErrorDetails,
  code: ErrorCode = ERROR_CODES.INVALID_FORMAT
): Result<T> {
  const err =
    errorOrMessage instanceof KHQRError
      ? errorOrMessage
      : new KHQRError(code, errorOrMessage, details)

  return {
    result: null,
    error: err,
  }
}

export const wrap = async <T>(fn: () => Promise<T> | T): Promise<Result<T>> => {
  try {
    const value = await fn()
    return success(value)
  } catch (err) {
    if (err instanceof KHQRError) {
      return failed(err)
    }

    const message = err instanceof Error ? err.message : 'Unknown error'
    return failed(message)
  }
}
