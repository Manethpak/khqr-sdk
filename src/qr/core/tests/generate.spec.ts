// !!! This is an AI Generated test suite with some modifications. Please review carefully. !!!

import { qr } from '@/qr'
import { validators } from '@/qr/helper/validator'
import { IndividualInfo, MerchantInfo } from '@/qr/types'
import { describe, expect, test, beforeEach } from 'vitest'

describe('KHQR Generation', () => {
  let futureTimestamp: number

  beforeEach(() => {
    futureTimestamp = Date.now() + 3600000 // 1 hour from now
  })

  describe('✅ Successful Cases', () => {
    describe('Individual Account QR Generation', () => {
      test('Individual Account - Minimal Required Fields (Static QR)', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'John Doe',
          merchantCity: 'Phnom Penh',
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(validators.isStaticQR(result.result?.qr)).toBe(true)
        expect(result.result?.qr.length).toBeGreaterThan(50)
        expect(result.result?.md5.length).toBe(32)
      })

      test('Individual Account - With Amount (Dynamic QR) - KHR', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'maneth_pak@aclb',
          merchantName: 'Maneth Pak',
          merchantCity: 'Phnom Penh',
          currency: 'KHR',
          amount: 50000,
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(validators.isDynamicQR(result.result?.qr)).toBe(true)
        expect(result.result?.qr).toContain('540550000') // Amount tag + length + value
        expect(result.result?.qr).toContain('5303116') // Currency KHR
        expect(result.result?.md5.length).toBe(32)
      })

      test('Individual Account - With Amount (Dynamic QR) - USD', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'John Smith',
          merchantCity: 'Siem Reap',
          currency: 'USD',
          amount: 25.99,
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(validators.isDynamicQR(result.result?.qr)).toBe(true)
        expect(result.result?.qr).toContain('540525.99') // Amount
        expect(result.result?.qr).toContain('5303840') // Currency USD
        expect(result.result?.md5.length).toBe(32)
      })

      test('Individual Account - All Optional Fields', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'complete_user@bank',
          merchantName: 'Complete User',
          merchantCity: 'Battambang',
          currency: 'KHR',
          amount: 10000,
          merchantCategoryCode: '4829',
          accountInformation: 'ACC123',
          acquiringBank: 'ACQ001',
          billNumber: 'BILL2024001',
          mobileNumber: '+85512345678',
          storeLabel: 'Main Store',
          terminalLabel: 'POS01',
          purposeOfTransaction: 'Purchase',
          languagePreference: 'km',
          merchantNameAlternateLanguage: 'បុគ្គលពេញលេញ',
          merchantCityAlternateLanguage: 'បាត់ដំបង',
          upiMerchantAccount: 'upi_merchant_123',
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(result.result?.qr.length).toBeGreaterThan(200)
        expect(result.result?.md5.length).toBe(32)
      })
    })

    describe('Merchant Account QR Generation', () => {
      test('Merchant Account - Minimal Required Fields (Static QR)', () => {
        const info: MerchantInfo = {
          bakongAccountID: 'shop@bank',
          merchantName: 'My Shop',
          merchantCity: 'Phnom Penh',
          merchantID: 'SHOP001',
          acquiringBank: 'BANK001',
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(validators.isStaticQR(result.result?.qr)).toBe(true)
        expect(result.result?.md5.length).toBe(32)
      })

      test('Merchant Account - With Amount (Dynamic QR)', () => {
        const info: MerchantInfo = {
          bakongAccountID: 'shop@merchant.com',
          merchantName: 'Merchant Shop',
          merchantCity: 'Siem Reap',
          merchantID: 'SHOP123',
          acquiringBank: 'BANK001',
          currency: 'USD',
          amount: 99.99,
          merchantCategoryCode: '5999',
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(validators.isDynamicQR(result.result?.qr)).toBe(true)
        expect(result.result?.qr).toContain('540599.99')
        expect(result.result?.md5.length).toBe(32)
      })

      test('Merchant Account - All Optional Fields', () => {
        const info: MerchantInfo = {
          bakongAccountID: 'complete_merchant@bank',
          merchantName: 'Complete Merchant',
          merchantCity: 'Kampong Cham',
          merchantID: 'MERCHANT001',
          acquiringBank: 'ACQUIRING_BANK_001',
          currency: 'KHR',
          amount: 75000,
          merchantCategoryCode: '5812',
          accountInformation: 'MERCHANT_ACC_INFO',
          billNumber: 'INV-2024-001',
          mobileNumber: '+85587654321',
          storeLabel: 'Flagship Store',
          terminalLabel: 'TERMINAL_01',
          purposeOfTransaction: 'Retail Sale',
          languagePreference: 'en',
          merchantNameAlternateLanguage: 'Complete Merchant KH',
          merchantCityAlternateLanguage: 'កំពង់ចាម',
          upiMerchantAccount: 'upi_complete_merchant',
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(result.result?.qr.length).toBeGreaterThan(300)
        expect(result.result?.md5.length).toBe(32)
      })
    })

    describe('Edge Cases - Valid', () => {
      test('Exact field length limits', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'a'.repeat(32), // Max length 32
          merchantName: 'b'.repeat(25), // Max length 25
          merchantCity: 'c'.repeat(15), // Max length 15
          billNumber: 'd'.repeat(25), // Max length 25
          mobileNumber: 'e'.repeat(25), // Max length 25
          storeLabel: 'f'.repeat(25), // Max length 25
          terminalLabel: 'g'.repeat(25), // Max length 25
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
      })

      test('Zero amount (static QR)', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Zero Amount User',
          merchantCity: 'Phnom Penh',
          amount: 0,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(validators.isStaticQR(result.result?.qr)).toBe(true)
      })

      test('USD with 2 decimal places', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'USD User',
          merchantCity: 'Phnom Penh',
          currency: 'USD',
          amount: 123.45,
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(result.result?.qr).toContain('5406123.45')
      })

      test('Very small USD amount', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Small Amount',
          merchantCity: 'Phnom Penh',
          currency: 'USD',
          amount: 0.01,
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeNull()
        expect(result.result).toBeDefined()
        expect(result.result?.qr).toContain('54040.01') // 54 + 04 (length) + 0.01
      })
    })
  })

  describe('❌ Invalid/Missing Field Cases', () => {
    describe('Required Field Validation', () => {
      test('Missing bakongAccountID', () => {
        const info = {
          merchantName: 'Test Merchant',
          merchantCity: 'Phnom Penh',
        } as IndividualInfo

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('Bakong Account ID')
      })

      test('Empty bakongAccountID', () => {
        const info: IndividualInfo = {
          bakongAccountID: '',
          merchantName: 'Test Merchant',
          merchantCity: 'Phnom Penh',
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })

      test('Missing merchantName', () => {
        const info = {
          bakongAccountID: 'user@bank',
          merchantCity: 'Phnom Penh',
        } as IndividualInfo

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('Merchant Name')
      })

      test('Empty merchantName', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: '',
          merchantCity: 'Phnom Penh',
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })

      test('Missing merchantCity', () => {
        const info = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test Merchant',
        } as IndividualInfo

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('Merchant City')
      })

      test('Merchant account missing merchantID', () => {
        const info = {
          bakongAccountID: 'shop@bank',
          merchantName: 'Shop',
          merchantCity: 'Phnom Penh',
          acquiringBank: 'BANK001',
        } as MerchantInfo

        const result = qr.generateKHQR(info)

        // without merchantID it will be treated as individual account
        expect(result.error).toBeNull()
        expect(validators.isMerchantInfo(info)).toBe(false)
        expect(validators.isStaticQR(result.result?.qr)).toBe(true)
      })

      test('Merchant account missing acquiringBank', () => {
        const info = {
          bakongAccountID: 'shop@bank',
          merchantName: 'Shop',
          merchantCity: 'Phnom Penh',
          merchantID: 'SHOP001',
        } as MerchantInfo

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('Acquiring Bank')
      })
    })

    describe('Field Length Validation', () => {
      test('bakongAccountID too long', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'a'.repeat(33), // Max is 32
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })

      test('merchantName too long', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'a'.repeat(26), // Max is 25
          merchantCity: 'Phnom Penh',
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })

      test('merchantCity too long', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'a'.repeat(16), // Max is 15
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })

      test('billNumber too long', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          billNumber: 'a'.repeat(26), // Max is 25
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })

      test('mobileNumber too long', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          mobileNumber: 'a'.repeat(26), // Max is 25
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })

      test('merchantID too long', () => {
        const info: MerchantInfo = {
          bakongAccountID: 'shop@bank',
          merchantName: 'Shop',
          merchantCity: 'Phnom Penh',
          merchantID: 'a'.repeat(33), // Max is 32
          acquiringBank: 'BANK001',
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })

      test('acquiringBank too long', () => {
        const info: MerchantInfo = {
          bakongAccountID: 'shop@bank',
          merchantName: 'Shop',
          merchantCity: 'Phnom Penh',
          merchantID: 'SHOP001',
          acquiringBank: 'a'.repeat(33), // Max is 32
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })
    })

    describe('Format Validation', () => {
      test('Invalid bakongAccountID characters', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank!#$%', // Invalid characters
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('invalid characters')
      })

      test('Invalid merchantCategoryCode format', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          merchantCategoryCode: '123', // Must be 4 digits
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('4 digits')
      })

      test('Invalid merchantCategoryCode with letters', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          merchantCategoryCode: '59A9', // Must be digits only
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
      })
    })

    describe('Amount Validation', () => {
      test('Negative amount', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          amount: -100,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('negative')
      })

      test('KHR with decimal places', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          currency: 'KHR',
          amount: 100.5, // KHR must be whole numbers
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('whole number')
      })

      test('USD with more than 2 decimal places', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          currency: 'USD',
          amount: 100.555, // USD max 2 decimal places
          expirationTimestamp: futureTimestamp,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('2 decimal places')
      })
    })

    describe('Currency Validation', () => {
      test('Invalid currency code', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currency: 'EUR' as any, // Only KHR and USD supported
          amount: 100,
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('KHR or USD')
      })
    })

    describe('Timestamp Validation', () => {
      test('Missing expiration timestamp for dynamic QR', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          amount: 100, // Dynamic QR requires expiration
          // expirationTimestamp missing
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('required for dynamic QR')
      })

      test('Past expiration timestamp', () => {
        const info: IndividualInfo = {
          bakongAccountID: 'user@bank',
          merchantName: 'Test',
          merchantCity: 'Phnom Penh',
          amount: 100,
          expirationTimestamp: Date.now() - 3600000, // 1 hour ago
        }

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        expect(result.error?.message).toContain('in the future')
      })
    })

    describe('Multiple Validation Errors', () => {
      test('Multiple validation errors combined', () => {
        const info = {
          // Missing bakongAccountID
          merchantName: 'a'.repeat(30), // Too long
          // Missing merchantCity
          amount: -100, // Negative
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currency: 'INVALID' as any,
          merchantCategoryCode: '12', // Wrong format
        } as IndividualInfo

        const result = qr.generateKHQR(info)

        expect(result.error).toBeDefined()
        expect(result.result).toBeNull()
        // Should contain multiple error messages
        expect(result.error?.message.length).toBeGreaterThan(50)
      })
    })
  })
})
