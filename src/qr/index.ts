/**
 * KHQR (Khmer QR) TypeScript Implementation
 *
 * This module provides a TypeScript implementation for generating,
 * decoding, and validating KHQR payment codes following the EMV
 * QR Code specification for Cambodia's Bakong payment system.
 */

export * from './types'

export * from './constants'

// TODO: Export main KHQR class implementation
// export { BakongKHQR } from './BakongKHQR';

/**
 * API to be implemented:
 *
 * ```typescript
 * // Generate QR codes
 * function generateIndividual(info: IndividualInfo): QRResult | KHQRError
 * function generateMerchant(info: MerchantInfo): QRResult | KHQRError
 *
 * // Decode and verify QR codes
 * function decode(qrString: string): DecodedKHQRData | KHQRError
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
 * if (result instanceof KHQRError) {
 *   console.error('Error:', result.message);
 * } else {
 *   console.log('QR Code:', result.qr);
 *   console.log('MD5:', result.md5);
 * }
 * ```
 */
