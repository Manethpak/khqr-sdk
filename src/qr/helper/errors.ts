/**
 * Simplified error handling for KHQR operations
 */

export const ERROR_CODES = {
  INVALID_QR: 'INVALID_QR',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_ACCOUNT: 'INVALID_ACCOUNT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  CRC_INVALID: 'CRC_INVALID',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Simple KHQR error class
 */
export class KHQRError extends Error {
  public readonly code: ErrorCode

  constructor(code: ErrorCode, message: string) {
    super(message)
    this.name = 'KHQRError'
    this.code = code
  }
}

/**
 * Error creation helpers
 */
export const error = {
  invalidQR: (message = 'Invalid QR code format') =>
    new KHQRError(ERROR_CODES.INVALID_QR, message),

  invalidAmount: (message = 'Invalid amount for currency') =>
    new KHQRError(ERROR_CODES.INVALID_AMOUNT, message),

  invalidAccount: (message = 'Invalid account information') =>
    new KHQRError(ERROR_CODES.INVALID_ACCOUNT, message),

  requiredField: (field: string) =>
    new KHQRError(ERROR_CODES.REQUIRED_FIELD, `Field '${field}' is required`),

  invalidFormat: (field: string) =>
    new KHQRError(
      ERROR_CODES.INVALID_FORMAT,
      `Field '${field}' has invalid format`
    ),

  invalidCRC: () =>
    new KHQRError(ERROR_CODES.CRC_INVALID, 'CRC checksum is invalid'),
}
