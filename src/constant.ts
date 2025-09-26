import { z, type infer as zodInfer } from 'zod'

export const responseCode = z.union([z.literal(0), z.literal(1)])
export type ResponseCode = zodInfer<typeof responseCode>

export const errorCode = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
  z.literal(11),
  z.literal(12),
])
export type ErrorCode = zodInfer<typeof errorCode>

export const baseResponse = z.object({
  data: z.object({}).optional(),

  /** error code
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
  errorCode: errorCode,

  /** response code
   * @description
   * | Code | Description |
   * |------|-------|
   * | 0  | Success |
   * | 1  | Fail |
   */
  responseCode: responseCode,

  responseMessage: z.string(),
})
