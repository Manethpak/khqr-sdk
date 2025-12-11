import { useState } from 'react'
import { QrCode, Copy, Download, Check } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import { api } from '@/utils/api'
import type { QRResult } from '@/types'

export default function QRGeneratorPage() {
  const [formData, setFormData] = useState({
    bakongAccountID: '',
    merchantName: '',
    merchantCity: '',
    currency: 'KHR' as 'KHR' | 'USD',
    amount: '',
    merchantID: '',
    billNumber: '',
    mobileNumber: '',
  })

  const [qrResult, setQrResult] = useState<QRResult | null>(null)
  const [qrImageUrl, setQrImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        bakongAccountID: formData.bakongAccountID,
        merchantName: formData.merchantName,
        merchantCity: formData.merchantCity,
        currency: formData.currency,
      }

      if (formData.amount) {
        payload.amount = parseFloat(formData.amount)
      }

      if (formData.merchantID) {
        payload.merchantID = formData.merchantID
      }

      if (formData.billNumber) {
        payload.billNumber = formData.billNumber
      }

      if (formData.mobileNumber) {
        payload.mobileNumber = formData.mobileNumber
      }

      const result = await api.qr.generate(payload)
      setQrResult(result)

      // Generate QR code image
      const qrDataUrl = await QRCode.toDataURL(result.qr, {
        width: 300,
        margin: 2,
      })
      setQrImageUrl(qrDataUrl)

      toast.success('QR Code generated successfully!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate QR code'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const downloadQR = () => {
    if (!qrImageUrl) return

    const link = document.createElement('a')
    link.href = qrImageUrl
    link.download = `khqr-${qrResult?.md5}.png`
    link.click()
    toast.success('QR Code downloaded!')
  }

  const loadExample = (type: 'static' | 'dynamic') => {
    if (type === 'static') {
      setFormData({
        bakongAccountID: 'coffee@aclb',
        merchantName: 'Coffee Shop',
        merchantCity: 'Phnom Penh',
        currency: 'KHR',
        amount: '',
        merchantID: '',
        billNumber: '',
        mobileNumber: '+85512345678',
      })
    } else {
      setFormData({
        bakongAccountID: 'restaurant@aclb',
        merchantName: 'Thai Restaurant',
        merchantCity: 'Phnom Penh',
        currency: 'USD',
        amount: '25.50',
        merchantID: 'MERCHANT001',
        billNumber: 'INV-2024-001',
        mobileNumber: '+85598765432',
      })
    }
    toast.info(`Loaded ${type} QR example`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            QR Code Generator
          </h1>
          <p className="text-gray-600 mt-1">
            Generate static or dynamic KHQR codes for your business
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadExample('static')}
            className="btn-secondary text-sm"
          >
            Load Static Example
          </button>
          <button
            type="button"
            onClick={() => loadExample('dynamic')}
            className="btn-secondary text-sm"
          >
            Load Dynamic Example
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bakong Account ID *
              </label>
              <input
                type="text"
                name="bakongAccountID"
                value={formData.bakongAccountID}
                onChange={handleChange}
                className="input"
                placeholder="user@bank"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merchant Name *
              </label>
              <input
                type="text"
                name="merchantName"
                value={formData.merchantName}
                onChange={handleChange}
                className="input"
                placeholder="Coffee Shop"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="merchantCity"
                value={formData.merchantCity}
                onChange={handleChange}
                className="input"
                placeholder="Phnom Penh"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="KHR">KHR (៛)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount{' '}
                  <span className="text-gray-400">
                    (optional for static QR)
                  </span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.00"
                  step={formData.currency === 'USD' ? '0.01' : '1'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merchant ID{' '}
                <span className="text-gray-400">(for merchant accounts)</span>
              </label>
              <input
                type="text"
                name="merchantID"
                value={formData.merchantID}
                onChange={handleChange}
                className="input"
                placeholder="MERCHANT001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                name="billNumber"
                value={formData.billNumber}
                onChange={handleChange}
                className="input"
                placeholder="INV-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="input"
                placeholder="+85512345678"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </form>
        </div>

        {/* QR Code Display */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generated QR Code
          </h2>

          {qrResult ? (
            <div className="space-y-4">
              {/* QR Image */}
              <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                {qrImageUrl && (
                  <img
                    src={qrImageUrl}
                    alt="Generated QR Code"
                    className="max-w-full h-auto"
                  />
                )}
              </div>

              {/* QR String */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR String
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrResult.qr}
                    readOnly
                    className="input font-mono text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(qrResult.qr)}
                    className="btn-secondary"
                    title="Copy QR string"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* MD5 Hash */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MD5 Hash
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrResult.md5}
                    readOnly
                    className="input font-mono text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(qrResult.md5)}
                    className="btn-secondary"
                    title="Copy MD5 hash"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this MD5 hash to track transactions via Bakong API
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={downloadQR}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Type:</strong>{' '}
                  {formData.amount ? 'Dynamic' : 'Static'} QR Code
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  {formData.amount
                    ? `Fixed amount: ${formData.amount} ${formData.currency}`
                    : 'Customer will enter the amount when scanning'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <QrCode className="w-16 h-16 mb-4" />
              <p className="text-center">
                Fill in the form and click "Generate QR Code" to create your
                KHQR payment code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
