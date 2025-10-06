/**
 * KHQR Constants - Essential values only
 */

// EMV constants
export * from './emv'

/**
 * KHQR specific constants
 */
export const KHQR_CONSTANTS = {
  // Default values for Cambodia
  DEFAULT_CURRENCY: 'KHR' as const,
  DEFAULT_MERCHANT_CATEGORY_CODE: '5999',
  DEFAULT_COUNTRY_CODE: 'KH',
  DEFAULT_MERCHANT_CITY: 'Phnom Penh',
} as const

/**
 * Validation patterns specific to KHQR
 */
export const VALIDATION_PATTERNS = {
  BAKONG_ACCOUNT_ID: /^[a-zA-Z0-9._@-]+$/,
  MERCHANT_ID: /^[a-zA-Z0-9._-]+$/,
  MERCHANT_CATEGORY_CODE: /^\d{4}$/,
  CURRENCY_CODE: /^(116|840)$/,
  COUNTRY_CODE: /^[A-Z]{2}$/,
  CRC_CHECKSUM: /^[0-9A-Fa-f]{4}$/,
  CRC_PATTERN: /6304[A-Fa-f0-9]{4}$/,
} as const
