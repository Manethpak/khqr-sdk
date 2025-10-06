/**
 * Simplified EMV tag builders for KHQR - Implementation included
 */

import {
  EMV_TAGS,
  EMV_DEFAULTS,
  QR_TYPE_INDICATORS,
  CURRENCY_CODES,
} from '../constants/emv'

import {
  CurrencyType,
  MerchantType,
  IndividualInfo,
  MerchantInfo,
} from '../types/core.type'

/**
 * Basic tag structure
 */
export interface Tag {
  tag: string
  length: string
  value: string
}

/**
 * Tag parsing result
 */
export interface TagParseResult {
  tag: string
  length: number
  value: string
  remainingString: string
}

/**
 * Core utility function to format EMV tags
 */
export function formatTag(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0')
  return `${tag}${length}${value}`
}

/**
 * Parse a single tag from QR string
 */
export function parseTag(data: string, offset: number = 0): TagParseResult {
  if (data.length < offset + 4) {
    throw new Error('Invalid tag format: insufficient length')
  }

  const tag = data.substring(offset, offset + 2)
  const length = parseInt(data.substring(offset + 2, offset + 4), 10)
  const value = data.substring(offset + 4, offset + 4 + length)
  const remainingString = data.substring(offset + 4 + length)

  return {
    tag,
    length,
    value,
    remainingString,
  }
}

/**
 * Tag Builder Functions - Simple and Direct
 */

/**
 * Create Payload Format Indicator tag (00)
 */
export function createPayloadFormatIndicator(): string {
  return formatTag(
    EMV_TAGS.PAYLOAD_FORMAT_INDICATOR,
    EMV_DEFAULTS.PAYLOAD_FORMAT_INDICATOR
  )
}

/**
 * Create Point of Initiation Method tag (01)
 */
export function createPointOfInitiationMethod(isStatic: boolean): string {
  const value = isStatic
    ? QR_TYPE_INDICATORS.STATIC_QR
    : QR_TYPE_INDICATORS.DYNAMIC_QR
  return formatTag(EMV_TAGS.POINT_OF_INITIATION_METHOD, value)
}

/**
 * Create Merchant Account Information tag (29 for individual, 30 for merchant)
 */
export function createMerchantAccountInformation(
  type: MerchantType,
  info: IndividualInfo | MerchantInfo
): string {
  const tag =
    type === 'individual'
      ? EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_INDIVIDUAL
      : EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT

  let subTags = ''

  // Bakong Account ID (required)
  subTags += formatTag(EMV_TAGS.BAKONG_ACCOUNT_IDENTIFIER, info.bakongAccountID)

  if (type === 'merchant') {
    const merchantInfo = info as MerchantInfo
    // Merchant ID for merchant type
    if (merchantInfo.merchantID) {
      subTags += formatTag(
        EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT_ID,
        merchantInfo.merchantID
      )
    }
    // Acquiring Bank for merchant type
    if (merchantInfo.acquiringBank) {
      subTags += formatTag(
        EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_ACQUIRING_BANK,
        merchantInfo.acquiringBank
      )
    }
  } else {
    // Account Information for individual type (optional)
    if (info.accountInformation) {
      subTags += formatTag(
        EMV_TAGS.INDIVIDUAL_ACCOUNT_INFORMATION,
        info.accountInformation
      )
    }
    // Acquiring Bank for individual type (optional)
    if (info.acquiringBank) {
      subTags += formatTag(
        EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_ACQUIRING_BANK,
        info.acquiringBank
      )
    }
  }

  return formatTag(tag, subTags)
}

/**
 * Create UnionPay Merchant Account tag (15)
 */
export function createUnionpayMerchantAccount(accountInfo: string): string {
  return formatTag(EMV_TAGS.UNIONPAY_MERCHANT_ACCOUNT, accountInfo)
}

/**
 * Create Merchant Category Code tag (52)
 */
export function createMerchantCategoryCode(categoryCode?: string): string {
  const code = categoryCode || EMV_DEFAULTS.MERCHANT_CATEGORY_CODE
  return formatTag(EMV_TAGS.MERCHANT_CATEGORY_CODE, code)
}

/**
 * Create Transaction Currency tag (53)
 */
export function createTransactionCurrency(
  currency: CurrencyType = 'KHR'
): string {
  const currencyCode =
    currency === 'KHR' ? CURRENCY_CODES.KHR : CURRENCY_CODES.USD
  return formatTag(EMV_TAGS.TRANSACTION_CURRENCY, currencyCode)
}

/**
 * Create Transaction Amount tag (54)
 */
export function createTransactionAmount(
  amount: number,
  currency: CurrencyType
): string {
  let formattedAmount: string

  if (currency === 'KHR') {
    // KHR amounts must be whole numbers
    formattedAmount = Math.round(amount).toString()
  } else {
    // USD amounts can have up to 2 decimal places
    formattedAmount = amount.toFixed(2)
  }

  return formatTag(EMV_TAGS.TRANSACTION_AMOUNT, formattedAmount)
}

/**
 * Create Country Code tag (58)
 */
export function createCountryCode(): string {
  return formatTag(EMV_TAGS.COUNTRY_CODE, EMV_DEFAULTS.COUNTRY_CODE)
}

/**
 * Create Merchant Name tag (59)
 */
export function createMerchantName(name: string): string {
  return formatTag(EMV_TAGS.MERCHANT_NAME, name)
}

/**
 * Create Merchant City tag (60)
 */
export function createMerchantCity(city?: string): string {
  const merchantCity = city || EMV_DEFAULTS.MERCHANT_CITY
  return formatTag(EMV_TAGS.MERCHANT_CITY, merchantCity)
}

/**
 * Create Additional Data tag (62)
 */
export function createAdditionalData(additionalInfo: {
  billNumber?: string
  mobileNumber?: string
  storeLabel?: string
  terminalLabel?: string
  purposeOfTransaction?: string
}): string {
  let subTags = ''

  if (additionalInfo.billNumber) {
    subTags += formatTag(EMV_TAGS.BILLNUMBER_TAG, additionalInfo.billNumber)
  }
  if (additionalInfo.mobileNumber) {
    subTags += formatTag(
      EMV_TAGS.ADDITIONAL_DATA_FIELD_MOBILE_NUMBER,
      additionalInfo.mobileNumber
    )
  }
  if (additionalInfo.storeLabel) {
    subTags += formatTag(EMV_TAGS.STORELABEL_TAG, additionalInfo.storeLabel)
  }
  if (additionalInfo.terminalLabel) {
    subTags += formatTag(EMV_TAGS.TERMINAL_TAG, additionalInfo.terminalLabel)
  }
  if (additionalInfo.purposeOfTransaction) {
    subTags += formatTag(
      EMV_TAGS.PURPOSE_OF_TRANSACTION,
      additionalInfo.purposeOfTransaction
    )
  }

  return subTags ? formatTag(EMV_TAGS.ADDITIONAL_DATA_TAG, subTags) : ''
}

/**
 * Create Merchant Information Language Template tag (64)
 */
export function createLanguageTemplate(languageInfo: {
  languagePreference?: string
  merchantNameAlternateLanguage?: string
  merchantCityAlternateLanguage?: string
}): string {
  let subTags = ''

  if (languageInfo.languagePreference) {
    subTags += formatTag(
      EMV_TAGS.LANGUAGE_PREFERENCE,
      languageInfo.languagePreference
    )
  }
  if (languageInfo.merchantNameAlternateLanguage) {
    subTags += formatTag(
      EMV_TAGS.MERCHANT_NAME_ALTERNATE_LANGUAGE,
      languageInfo.merchantNameAlternateLanguage
    )
  }
  if (languageInfo.merchantCityAlternateLanguage) {
    subTags += formatTag(
      EMV_TAGS.MERCHANT_CITY_ALTERNATE_LANGUAGE,
      languageInfo.merchantCityAlternateLanguage
    )
  }

  return subTags
    ? formatTag(EMV_TAGS.MERCHANT_INFORMATION_LANGUAGE_TEMPLATE, subTags)
    : ''
}

/**
 * Create Timestamp tag (99)
 */
export function createTimestamp(
  creationTimestamp: number,
  expirationTimestamp: number
): string {
  let subTags = ''

  subTags += formatTag(
    EMV_TAGS.CREATION_TIMESTAMP,
    creationTimestamp.toString()
  )
  subTags += formatTag(
    EMV_TAGS.EXPIRATION_TIMESTAMP,
    expirationTimestamp.toString()
  )

  return formatTag(EMV_TAGS.TIMESTAMP_TAG, subTags)
}

/**
 * Create CRC tag (63) - Note: CRC value should be calculated separately
 */
export function createCRCTag(crcValue: string): string {
  return formatTag(EMV_TAGS.CRC, crcValue)
}

/**
 * Tag Factory - Convenient object for creating tags
 */
export const tag = {
  payloadFormatIndicator: createPayloadFormatIndicator,
  pointOfInitiationMethod: createPointOfInitiationMethod,
  merchantAccountInformation: createMerchantAccountInformation,
  unionpayMerchantAccount: createUnionpayMerchantAccount,
  merchantCategoryCode: createMerchantCategoryCode,
  transactionCurrency: createTransactionCurrency,
  transactionAmount: createTransactionAmount,
  countryCode: createCountryCode,
  merchantName: createMerchantName,
  merchantCity: createMerchantCity,
  additionalData: createAdditionalData,
  languageTemplate: createLanguageTemplate,
  timestamp: createTimestamp,
  crc: createCRCTag,
} as const
