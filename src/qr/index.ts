/**
 * KHQR (Khmer QR) TypeScript Implementation
 *
 * This module provides a TypeScript implementation for generating,
 * decoding, and validating KHQR payment codes following the EMV
 * QR Code specification for Cambodia's Bakong payment system.
 */

import { generateKHQR } from './core/generate'
import { decodeKHQR } from './core/decode'
import { verifyKHQRString } from './core/verify-string'
import { validators } from './helper/validator'

export type { Result } from './helper/result'
export { success, failed, wrap } from './helper/result'
export { KHQRError, ERROR_CODES, error } from './helper/errors'
export type { VerifyStringResult } from './core/verify-string'

// Main KHQR generation function
export const qr = {
  generateKHQR,
  decodeKHQR,
  verifyKHQRString,
  validators,
}

qr.validators.amount

// TODO: Export main KHQR class implementation
// export { BakongKHQR } from './BakongKHQR';

/**
 * API to be implemented:
 *
 * ```typescript
 * // Generate QR codes
 * function generateIndividual(info: IndividualInfo): Result<QRResult>
 * function generateMerchant(info: MerchantInfo): Result<QRResult>
 *
 * // Decode QR codes
 * function decodeKHQR(qrString: string): Result<DecodedKHQRData>
 *
 * // Decode and verify QR codes
 * function decode(qrString: string): Result<DecodedKHQRData>
 * function verify(qrString: string): ValidationResult
 *
 * // Utility functions
 * function validateIndividualInfo(info: IndividualInfo): ValidationResult
 * function validateMerchantInfo(info: MerchantInfo): ValidationResult
 * function calculateCRC(data: string): string
 * ```
 *
 * Example usage:
 *
 * ```typescript
 * import { generateIndividual, IndividualInfo } from '@your-org/khqr-sdk';
 *
 * const info: IndividualInfo = {
 *   bakongAccountID: 'user@bank',
 *   merchantName: 'John Doe',
 *   merchantCity: 'Phnom Penh',
 *   currency: 'KHR',
 *   amount: 10000
 * };
 *
 * const result = generateIndividual(info);
 *
 * if (result.error) {
 *   console.error('Error:', result.error.message);
 * } else {
 *   console.log('QR Code:', result.result?.qr);
 *   console.log('MD5:', result.result?.md5);
 * }
 * ```
 */
