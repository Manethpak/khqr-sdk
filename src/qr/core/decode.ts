import { error } from '../helper/errors'
import { DecodedKHQRData } from '../types'
import { EMV_TAGS } from '../constants/emv'
import { parseTag } from '../helper/tags'
import { failed, Result, success } from '../helper/result'

/**
 * Subtag mapping interface
 */
interface SubtagMapping {
  tag: string
  subtag: string
  name: string
}

/**
 * Subtag mappings for parsing nested data using EMV_TAGS constants
 */
const SUBTAG_MAPPINGS: SubtagMapping[] = [
  // Tag 29/30 - Merchant Account Information
  {
    tag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_INDIVIDUAL,
    subtag: EMV_TAGS.BAKONG_ACCOUNT_IDENTIFIER,
    name: 'bakongAccountID',
  },
  {
    tag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_INDIVIDUAL,
    subtag: EMV_TAGS.INDIVIDUAL_ACCOUNT_INFORMATION,
    name: 'accountInformation',
  },
  {
    tag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_INDIVIDUAL,
    subtag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_ACQUIRING_BANK,
    name: 'acquiringBank',
  },
  {
    tag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT,
    subtag: EMV_TAGS.BAKONG_ACCOUNT_IDENTIFIER,
    name: 'bakongAccountID',
  },
  {
    tag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT,
    subtag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT_ID,
    name: 'merchantID',
  },
  {
    tag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT,
    subtag: EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_ACQUIRING_BANK,
    name: 'acquiringBank',
  },

  // Tag 62 - Additional Data
  {
    tag: EMV_TAGS.ADDITIONAL_DATA_TAG,
    subtag: EMV_TAGS.BILLNUMBER_TAG,
    name: 'billNumber',
  },
  {
    tag: EMV_TAGS.ADDITIONAL_DATA_TAG,
    subtag: EMV_TAGS.ADDITIONAL_DATA_FIELD_MOBILE_NUMBER,
    name: 'mobileNumber',
  },
  {
    tag: EMV_TAGS.ADDITIONAL_DATA_TAG,
    subtag: EMV_TAGS.STORELABEL_TAG,
    name: 'storeLabel',
  },
  {
    tag: EMV_TAGS.ADDITIONAL_DATA_TAG,
    subtag: EMV_TAGS.TERMINAL_TAG,
    name: 'terminalLabel',
  },
  {
    tag: EMV_TAGS.ADDITIONAL_DATA_TAG,
    subtag: EMV_TAGS.PURPOSE_OF_TRANSACTION,
    name: 'purposeOfTransaction',
  },

  // Tag 64 - Language Template
  {
    tag: EMV_TAGS.MERCHANT_INFORMATION_LANGUAGE_TEMPLATE,
    subtag: EMV_TAGS.LANGUAGE_PREFERENCE,
    name: 'languagePreference',
  },
  {
    tag: EMV_TAGS.MERCHANT_INFORMATION_LANGUAGE_TEMPLATE,
    subtag: EMV_TAGS.MERCHANT_NAME_ALTERNATE_LANGUAGE,
    name: 'merchantNameAlternateLanguage',
  },
  {
    tag: EMV_TAGS.MERCHANT_INFORMATION_LANGUAGE_TEMPLATE,
    subtag: EMV_TAGS.MERCHANT_CITY_ALTERNATE_LANGUAGE,
    name: 'merchantCityAlternateLanguage',
  },

  // Tag 99 - Timestamp
  {
    tag: EMV_TAGS.TIMESTAMP_TAG,
    subtag: EMV_TAGS.CREATION_TIMESTAMP,
    name: 'creationTimestamp',
  },
  {
    tag: EMV_TAGS.TIMESTAMP_TAG,
    subtag: EMV_TAGS.EXPIRATION_TIMESTAMP,
    name: 'expirationTimestamp',
  },
]

/**
 * Parse subtags from a tag value
 */
function parseSubtags(
  tagValue: string,
  parentTag: string
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  let remainingValue = tagValue

  while (remainingValue.length > 0) {
    try {
      const parsed = parseTag(remainingValue)
      const mapping = SUBTAG_MAPPINGS.find(
        (m) => m.tag === parentTag && m.subtag === parsed.tag
      )

      if (mapping) {
        // Handle special case for merchant tag 30 where accountInformation becomes merchantID
        const fieldName =
          parentTag === '30' && mapping.name === 'accountInformation'
            ? 'merchantID'
            : mapping.name

        // Convert timestamps to numbers if they're timestamp fields
        if (
          fieldName === 'creationTimestamp' ||
          fieldName === 'expirationTimestamp'
        ) {
          result[fieldName] = parseInt(parsed.value, 10)
        } else {
          result[fieldName] = parsed.value
        }
      }

      remainingValue = parsed.remainingString
    } catch {
      break
    }
  }

  return result
}

/**
 * Decode a KHQR string into its components
 *
 * @param qrString - The KHQR string to decode
 * @returns Decoded KHQR data or error
 */
export function decodeKHQR(qrString: string): Result<DecodedKHQRData> {
  try {
    if (!qrString || typeof qrString !== 'string') {
      return failed<DecodedKHQRData>(error.invalidQRString())
    }

    const parsedTags: Record<string, string> = {}
    let remainingQR = qrString
    let lastTag = ''
    let _merchantType: '29' | '30' | null = null

    // Parse all tags from the QR string
    while (remainingQR.length > 0) {
      try {
        const parsed = parseTag(remainingQR)
        let currentTag = parsed.tag

        // Prevent infinite loops
        if (currentTag === lastTag) {
          break
        }

        // Handle merchant account information tags
        if (currentTag === EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT) {
          _merchantType = EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT
        } else if (
          currentTag === EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_INDIVIDUAL
        ) {
          _merchantType = EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_INDIVIDUAL
        }

        // Only process known EMV tags
        const validTags = Object.values(EMV_TAGS) as string[]
        if (validTags.includes(currentTag)) {
          parsedTags[parsed.tag] = parsed.value
        }

        remainingQR = parsed.remainingString
        lastTag = parsed.tag
      } catch (err) {
        const processedLength = qrString.length - remainingQR.length
        const details =
          err instanceof Error
            ? {
                cause: err.message,
                index: processedLength,
                segment: remainingQR.slice(0, 16),
              }
            : {
                index: processedLength,
                segment: remainingQR.slice(0, 16),
              }

        return failed<DecodedKHQRData>(error.invalidFormat('qrString', details))
      }
    }

    // Initialize result object
    const result: DecodedKHQRData = {}

    // Process each parsed tag using EMV_TAGS constants
    Object.entries(parsedTags).forEach(([tag, value]) => {
      switch (tag) {
        case EMV_TAGS.PAYLOAD_FORMAT_INDICATOR:
          result.payloadFormatIndicator = value
          break

        case EMV_TAGS.POINT_OF_INITIATION_METHOD:
          result.pointOfInitiationMethod = value
          break

        case EMV_TAGS.UNIONPAY_MERCHANT_ACCOUNT:
          result.unionPayMerchant = value
          break

        case EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_INDIVIDUAL:
        case EMV_TAGS.MERCHANT_ACCOUNT_INFORMATION_MERCHANT: {
          const subtagData = parseSubtags(value, tag)
          // Ensure bakongAccountID is present for type safety
          if (subtagData.bakongAccountID) {
            result.merchantAccountInfo = {
              bakongAccountID: subtagData.bakongAccountID as string,
              ...result.merchantAccountInfo,
              ...subtagData,
            }
          }
          break
        }

        case EMV_TAGS.MERCHANT_CATEGORY_CODE:
          result.merchantCategoryCode = value
          break

        case EMV_TAGS.TRANSACTION_CURRENCY:
          result.transactionCurrency = value
          break

        case EMV_TAGS.TRANSACTION_AMOUNT:
          result.transactionAmount = value
          break

        case EMV_TAGS.COUNTRY_CODE:
          result.countryCode = value
          break

        case EMV_TAGS.MERCHANT_NAME:
          result.merchantName = value
          break

        case EMV_TAGS.MERCHANT_CITY:
          result.merchantCity = value
          break

        case EMV_TAGS.ADDITIONAL_DATA_TAG:
          result.additionalData = parseSubtags(value, tag)
          break

        case EMV_TAGS.MERCHANT_INFORMATION_LANGUAGE_TEMPLATE:
          result.languageTemplate = parseSubtags(value, tag)
          break

        case EMV_TAGS.TIMESTAMP_TAG: {
          const timestampData = parseSubtags(value, tag)
          if (
            timestampData.creationTimestamp ||
            timestampData.expirationTimestamp
          ) {
            result.timestamp = timestampData as {
              creationTimestamp: number
              expirationTimestamp: number
            }
          }
          break
        }

        case EMV_TAGS.CRC:
          result.crc = value
          break
      }
    })

    return success(result)
  } catch (err) {
    const details =
      err instanceof Error
        ? { cause: err.message }
        : err
          ? { cause: String(err) }
          : undefined

    return failed<DecodedKHQRData>(error.invalidFormat('qrString', details))
  }
}
