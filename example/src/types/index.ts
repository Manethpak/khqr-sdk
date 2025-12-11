export enum Currency {
  KHR = 'KHR',
  USD = 'USD',
}

export interface Transaction {
  id: string
  md5: string
  qr: string
  fromAccountId: string
  toAccountId: string
  amount: number
  currency: Currency
  merchantName: string
  merchantCity: string
  status: 'pending' | 'success' | 'failed'
  createdAt: number
  completedAt?: number
}

export interface QRResult {
  qr: string
  md5: string
}

export interface DecodedQRData {
  payloadFormatIndicator?: string
  pointOfInitiationMethod?: string
  merchantAccountInfo?: {
    bakongAccountID: string
    merchantID?: string
    acquiringBank?: string
    accountInformation?: string
  }
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
  crc?: string
}

export interface VerifyResult {
  isValid: boolean
  expectedCRC: string
  actualCRC: string
  errors: string[]
}

export interface PaymentInitiateResponse {
  paymentId: string
  details: {
    merchantName?: string
    merchantCity?: string
    amount: number
    currency: string
    bakongAccountID?: string
  }
}
