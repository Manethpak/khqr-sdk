import QRCode from 'qrcode'

import { CURRENCY_CODES } from '../qr/constants/emv'
import { decodeKHQR } from '../qr/core/decode'
import { verifyKHQRString } from '../qr/core/verify-string'
import { error } from '../qr/helper/errors'
import { failed, Result, success } from '../qr/helper/result'
import { CurrencyType } from '../qr/types'

import dollarIcon from './assets/Dollar.png?inline'
import bannerTemplate from './khqr-banner.svg?raw'
import rielIcon from './assets/Riel.png?inline'

const QR_SIZE = 312

const replaceToken = (svg: string, token: string, value: string) =>
  svg.split(`{{${token}}}`).join(value)

const escapeXML = (value: string) =>
  value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    }

    return entities[character]
  })

const resolveCurrency = (currencyCode?: string): CurrencyType | null => {
  if (currencyCode === CURRENCY_CODES.KHR) return 'KHR'
  if (currencyCode === CURRENCY_CODES.USD) return 'USD'
  return null
}

const formatAmount = (amount: string, currency: CurrencyType) => {
  const [integerPart, decimalPart] = amount.split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (currency === 'KHR' || !decimalPart) return formattedInteger
  return `${formattedInteger}.${decimalPart}`
}

const renderAmount = (amount: string | undefined, currency: CurrencyType) => {
  if (!amount) return ''

  return `<text x="24" y="105" font-size="24" font-weight="700" fill="#1f2937">${formatAmount(amount, currency)}<tspan dx="8" dy="-3" font-size="14" font-weight="500" fill="#475569">${currency}</tspan></text>`
}

const renderCurrencyIcon = (currency: CurrencyType) =>
  `<image width="44" height="44" href="${currency === 'KHR' ? rielIcon : dollarIcon}"/>`

const createIDSuffix = (value: string) => {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(36)
}

const renderQRPath = (qrString: string) => {
  const qr = QRCode.create(qrString, { errorCorrectionLevel: 'H' })
  const commands: string[] = []

  for (let row = 0; row < qr.modules.size; row += 1) {
    let column = 0

    while (column < qr.modules.size) {
      if (!qr.modules.get(row, column)) {
        column += 1
        continue
      }

      const start = column
      while (column < qr.modules.size && qr.modules.get(row, column)) {
        column += 1
      }

      commands.push(`M${start} ${row}h${column - start}v1H${start}z`)
    }
  }

  return {
    path: `<path d="${commands.join('')}" fill="#000"/>`,
    scale: String(QR_SIZE / qr.modules.size),
  }
}

/**
 * Render a validated KHQR payload as a self-contained SVG payment banner.
 */
export function generateKHQRSVG(qrString: string): Result<string> {
  const normalized = typeof qrString === 'string' ? qrString.trim() : ''
  const verification = verifyKHQRString(normalized)

  if (verification.error) return failed(verification.error)
  if (!verification.result?.isValid) {
    return failed(
      error.invalidQR('Invalid KHQR string', {
        errors: verification.result?.errors ?? [],
      })
    )
  }

  const decoded = decodeKHQR(normalized)
  if (decoded.error) return failed(decoded.error)

  const merchantName = decoded.result?.merchantName
  const currency = resolveCurrency(decoded.result?.transactionCurrency)

  if (!merchantName) return failed(error.requiredField('merchantName'))
  if (!currency) {
    return failed(
      error.invalidFormat('transactionCurrency', {
        currencyCode: decoded.result?.transactionCurrency,
      })
    )
  }

  try {
    const amount = decoded.result?.transactionAmount
    const qr = renderQRPath(normalized)
    const title = amount
      ? `${merchantName} - ${formatAmount(amount, currency)} ${currency} (KHQR)`
      : `${merchantName} (KHQR)`

    let svg = bannerTemplate
    svg = replaceToken(svg, 'ID_SUFFIX', createIDSuffix(normalized))
    svg = replaceToken(svg, 'TITLE', escapeXML(title))
    svg = replaceToken(svg, 'MERCHANT_NAME', escapeXML(merchantName))
    svg = replaceToken(svg, 'AMOUNT', renderAmount(amount, currency))
    svg = replaceToken(svg, 'QR_SCALE', qr.scale)
    svg = replaceToken(svg, 'QR_PATH', qr.path)
    svg = replaceToken(svg, 'CURRENCY_ICON', renderCurrencyIcon(currency))

    return success(svg)
  } catch (cause) {
    return failed(
      error.invalidQR('Unable to render KHQR SVG', {
        cause: cause instanceof Error ? cause.message : String(cause),
      })
    )
  }
}

/** Convert raw SVG markup into a browser-safe data URI for use in image URLs. */
export const svgToDataURI = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`
