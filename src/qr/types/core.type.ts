export type CurrencyType = 'KHR' | 'USD'

export type MerchantType = 'individual' | 'merchant'

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
 * Static QR information, same as BaseMerchantInfo
 */
export interface StaticInfo extends BaseMerchantInfo {}

/**
 * Merchant account information
 */
export interface MerchantInfo extends IndividualInfo {
  merchantID?: string
}

/**
 * QR generation result
 */
export interface QRResult {
  qr: string
  md5: string
}

/**
 * Decoded KHQR data structure
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
