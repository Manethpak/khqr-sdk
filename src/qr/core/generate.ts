import { createHash } from 'crypto'
import {
  IndividualInfo,
  MerchantInfo,
  QRResult,
  CurrencyType,
  MerchantType,
} from '@/qr/types'

import { tag } from '@/qr/helper/tags'
import { calculateCRC16 } from '@/qr/helper/crc'
import { validators } from '@/qr/helper/validator'
import { KHQRError, error } from '@/qr/helper/errors'
import { failed, Result, success } from '@/qr/helper/result'

/**
 * Smart KHQR generation function that automatically determines account type
 * @param info - Account information (Individual or Merchant)
 * @returns QR result or error
 */
export function generateKHQR(
  info: IndividualInfo | MerchantInfo
): Result<QRResult> {
  try {
    // Determine account type automatically
    const accountType: MerchantType = validators.isMerchantInfo(info)
      ? 'merchant'
      : 'individual'

    // Validate input based on type
    const validation =
      accountType === 'merchant'
        ? validators.validateMerchantInfo(info as MerchantInfo)
        : validators.validateIndividualInfo(info as IndividualInfo)

    if (!validation.isValid) {
      return failed<QRResult>(error.invalidFormat(validation.errors.join(', ')))
    }

    // Set defaults
    const currency: CurrencyType = info.currency || 'KHR'
    const isStaticQR = !info.amount || info.amount === 0

    // Build QR string step by step
    let qrData = ''

    // Required tags
    qrData += tag.payloadFormatIndicator()
    qrData += tag.pointOfInitiationMethod(isStaticQR)
    qrData += tag.merchantAccountInformation(accountType, info)
    qrData += tag.merchantCategoryCode(info.merchantCategoryCode)
    qrData += tag.transactionCurrency(currency)

    // Optional amount (only for dynamic QR)
    if (!isStaticQR && info.amount) {
      qrData += tag.transactionAmount(info.amount, currency)
    }

    qrData += tag.countryCode()
    qrData += tag.merchantName(info.merchantName)
    qrData += tag.merchantCity(info.merchantCity)

    // Optional additional data
    const additionalData = {
      billNumber: info.billNumber,
      mobileNumber: info.mobileNumber,
      storeLabel: info.storeLabel,
      terminalLabel: info.terminalLabel,
      purposeOfTransaction: info.purposeOfTransaction,
    }

    if (Object.values(additionalData).some((value) => value)) {
      qrData += tag.additionalData(additionalData)
    }

    // Optional language template
    const languageTemplate = {
      languagePreference: info.languagePreference,
      merchantNameAlternateLanguage: info.merchantNameAlternateLanguage,
      merchantCityAlternateLanguage: info.merchantCityAlternateLanguage,
    }

    if (Object.values(languageTemplate).some((value) => value)) {
      qrData += tag.languageTemplate(languageTemplate)
    }

    // Optional UPI merchant account (tag 15)
    if (info.upiMerchantAccount) {
      // Insert UPI merchant account after point of initiation method (tag 01)
      const pointOfInitPos = qrData.indexOf(
        tag.pointOfInitiationMethod(isStaticQR)
      )
      const pointOfInitLength = tag.pointOfInitiationMethod(isStaticQR).length
      const beforeUPI = qrData.substring(0, pointOfInitPos + pointOfInitLength)
      const afterUPI = qrData.substring(pointOfInitPos + pointOfInitLength)
      qrData =
        beforeUPI +
        tag.unionpayMerchantAccount(info.upiMerchantAccount) +
        afterUPI
    }

    // Optional timestamp for dynamic QR
    if (!isStaticQR && info.expirationTimestamp) {
      const currentTimestamp = Math.floor(Date.now() / 1000)
      qrData += tag.timestamp(currentTimestamp, info.expirationTimestamp)
    }

    // Calculate and append CRC
    const crcValue = calculateCRC16(qrData + '6304')
    qrData += tag.crc(crcValue)

    // Generate MD5 hash for the QR string
    const md5Hash = createHash('md5').update(qrData).digest('hex')

    return success<QRResult>({
      qr: qrData,
      md5: md5Hash,
    })
  } catch (err) {
    if (err instanceof KHQRError) {
      return failed<QRResult>(err)
    }
    return failed<QRResult>(
      error.invalidFormat(
        `Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    )
  }
}
