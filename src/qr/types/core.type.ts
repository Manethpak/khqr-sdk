/**
 * Core types and interfaces for KHQR (Khmer QR) system
 */

// Currency types
export type CurrencyType = 'KHR' | 'USD'

// Merchant types
export type MerchantType = 'individual' | 'merchant'

// QR types
export type QRType = 'static' | 'dynamic'

/**
 * Base merchant information interface
 */
export interface BaseMerchantInfo {
  bakongAccountID: string
  merchantName: string
  merchantCity: string
  currency?: CurrencyType
  amount?: number
  merchantCategoryCode?: string
}

/**
 * Individual account information
 */
export interface IndividualInfo extends BaseMerchantInfo {
  accountInformation?: string
  acquiringBank?: string
  billNumber?: string
  mobileNumber?: string
  storeLabel?: string
  terminalLabel?: string
  purposeOfTransaction?: string
  languagePreference?: string
  merchantNameAlternateLanguage?: string
  merchantCityAlternateLanguage?: string
  upiMerchantAccount?: string
  expirationTimestamp?: number
}

/**
 * Merchant account information
 */
export interface MerchantInfo extends IndividualInfo {
  merchantID: string
  acquiringBank: string
}

/**
 * QR generation result - Simple
 */
export interface QRResult {
  qr: string
  md5: string
}

/**
 * Decoded KHQR data structure - Simplified
 */
export interface DecodedKHQRData {
  payloadFormatIndicator?: string
  pointOfInitiationMethod?: string
  merchantAccountInfo?: {
    bakongAccountID: string
    merchantID?: string
    acquiringBank?: string
    accountInformation?: string
  }
  unionPayMerchant?: string
  merchantCategoryCode?: string
  transactionCurrency?: string
  transactionAmount?: string
  countryCode?: string
  merchantName?: string
  merchantCity?: string
  additionalData?: {
    billNumber?: string
    mobileNumber?: string
    storeLabel?: string
    terminalLabel?: string
    purposeOfTransaction?: string
  }
  languageTemplate?: {
    languagePreference?: string
    merchantNameAlternateLanguage?: string
    merchantCityAlternateLanguage?: string
  }
  timestamp?: {
    creationTimestamp: number
    expirationTimestamp: number
  }
  crc?: string
}

/**
 * Simple validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors?: string[]
}

/**
 * Account verification result - Simple
 */
export interface AccountVerificationResult {
  exists: boolean
  accountId: string
}

/**
 * Deep link generation result - Simple
 */
export interface DeepLinkResult {
  shortLink: string
  originalQR: string
}
