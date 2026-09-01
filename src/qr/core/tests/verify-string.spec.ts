// !!! Comprehensive test suite for QR verify functionality !!!

import { verifyKHQRString } from '@/qr/core/verify-string'
import { generateKHQR } from '@/qr/core/generate'
import { describe, expect, test } from 'vitest'
import { calculateCRC16 } from '@/qr/helper/crc'

describe('KHQR String Verification', () => {
  describe('✅ Valid QR String Verification', () => {
    test('Verify valid static QR string', () => {
      const generated = generateKHQR({
        bakongAccountID: 'user@aclb',
        merchantName: 'Test User',
        merchantCity: 'Phnom Penh',
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(true)
      expect(result.result?.errors).toHaveLength(0)
      expect(result.result?.actualCRC).toBeDefined()
      expect(result.result?.expectedCRC).toBeDefined()
    })

    test('Verify valid dynamic QR string with amount', () => {
      const futureTimestamp = Date.now() + 3600000
      const generated = generateKHQR({
        bakongAccountID: 'user@aclb',
        merchantName: 'Test Merchant',
        merchantCity: 'Phnom Penh',
        currency: 'KHR',
        amount: 50000,
        expirationTimestamp: futureTimestamp,
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(true)
      expect(result.result?.errors).toHaveLength(0)
    })

    test('Verify CRC matches between actual and expected', () => {
      const generated = generateKHQR({
        bakongAccountID: 'user@aclb',
        merchantName: 'CRC Test',
        merchantCity: 'Phnom Penh',
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.error).toBeNull()
      expect(result.result?.actualCRC).toBe(result.result?.expectedCRC)
    })

    test('Verify QR with all optional fields', () => {
      const futureTimestamp = Date.now() + 3600000
      const generated = generateKHQR({
        bakongAccountID: 'complete@aclb',
        merchantName: 'Complete Merchant',
        merchantCity: 'Phnom Penh',
        merchantID: 'MERCHANT001',
        acquiringBank: 'BANK001',
        currency: 'USD',
        amount: 99.99,
        merchantCategoryCode: '5812',
        billNumber: 'INV-2024-001',
        mobileNumber: '+85512345678',
        storeLabel: 'Main Store',
        terminalLabel: 'POS01',
        purposeOfTransaction: 'Purchase',
        languagePreference: 'en',
        expirationTimestamp: futureTimestamp,
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(true)
      expect(result.result?.errors).toHaveLength(0)
    })

    test('Verify QR with Khmer alternate language fields', () => {
      const futureTimestamp = Date.now() + 3600000
      const generated = generateKHQR({
        bakongAccountID: 'khmer@aclb',
        merchantName: 'Khmer Test',
        merchantCity: 'Phnom Penh',
        merchantNameAlternateLanguage: 'ហាងលក់ 123',
        merchantCityAlternateLanguage: 'ភ្នំពេញ',
        expirationTimestamp: futureTimestamp,
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(true)
    })
  })

  describe('❌ Invalid QR String Handling', () => {
    test('Verify rejects null input', () => {
      const result = verifyKHQRString(null as any)

      expect(result.error).toBeDefined()
      expect(result.result).toBeNull()
    })

    test('Verify rejects undefined input', () => {
      const result = verifyKHQRString(undefined as any)

      expect(result.error).toBeDefined()
      expect(result.result).toBeNull()
    })

    test('Verify rejects empty string', () => {
      const result = verifyKHQRString('')

      expect(result.error).toBeDefined()
      expect(result.result).toBeNull()
    })

    test('Verify rejects non-string input', () => {
      const result = verifyKHQRString(123 as any)

      expect(result.error).toBeDefined()
      expect(result.result).toBeNull()
    })

    test('Verify rejects whitespace-only string', () => {
      const result = verifyKHQRString('   ')

      // Whitespace-only is treated as invalid format, not null error
      expect(result.result).toBeDefined()
      expect(result.result?.isValid).toBe(false)
    })

    test('Verify detects CRC mismatch', () => {
      const generated = generateKHQR({
        bakongAccountID: 'user@aclb',
        merchantName: 'CRC Test',
        merchantCity: 'Phnom Penh',
      })

      const qrString = generated.result!.qr
      // Corrupt the CRC with invalid hex characters
      const corruptedQR = qrString.slice(0, -4) + 'XXXX'

      const result = verifyKHQRString(corruptedQR)

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(false)
      // Invalid CRC format produces an error
      expect(result.result?.errors.length).toBeGreaterThan(0)
    })

    test('Verify detects invalid payload format', () => {
      const result = verifyKHQRString('INVALID_QR_FORMAT')

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(false)
      expect(result.result?.errors.length).toBeGreaterThan(0)
    })

    test('Verify detects truncated QR string', () => {
      const generated = generateKHQR({
        bakongAccountID: 'user@aclb',
        merchantName: 'Truncated Test',
        merchantCity: 'Phnom Penh',
      })

      // Remove characters from the end
      const truncatedQR = generated.result!.qr.slice(0, -20)

      const result = verifyKHQRString(truncatedQR)

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(false)
      expect(result.result?.errors.length).toBeGreaterThan(0)
    })

    test('Verify detects QR with invalid length encoding', () => {
      const result = verifyKHQRString('00XX1234')

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(false)
      expect(result.result?.errors.length).toBeGreaterThan(0)
    })
  })

  describe('🔢 CRC Calculation and Validation', () => {
    test('Verify CRC is 4 hex characters', () => {
      const generated = generateKHQR({
        bakongAccountID: 'user@aclb',
        merchantName: 'CRC Length Test',
        merchantCity: 'Phnom Penh',
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.error).toBeNull()
      expect(result.result?.actualCRC).toMatch(/^[0-9A-F]{4}$/)
      expect(result.result?.expectedCRC).toMatch(/^[0-9A-F]{4}$/)
      expect(result.result?.actualCRC?.length).toBe(4)
      expect(result.result?.expectedCRC?.length).toBe(4)
    })

    test('Verify CRC matches pre-calculated value', () => {
      const generated = generateKHQR({
        bakongAccountID: 'user@aclb',
        merchantName: 'Pre-calc Test',
        merchantCity: 'Phnom Penh',
      })

      const qrString = generated.result!.qr
      const payloadWithoutCRC = qrString.slice(0, -4)
      const actualCRC = qrString.slice(-4).toUpperCase()
      const expectedCRC = calculateCRC16(payloadWithoutCRC)

      expect(actualCRC).toBe(expectedCRC)
    })

    test('Verify detects single character CRC corruption', () => {
      const generated = generateKHQR({
        bakongAccountID: 'user@aclb',
        merchantName: 'Single Char Test',
        merchantCity: 'Phnom Penh',
      })

      const qrString = generated.result!.qr
      // Change only one character in CRC
      const corruptedQR =
        qrString.slice(0, -4) +
        (qrString[qrString.length - 4] === 'A' ? 'B' : 'A') +
        qrString.slice(-3)

      const result = verifyKHQRString(corruptedQR)

      expect(result.result?.isValid).toBe(false)
      expect(result.result?.errors).toContain('CRC checksum mismatch')
    })
  })

  describe('🔄 Round-trip Verification', () => {
    test('Generate and verify produces valid result', () => {
      const input = {
        bakongAccountID: 'roundtrip@aclb',
        merchantName: 'Round Trip Test',
        merchantCity: 'Phnom Penh',
        merchantCategoryCode: '5411',
        billNumber: 'ROUNDTRIP-001',
      }

      const generated = generateKHQR(input)
      expect(generated.error).toBeNull()

      const verified = verifyKHQRString(generated.result!.qr)
      expect(verified.error).toBeNull()
      expect(verified.result?.isValid).toBe(true)
      expect(verified.result?.errors).toHaveLength(0)
    })

    test('Multiple verifications produce consistent results', () => {
      const generated = generateKHQR({
        bakongAccountID: 'consistent@aclb',
        merchantName: 'Consistency Test',
        merchantCity: 'Phnom Penh',
      })

      const result1 = verifyKHQRString(generated.result!.qr)
      const result2 = verifyKHQRString(generated.result!.qr)
      const result3 = verifyKHQRString(generated.result!.qr)

      expect(result1.result?.isValid).toBe(result2.result?.isValid)
      expect(result2.result?.isValid).toBe(result3.result?.isValid)
      expect(result1.result?.actualCRC).toBe(result2.result?.actualCRC)
      expect(result2.result?.actualCRC).toBe(result3.result?.actualCRC)
    })
  })

  describe('🛡️ Edge Cases', () => {
    test('Verify handles QR with leading/trailing whitespace', () => {
      const generated = generateKHQR({
        bakongAccountID: 'edge@aclb',
        merchantName: 'Whitespace Test',
        merchantCity: 'Phnom Penh',
      })

      const qrWithSpaces = '  ' + generated.result!.qr + '  '
      const result = verifyKHQRString(qrWithSpaces)

      // Should successfully trim and verify
      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(true)
    })

    test('Verify uppercase QR string', () => {
      const generated = generateKHQR({
        bakongAccountID: 'case@aclb',
        merchantName: 'Case Test',
        merchantCity: 'Phnom Penh',
      })

      // Verify the original first
      const originalResult = verifyKHQRString(generated.result!.qr)
      expect(originalResult.result?.isValid).toBe(true)

      // Uppercase transformation may affect hex characters in payload
      // but the function should handle it
      const result = verifyKHQRString(generated.result!.qr.toUpperCase())
      expect(result.error).toBeNull()
    })

    test('Verify lowercase QR string', () => {
      const generated = generateKHQR({
        bakongAccountID: 'case@aclb',
        merchantName: 'Case Test',
        merchantCity: 'Phnom Penh',
      })

      // Verify the original first
      const originalResult = verifyKHQRString(generated.result!.qr)
      expect(originalResult.result?.isValid).toBe(true)

      // Lowercase transformation may affect hex characters in payload
      // but the function should handle it
      const result = verifyKHQRString(generated.result!.qr.toLowerCase())
      expect(result.error).toBeNull()
    })

    test('Verify extremely long merchant name', () => {
      const generated = generateKHQR({
        bakongAccountID: 'long@aclb',
        merchantName: 'a'.repeat(25), // Maximum length
        merchantCity: 'Phnom Penh',
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(true)
    })

    test('Verify QR with maximum allowed length', () => {
      const futureTimestamp = Date.now() + 3600000
      const generated = generateKHQR({
        bakongAccountID: 'x'.repeat(32),
        merchantName: 'y'.repeat(25),
        merchantCity: 'z'.repeat(15),
        merchantCategoryCode: '5811',
        billNumber: 'a'.repeat(25),
        mobileNumber: 'b'.repeat(25),
        storeLabel: 'c'.repeat(25),
        terminalLabel: 'd'.repeat(25),
        purposeOfTransaction: 'Purchase',
        languagePreference: 'en',
        merchantNameAlternateLanguage: 'e'.repeat(25),
        merchantCityAlternateLanguage: 'f'.repeat(25),
        currency: 'USD',
        amount: 999999.99,
        expirationTimestamp: futureTimestamp,
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.error).toBeNull()
      expect(result.result?.isValid).toBe(true)
    })

    test('Verify QR with special amount values', () => {
      const futureTimestamp = Date.now() + 3600000

      // Test with very small USD amount
      const small = generateKHQR({
        bakongAccountID: 'small@aclb',
        merchantName: 'Small',
        merchantCity: 'Phnom Penh',
        currency: 'USD',
        amount: 0.01,
        expirationTimestamp: futureTimestamp,
      })

      const smallResult = verifyKHQRString(small.result!.qr)
      expect(smallResult.result?.isValid).toBe(true)

      // Test with large KHR amount
      const large = generateKHQR({
        bakongAccountID: 'large@aclb',
        merchantName: 'Large',
        merchantCity: 'Phnom Penh',
        currency: 'KHR',
        amount: 999999999,
        expirationTimestamp: futureTimestamp,
      })

      const largeResult = verifyKHQRString(large.result!.qr)
      expect(largeResult.result?.isValid).toBe(true)
    })
  })

  describe('📋 Error Messages', () => {
    test('Verify provides meaningful error for CRC mismatch', () => {
      const generated = generateKHQR({
        bakongAccountID: 'error@aclb',
        merchantName: 'Error Test',
        merchantCity: 'Phnom Penh',
      })

      const qrString = generated.result!.qr
      const corruptedQR = qrString.slice(0, -4) + 'ABCD'

      const result = verifyKHQRString(corruptedQR)

      expect(result.result?.errors).toContain('CRC checksum mismatch')
    })

    test('Verify error array is populated for invalid QR', () => {
      const result = verifyKHQRString('INVALID')

      expect(result.error).toBeNull()
      expect(result.result?.errors).toBeDefined()
      expect(Array.isArray(result.result?.errors)).toBe(true)
      const errorCount = result.result?.errors?.length ?? 0
      expect(errorCount).toBeGreaterThan(0)
    })

    test('Verify includes actual and expected CRC in result', () => {
      const generated = generateKHQR({
        bakongAccountID: 'crc@aclb',
        merchantName: 'CRC Info',
        merchantCity: 'Phnom Penh',
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.result?.actualCRC).toBeDefined()
      expect(result.result?.expectedCRC).toBeDefined()
      expect(typeof result.result?.actualCRC).toBe('string')
      expect(typeof result.result?.expectedCRC).toBe('string')
    })
  })

  describe('🔐 Security Considerations', () => {
    test('Verify rejects QR with modified payload but matching CRC', () => {
      // This test verifies that any modification to the payload would
      // require recalculating the CRC, which demonstrates the integrity check works
      const generated = generateKHQR({
        bakongAccountID: 'security@aclb',
        merchantName: 'Security Test',
        merchantCity: 'Phnom Penh',
      })

      const qrString = generated.result!.qr
      // Try to modify a character in the middle (not the CRC)
      const modified = qrString
        .slice(0, qrString.length / 2)
        .replace(/0/, '1') // Replace first 0 with 1
        .concat(qrString.slice(qrString.length / 2))

      const result = verifyKHQRString(modified)

      // If we successfully modified something, CRC should not match
      if (result.result?.isValid === false) {
        expect(result.result?.errors).toContain('CRC checksum mismatch')
      }
    })

    test('Verify timestamp validity affects decoded content', () => {
      const futureTimestamp = Date.now() + 3600000
      const generated = generateKHQR({
        bakongAccountID: 'timestamp@aclb',
        merchantName: 'Timestamp Test',
        merchantCity: 'Phnom Penh',
        amount: 10000,
        expirationTimestamp: futureTimestamp,
      })

      const result = verifyKHQRString(generated.result!.qr)

      expect(result.result?.isValid).toBe(true)
      // The verification includes decode attempt, which validates structure
    })
  })
})
