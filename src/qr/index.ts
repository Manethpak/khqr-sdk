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

// Main KHQR generation function
export const qr = {
  generateKHQR,
  decodeKHQR,
  verifyKHQRString,
}
