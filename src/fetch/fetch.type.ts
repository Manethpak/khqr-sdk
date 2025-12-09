/**
 * Error codes returned by the API
 * @description
 * | Code | Description |
 * |------|-------|
 * | 1  | Transaction could not be found. Please try again. |
 * | 2  | Sorry, the system does not support static QR code. |
 * | 3  | Transaction failed. |
 * | 4  | Error occurred on requesting deeplink from provider. |
 * | 5  | Missing required fields. |
 * | 6  | Unauthorized. |
 * | 7  | Email server has been down. |
 * | 8  | Email has been registered already. |
 * | 9  | Cannot connect to server. Please try again later. |
 * | 10 | Not registered yet. |
 * | 11 | Account ID not found. |
 * | 12 | Account ID is invalid. |
 */
export type ErrorCode = 2 | 1 | 4 | 3 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | null

/**
 * Response codes returned by the API
 * @description
 * | Code | Description |
 * |------|-------|
 * | 0  | Success |
 * | 1  | Fail |
 */
export type ResponseCode = 0 | 1

export type BaseResponse = {
  data: Record<string, unknown> | null
  errorCode: ErrorCode
  responseCode: ResponseCode
  responseMessage: string
}

export type Currency = 'KHR' | 'USD'

export type TransactionStatus = 'SUCCESS' | 'NOT_FOUND' | 'STATIC_QR' | 'FAILED'

export type Transaction = {
  hash: string
  fromAccountId: string
  toAccountId: string
  amount: number
  currency: Currency
  description: string
  createDateMs: number
  acknowledgeDateMs: number
}

export type TransactionWithStatus = Transaction & {
  trackingStatus?: string | undefined
  receiverBank?: string | undefined
  receiverBankAccount?: string | undefined
}

// Response & Request schema

export type RenewTokenResponse = BaseResponse & {
  data: {
    token: string
  } | null
}

export type CheckBakongAccountResponse = BaseResponse & {
  data: null
}

export type GenerateDeepLinkRequest = {
  qr: string
  sourceInfo: {
    appIconUrl: string
    appName: string
    appDeepLinkCallback: string
  }
}

export type GenerateDeepLinkResponse = BaseResponse & {
  data: {
    shortLink: string
  } | null
}

export type CheckTxByMD5Response = BaseResponse & {
  data: Transaction | null
}

export type CheckTxResponse = BaseResponse & {
  data: TransactionWithStatus | null
}

export type CheckTxMD5ListResponse = BaseResponse & {
  data: Array<{
    md5: string
    status: 'SUCCESS' | 'NOT_FOUND' | 'STATIC_QR'
    message: string
    transaction: Transaction | null
  }>
}

export type CheckTxListResponse = BaseResponse & {
  data: Array<{
    hash: string
    status: 'SUCCESS' | 'NOT_FOUND' | 'FAILED'
    message: string
    data: TransactionWithStatus | null
  }>
}
