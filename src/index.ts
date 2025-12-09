import { qr } from './qr'
import createFetch, { type FetchOption } from './fetch/create-fetch'

/**
 * Create KHQR SDK instance
 *
 * @example
 * ```ts
 * import { createKhqr } from 'khqr-sdk'
 *
 * const khqr = createKHQR({
 *   baseURL: 'https://api-bakong.nbc.gov.kh',
 *   authToken: 'your_token_here',
 * })
 *
 * const qr = khqr.qr.generateKHQR({
 *   bakongAccountID: 'name@bank',
 *   merchantName: 'Name',
 *   merchantCity: 'Phnom Penh',
 * }) // generate static QR without amount
 *
 * if (qr.result) {
 *   const res = await khqr.api.check_transaction_by_md5(qr.result.md5)
 *   if (res.responseCode === 0) {
 *     console.log('Transaction found')
 *     console.log(res.data)
 *   }
 * }
 * ```
 */
export const createKHQR = (fetchOption: FetchOption) => {
  return {
    api: createFetch(fetchOption),
    qr,
  }
}
