import { calculateCRC16 } from '@/qr/helper/crc'
import { generateKHQR } from '@/qr/core/generate'
import { describe, expect, test } from 'vitest'

import dollarIcon from '../assets/Dollar.png?inline'
import rielIcon from '../assets/Riel.png?inline'
import { generateKHQRSVG, svgToDataURI } from '../render'

const createPayload = (options: {
  merchantName?: string
  currency?: 'KHR' | 'USD'
  amount?: number
}) => {
  const generated = generateKHQR({
    bakongAccountID: 'test@bank',
    merchantName: options.merchantName ?? 'Test Shop',
    merchantCity: 'Phnom Penh',
    currency: options.currency,
    amount: options.amount,
    expirationTimestamp: options.amount ? Date.now() + 3_600_000 : undefined,
  })

  if (!generated.result) throw generated.error
  return generated.result.qr
}

describe('KHQR SVG rendering', () => {
  test('renders a dynamic KHR banner', () => {
    const rendered = generateKHQRSVG(
      createPayload({ currency: 'KHR', amount: 50000 })
    )

    expect(rendered.error).toBeNull()
    expect(rendered.result).toContain('50,000<tspan')
    expect(rendered.result).toContain(`href="${rielIcon}"`)
    expect(rendered.result).toContain('href="data:image/png;base64,')
    expect(rendered.result).toContain('<path d="M')
    expect(rendered.result).not.toContain('{{')
  })

  test('renders a dynamic USD banner', () => {
    const rendered = generateKHQRSVG(
      createPayload({ currency: 'USD', amount: 25.99 })
    )

    expect(rendered.error).toBeNull()
    expect(rendered.result).toContain('25.99<tspan')
    expect(rendered.result).toContain(`href="${dollarIcon}"`)
  })

  test('omits the amount for a static payload', () => {
    const rendered = generateKHQRSVG(createPayload({ currency: 'KHR' }))

    expect(rendered.error).toBeNull()
    expect(rendered.result).toContain('>Test Shop (KHQR)</title>')
    expect(rendered.result).not.toContain('y="105"')
  })

  test('escapes decoded text before inserting it into SVG', () => {
    const rendered = generateKHQRSVG(
      createPayload({ merchantName: 'Tea & <Coffee>', currency: 'KHR' })
    )

    expect(rendered.error).toBeNull()
    expect(rendered.result).toContain('Tea &amp; &lt;Coffee&gt;')
    expect(rendered.result).not.toContain('Tea & <Coffee>')
  })

  test('rejects invalid and unsupported KHQR payloads', () => {
    const invalid = generateKHQRSVG('not-a-khqr')
    expect(invalid.result).toBeNull()
    expect(invalid.error?.code).toBe('INVALID_QR')

    const khrPayload = createPayload({ currency: 'KHR' })
    const unsupportedWithoutCRC = khrPayload
      .slice(0, -4)
      .replace('5303116', '5303978')
    const unsupported = `${unsupportedWithoutCRC}${calculateCRC16(unsupportedWithoutCRC)}`
    const rendered = generateKHQRSVG(unsupported)

    expect(rendered.result).toBeNull()
    expect(rendered.error?.code).toBe('INVALID_FORMAT')
  })

  test('converts SVG markup to an encoded data URI', () => {
    expect(svgToDataURI('<svg><text>A & B</text></svg>')).toBe(
      'data:image/svg+xml,%3Csvg%3E%3Ctext%3EA%20%26%20B%3C%2Ftext%3E%3C%2Fsvg%3E'
    )
  })
})
