import { useState } from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../utils/api'
import type { DecodedQRData, VerifyResult } from '../types'

export default function VerifyQRPage() {
  const [qrString, setQrString] = useState('')
  const [decodedData, setDecodedData] = useState<DecodedQRData | null>(null)
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDecode = async () => {
    if (!qrString.trim()) {
      toast.error('Please enter a QR string')
      return
    }

    setLoading(true)
    setDecodedData(null)
    setVerifyResult(null)

    try {
      const result = await api.qr.decode(qrString)
      setDecodedData(result as DecodedQRData)
      toast.success('QR code decoded successfully!')
    } catch (error) {
      toast.error('Failed to decode QR code')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!qrString.trim()) {
      toast.error('Please enter a QR string')
      return
    }

    setLoading(true)
    setVerifyResult(null)

    try {
      const result = await api.qr.verify(qrString)
      setVerifyResult(result as VerifyResult)

      if ((result as VerifyResult).isValid) {
        toast.success('QR code is valid!')
      } else {
        toast.error('QR code validation failed')
      }
    } catch (error) {
      toast.error('Failed to verify QR code')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDecodeAndVerify = async () => {
    if (!qrString.trim()) {
      toast.error('Please enter a QR string')
      return
    }

    setLoading(true)
    setDecodedData(null)
    setVerifyResult(null)

    try {
      const [decoded, verified] = await Promise.all([
        api.qr.decode(qrString),
        api.qr.verify(qrString),
      ])

      setDecodedData(decoded as DecodedQRData)
      setVerifyResult(verified as VerifyResult)

      if ((verified as VerifyResult).isValid) {
        toast.success('QR code decoded and verified successfully!')
      } else {
        toast.warning('QR code decoded but validation failed')
      }
    } catch (error) {
      toast.error('Failed to process QR code')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQrString('')
    setDecodedData(null)
    setVerifyResult(null)
  }

  const loadExample = () => {
    // Example KHQR string
    setQrString(
      '00020101021229370012khqr_code_id01123456789012345678905802KH5916Example Merchant6011Phnom Penh99880016example_bill_no6304A1B2'
    )
    setDecodedData(null)
    setVerifyResult(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Verify QR Code
        </h1>
        <p className="text-gray-600">
          Decode and verify KHQR strings to validate CRC checksums
        </p>
      </div>

      {/* Input Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          QR String Input
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            KHQR String *
          </label>
          <textarea
            value={qrString}
            onChange={(e) => setQrString(e.target.value)}
            placeholder="Paste your KHQR string here..."
            className="input font-mono text-sm"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter or paste a complete KHQR string to decode and verify
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDecodeAndVerify}
            disabled={loading || !qrString.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield className="w-4 h-4" />
            {loading ? 'Processing...' : 'Decode & Verify'}
          </button>
          <button
            onClick={handleDecode}
            disabled={loading || !qrString.trim()}
            className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Decode Only
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || !qrString.trim()}
            className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify Only
          </button>
          <button onClick={loadExample} className="btn-outline">
            Load Example
          </button>
          {(decodedData || verifyResult) && (
            <button
              onClick={handleReset}
              className="btn-outline text-red-600 hover:bg-red-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Verification Result */}
        {verifyResult && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Verification Result
            </h2>

            {verifyResult.isValid ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-1">
                      Valid QR Code
                    </h3>
                    <p className="text-sm text-green-700">
                      CRC checksum is valid. This QR code can be trusted.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-1">
                      Invalid QR Code
                    </h3>
                    <p className="text-sm text-red-700">
                      CRC checksum validation failed. This QR code may be
                      corrupted or tampered.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Status
                </span>
                <span
                  className={`text-sm font-semibold ${
                    verifyResult.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {verifyResult.isValid ? 'VALID' : 'INVALID'}
                </span>
              </div>

              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Expected CRC
                </span>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {verifyResult.expectedCRC}
                </code>
              </div>

              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Actual CRC
                </span>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {verifyResult.actualCRC}
                </code>
              </div>

              {verifyResult.errors && verifyResult.errors.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                        Validation Errors
                      </h4>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {verifyResult.errors.map((error, index) => (
                          <li key={index}>&bull; {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Decoded Data */}
        {decodedData && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Decoded Data
            </h2>

            <div className="space-y-3">
              {/* Basic Info */}
              {decodedData.merchantName && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Merchant Name
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {decodedData.merchantName}
                  </span>
                </div>
              )}

              {decodedData.merchantCity && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Merchant City
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {decodedData.merchantCity}
                  </span>
                </div>
              )}

              {decodedData.merchantAccountInfo?.bakongAccountID && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Bakong Account ID
                  </span>
                  <code className="text-sm font-mono text-gray-900">
                    {decodedData.merchantAccountInfo.bakongAccountID}
                  </code>
                </div>
              )}

              {decodedData.transactionAmount && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Amount
                  </span>
                  <span className="text-lg font-bold text-bakong-blue">
                    {decodedData.transactionAmount}{' '}
                    {decodedData.transactionCurrency === '840' ? 'USD' : 'KHR'}
                  </span>
                </div>
              )}

              {/* Additional Data */}
              {decodedData.additionalData && (
                <div className="pt-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Additional Data
                  </h3>
                  <div className="space-y-2">
                    {decodedData.additionalData.billNumber && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-gray-600">
                          Bill Number
                        </span>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {decodedData.additionalData.billNumber}
                        </span>
                      </div>
                    )}
                    {decodedData.additionalData.mobileNumber && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-gray-600">
                          Mobile Number
                        </span>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {decodedData.additionalData.mobileNumber}
                        </span>
                      </div>
                    )}
                    {decodedData.additionalData.storeLabel && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-gray-600">
                          Store Label
                        </span>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {decodedData.additionalData.storeLabel}
                        </span>
                      </div>
                    )}
                    {decodedData.additionalData.terminalLabel && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-gray-600">
                          Terminal Label
                        </span>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {decodedData.additionalData.terminalLabel}
                        </span>
                      </div>
                    )}
                    {decodedData.additionalData.purposeOfTransaction && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-gray-600">Purpose</span>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {decodedData.additionalData.purposeOfTransaction}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <details className="pt-3">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-bakong-blue">
                  Technical Details
                </summary>
                <div className="mt-3 space-y-2 text-xs">
                  {decodedData.payloadFormatIndicator && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payload Format</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {decodedData.payloadFormatIndicator}
                      </code>
                    </div>
                  )}
                  {decodedData.pointOfInitiationMethod && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Initiation Method</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {decodedData.pointOfInitiationMethod}
                      </code>
                    </div>
                  )}
                  {decodedData.merchantCategoryCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Category Code</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {decodedData.merchantCategoryCode}
                      </code>
                    </div>
                  )}
                  {decodedData.countryCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Country Code</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {decodedData.countryCode}
                      </code>
                    </div>
                  )}
                  {decodedData.crc && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">CRC</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {decodedData.crc}
                      </code>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      {!decodedData && !verifyResult && (
        <div className="card mt-6 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                How to use this tool
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>&bull; Paste a KHQR string in the input field above</li>
                <li>
                  &bull; Click "Decode & Verify" to decode and validate the QR
                  in one step
                </li>
                <li>
                  &bull; Use "Decode Only" to see the QR contents without
                  validation
                </li>
                <li>
                  &bull; Use "Verify Only" to check CRC checksum without
                  decoding
                </li>
                <li>
                  &bull; Click "Load Example" to try with a sample QR code
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
