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
export type ErrorDetails = Record<string, unknown> | undefined

export class KHQRError extends Error {
  public readonly code: ErrorCode
  public readonly details?: ErrorDetails

  constructor(code: ErrorCode, message: string, details?: ErrorDetails) {
    super(message)
    this.name = 'KHQRError'
    this.code = code
    this.details = details
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details ?? null,
    }
  }
}

/**
 * Error creation helpers
 */
export const error = {
  invalidQR: (message = 'Invalid QR code format', details?: ErrorDetails) =>
    new KHQRError(ERROR_CODES.INVALID_QR, message, details),

  invalidAmount: (
    message = 'Invalid amount for currency',
    details?: ErrorDetails
  ) => new KHQRError(ERROR_CODES.INVALID_AMOUNT, message, details),

  invalidAccount: (
    message = 'Invalid account information',
    details?: ErrorDetails
  ) => new KHQRError(ERROR_CODES.INVALID_ACCOUNT, message, details),

  requiredField: (field: string, details?: ErrorDetails) =>
    new KHQRError(
      ERROR_CODES.REQUIRED_FIELD,
      `Field '${field}' is required`,
      details ?? { field }
    ),

  invalidFormat: (fields: string, details?: ErrorDetails) =>
    new KHQRError(
      ERROR_CODES.INVALID_FORMAT,
      `Invalid or Missing fields '${fields}'`,
      details
    ),

  invalidCRC: (details?: ErrorDetails) =>
    new KHQRError(ERROR_CODES.CRC_INVALID, 'CRC checksum is invalid', details),

  invalidQRString: (details?: ErrorDetails) =>
    new KHQRError(
      ERROR_CODES.INVALID_QR,
      'QR string must be a non-empty string',
      details
    ),
}
