import { createFetch, CreateFetchOption } from '@better-fetch/fetch'
import { $schema } from './schema'

/**
 * Create KHQR SDK instance
 *
 * @param fetchOption fetch option {@link https://better-fetch.vercel.app/docs/fetch-options}
 *
 * @example
 * ```ts
 * import { createKhqr } from 'khqr-sdk'
 *
 * const khqr = createKhqr({
 *   baseURL: 'https://api-bakong.nbc.gov.kh',
 *   auth: {
 *     type: 'Bearer',
 *     token: 'your_token_here',
 *   },
 * })
 *
 * const { data, error } = await khqr.$fetch('/v1/check_transaction_by_md5', {
 *   body: {
 *     md5: 'md5_hash_string_here',
 *   },
 * })
 *
 * if (!error) {
 *   console.log(data)
 * }
 * ```
 */
export const createKhqr = (fetchOption: CreateFetchOption) => {
  return {
    $fetch: createFetch({ schema: $schema, ...fetchOption }),
    /** For extending the schema */
    $schema,
    qr: {},
  }
}
