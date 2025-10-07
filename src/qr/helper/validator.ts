export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Basic field validators
 */
export const validators = {
  /**
   * Validate required string field
   */
  required: (value: string | undefined, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`
    }
    return null
  },

  /**
   * Validate string length
   */
  maxLength: (
    value: string,
    maxLen: number,
    fieldName: string
  ): string | null => {
    if (value && value.length > maxLen) {
      return `${fieldName} must not exceed ${maxLen} characters`
    }
    return null
  },

  /**
   * Validate amount based on currency
   */
  amount: (amount: number | undefined, currency: string): string | null => {
    if (amount === undefined || amount === 0) return null

    if (amount < 0) return 'Amount cannot be negative'

    if (currency === 'KHR') {
      if (!Number.isInteger(amount)) {
        return 'KHR amount must be a whole number'
      }
    } else if (currency === 'USD') {
      const decimalPlaces = (amount.toString().split('.')[1] || '').length
      if (decimalPlaces > 2) {
        return 'USD amount cannot have more than 2 decimal places'
      }
    }
    return null
  },

  /**
   * Validate Bakong account ID format
   */
  bakongAccountID: (accountId: string): string | null => {
    if (!accountId) return 'Bakong account ID is required'
    if (accountId.length > 32) return 'Bakong account ID too long'
    if (!/^[a-zA-Z0-9._@-]+$/.test(accountId)) {
      return 'Bakong account ID contains invalid characters'
    }
    return null
  },

  /**
   * Validate merchant category code
   */
  merchantCategoryCode: (code: string | undefined): string | null => {
    if (code && !/^\d{4}$/.test(code)) {
      return 'Merchant category code must be 4 digits'
    }
    return null
  },

  /**
   * Validate currency
   */
  currency: (currency: string): string | null => {
    if (!['KHR', 'USD'].includes(currency)) {
      return 'Currency must be KHR or USD'
    }
    return null
  },

  /**
   * Validate expiration timestamp for dynamic QR
   */
  expirationTimestamp: (
    timestamp: number | undefined,
    qrType: string
  ): string | null => {
    if (qrType === 'dynamic') {
      if (!timestamp) return 'Expiration timestamp is required for dynamic QR'
      if (timestamp <= Date.now())
        return 'Expiration timestamp must be in the future'
    }
    return null
  },
  /**
   * Comprehensive validation for IndividualInfo
   */
  validateIndividualInfo: (info: any): ValidationResult => {
    const errors: string[] = []

    // Required fields
    const requiredError = validators.required(
      info.bakongAccountID,
      'Bakong Account ID'
    )
    if (requiredError) errors.push(requiredError)

    const nameError = validators.required(info.merchantName, 'Merchant Name')
    if (nameError) errors.push(nameError)

    const cityError = validators.required(info.merchantCity, 'Merchant City')
    if (cityError) errors.push(cityError)

    // Field validations
    const accountError = validators.bakongAccountID(info.bakongAccountID)
    if (accountError) errors.push(accountError)

    const lengthErrors = [
      validators.maxLength(info.merchantName, 25, 'Merchant Name'),
      validators.maxLength(info.merchantCity, 15, 'Merchant City'),
      validators.maxLength(info.billNumber, 25, 'Bill Number'),
      validators.maxLength(info.mobileNumber, 25, 'Mobile Number'),
      validators.maxLength(info.storeLabel, 25, 'Store Label'),
      validators.maxLength(info.terminalLabel, 25, 'Terminal Label'),
    ].filter((error) => error !== null) as string[]

    errors.push(...lengthErrors)

    // Currency and amount validation
    const currency = info.currency || 'KHR'
    const currencyError = validators.currency(currency)
    if (currencyError) errors.push(currencyError)

    const amountError = validators.amount(info.amount, currency)
    if (amountError) errors.push(amountError)

    // Merchant category code
    const categoryError = validators.merchantCategoryCode(
      info.merchantCategoryCode
    )
    if (categoryError) errors.push(categoryError)

    // Expiration timestamp for dynamic QR
    const qrType = info.amount && info.amount > 0 ? 'dynamic' : 'static'
    const timestampError = validators.expirationTimestamp(
      info.expirationTimestamp,
      qrType
    )
    if (timestampError) errors.push(timestampError)

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
  /**
   * Comprehensive validation for MerchantInfo
   * Extends IndividualInfo validation
   */
  validateMerchantInfo: (info: any): ValidationResult => {
    const baseValidation = validators.validateIndividualInfo(info)
    const errors = [...baseValidation.errors]

    // Additional merchant-specific required fields
    const merchantIdError = validators.required(info.merchantID, 'Merchant ID')
    if (merchantIdError) errors.push(merchantIdError)

    const acquiringBankError = validators.required(
      info.acquiringBank,
      'Acquiring Bank'
    )
    if (acquiringBankError) errors.push(acquiringBankError)

    // Length validations for merchant fields
    const lengthErrors = [
      validators.maxLength(info.merchantID, 32, 'Merchant ID'),
      validators.maxLength(info.acquiringBank, 32, 'Acquiring Bank'),
    ].filter((error) => error !== null) as string[]

    errors.push(...lengthErrors)

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
  /**
   * Basic QR string format validation
   */
  validateQRString: (qrString: string): ValidationResult => {
    const errors: string[] = []

    if (!qrString) {
      errors.push('QR string is required')
      return { isValid: false, errors }
    }

    if (qrString.length < 12) {
      errors.push('QR string is too short')
    }

    // Check CRC format
    if (!/6304[A-Fa-f0-9]{4}$/.test(qrString)) {
      errors.push('Invalid CRC format')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
  /**
   * Check if info is MerchantInfo. Can be use as type guard.
   *
   * @param info - any object
   * @returns boolean
   */
  isMerchantInfo: (info: any): info is { merchantID: string } => {
    return (
      info &&
      typeof info === 'object' &&
      'merchantID' in info &&
      typeof info.merchantID === 'string'
    )
  },
  /**
   * type guard for IndividualInfo. Can be use as type guard.
   *
   * @param info - any object
   * @returns boolean
   */
  isIndividualInfo: (info: any): info is { bakongAccountID: string } => {
    return (
      info &&
      typeof info === 'object' &&
      'bakongAccountID' in info &&
      typeof info.bakongAccountID === 'string'
    )
  },
  /**
   * Check if string is Static QR
   */
  isStaticQR: (qrString?: string): boolean => {
    if (!qrString) return false
    return /^000201010211/.test(qrString)
  },
  /**
   * Check if string is Dynamic QR
   */
  isDynamicQR: (qrString?: string): boolean => {
    if (!qrString) return false
    return /^000201010212/.test(qrString)
  },
}
