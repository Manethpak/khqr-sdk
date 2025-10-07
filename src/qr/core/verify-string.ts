import { error } from '@/qr/helper/errors'
import { calculateCRC16 } from '@/qr/helper/crc'
import { ValidationResult, validators } from '@/qr/helper/validator'
import { failed, Result, success } from '@/qr/helper/result'

import { decodeKHQR } from './decode'

export interface VerifyStringResult extends ValidationResult {
  /**
   * CRC value extracted from the incoming QR string
   */
  actualCRC?: string

  /**
   * CRC value recalculated from the QR payload
   */
  expectedCRC?: string
}

/**
 * Verify whether a KHQR string is structurally valid, including CRC integrity.
 *
 * This utility keeps the legacy behaviour of returning an object with
 * `isValid` and `errors`. When the QR code is valid, both CRC values are
 * returned for reference. For invalid strings, the `errors` array lists all
 * detected issues while still reporting the computed CRC pair when possible.
 */
export function verifyKHQRString(qrString: string): Result<VerifyStringResult> {
  try {
    if (!qrString || typeof qrString !== 'string') {
      return failed<VerifyStringResult>(error.invalidQRString())
    }

    const normalized = qrString.trim()
    const formatValidation = validators.validateQRString(normalized)
    const errors = [...formatValidation.errors]

    let expectedCRC: string | undefined
    let actualCRC: string | undefined

    if (formatValidation.isValid) {
      actualCRC = normalized.slice(-4).toUpperCase()
      const payloadWithoutCRC = normalized.slice(0, -4)
      expectedCRC = calculateCRC16(payloadWithoutCRC)

      if (expectedCRC !== actualCRC) {
        errors.push('CRC checksum mismatch')
      } else {
        const decoded = decodeKHQR(normalized)
        if (decoded.error) {
          errors.push(decoded.error.message)
        }
      }
    }

    const isValid = errors.length === 0

    return success({
      isValid,
      errors,
      actualCRC,
      expectedCRC,
    })
  } catch (err) {
    const details =
      err instanceof Error
        ? { cause: err.message }
        : err
          ? { cause: String(err) }
          : undefined

    return failed<VerifyStringResult>(
      error.invalidQR('KHQR verification failed', details)
    )
  }
}
