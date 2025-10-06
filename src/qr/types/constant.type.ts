/**
 * Constant type definitions
 */
import {
  CURRENCY_CODES,
  EMV_TAGS,
  MAX_LENGTHS,
  QR_TYPE_INDICATORS,
} from '../constants'

export type EMVTag = keyof typeof EMV_TAGS
export type EMVTagValue = (typeof EMV_TAGS)[EMVTag]
export type QRTypeIndicator =
  (typeof QR_TYPE_INDICATORS)[keyof typeof QR_TYPE_INDICATORS]
export type MaxLength = (typeof MAX_LENGTHS)[keyof typeof MAX_LENGTHS]
export type CurrencyCode = (typeof CURRENCY_CODES)[keyof typeof CURRENCY_CODES]
