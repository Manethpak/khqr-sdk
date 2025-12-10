import { useState } from 'react'
import { generateQR, simulatePayment } from '../utils/api'
import QRCode from 'qrcode'
import { toast } from 'sonner'

export default function PaymentSimulatorPage() {
  const [merchantQR, setMerchantQR] = useState('')
  const [qrImage, setQRImage] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'pending' | 'success' | 'failed'
  >('idle')
  const [transactionId, setTransactionId] = useState('')
  const [step, setStep] = useState<'generate' | 'scan' | 'complete'>('generate')

  // Merchant form
  const [merchantForm, setMerchantForm] = useState({
    accountID: 'maneth_bakong',
    merchantName: 'Coffee Corner',
    merchantCity: 'Phnom Penh',
    amount: '5.00',
    currency: 'USD' as const,
    billNumber: `BILL${Date.now()}`,
  })

  // Customer form
  const [customerForm, setCustomerForm] = useState({
    customerName: 'John Doe',
    customerPhone: '+85512345678',
  })

  const handleGenerateQR = async () => {
    try {
      const qrString = await generateQR({
        accountID: merchantForm.accountID,
        merchantName: merchantForm.merchantName,
        merchantCity: merchantForm.merchantCity,
        amount: parseFloat(merchantForm.amount),
        currency: merchantForm.currency,
        billNumber: merchantForm.billNumber,
      })

      setMerchantQR(qrString)

      // Generate QR code image
      const dataUrl = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#002868',
          light: '#FFFFFF',
        },
      })
      setQRImage(dataUrl)

      setStep('scan')
      toast.success('QR Code generated! Customer can now scan to pay.')
    } catch (error) {
      toast.error('Failed to generate QR code')
      console.error(error)
    }
  }

  const handleSimulatePayment = async () => {
    if (!merchantQR) {
      toast.error('Please generate a QR code first')
      return
    }

    setPaymentStatus('pending')
    toast.loading('Processing payment...', { id: 'payment' })

    try {
      const result = await simulatePayment({
        qrString: merchantQR,
        customerName: customerForm.customerName,
        customerPhone: customerForm.customerPhone,
      })

      setTransactionId(result.transactionId)

      if (result.success) {
        setPaymentStatus('success')
        setStep('complete')
        toast.success('Payment successful!', { id: 'payment' })
      } else {
        setPaymentStatus('failed')
        toast.error(`Payment failed: ${result.message}`, { id: 'payment' })
      }
    } catch (error) {
      setPaymentStatus('failed')
      toast.error('Payment processing error', { id: 'payment' })
      console.error(error)
    }
  }

  const handleReset = () => {
    setMerchantQR('')
    setQRImage('')
    setPaymentStatus('idle')
    setTransactionId('')
    setStep('generate')
    setMerchantForm({
      ...merchantForm,
      billNumber: `BILL${Date.now()}`,
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Simulator
        </h1>
        <p className="text-gray-600">
          Experience a complete payment flow from merchant QR generation to
          customer payment
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div
            className={`flex items-center ${step === 'generate' ? 'text-bakong-blue' : step === 'scan' || step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step === 'generate' ? 'bg-bakong-blue text-white' : step === 'scan' || step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Generate QR</span>
          </div>
          <div
            className={`flex-1 h-1 mx-4 ${step === 'scan' || step === 'complete' ? 'bg-green-600' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex items-center ${step === 'scan' ? 'text-bakong-blue' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step === 'scan' ? 'bg-bakong-blue text-white' : step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Scan & Pay</span>
          </div>
          <div
            className={`flex-1 h-1 mx-4 ${step === 'complete' ? 'bg-green-600' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex items-center ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              3
            </div>
            <span className="ml-2 font-medium">Complete</span>
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Merchant Side */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-bakong-blue text-white rounded-full flex items-center justify-center font-semibold">
              M
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Merchant</h2>
              <p className="text-sm text-gray-600">Generate payment QR</p>
            </div>
          </div>

          {step === 'generate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bakong Account ID *
                </label>
                <input
                  type="text"
                  className="input"
                  value={merchantForm.accountID}
                  onChange={(e) =>
                    setMerchantForm({
                      ...merchantForm,
                      accountID: e.target.value,
                    })
                  }
                  placeholder="your_bakong_id"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant Name *
                </label>
                <input
                  type="text"
                  className="input"
                  value={merchantForm.merchantName}
                  onChange={(e) =>
                    setMerchantForm({
                      ...merchantForm,
                      merchantName: e.target.value,
                    })
                  }
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant City *
                </label>
                <input
                  type="text"
                  className="input"
                  value={merchantForm.merchantCity}
                  onChange={(e) =>
                    setMerchantForm({
                      ...merchantForm,
                      merchantCity: e.target.value,
                    })
                  }
                  placeholder="Phnom Penh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={merchantForm.amount}
                    onChange={(e) =>
                      setMerchantForm({
                        ...merchantForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    className="input"
                    value={merchantForm.currency}
                    onChange={(e) =>
                      setMerchantForm({
                        ...merchantForm,
                        currency: e.target.value as 'USD' | 'KHR',
                      })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="KHR">KHR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Number
                </label>
                <input
                  type="text"
                  className="input"
                  value={merchantForm.billNumber}
                  onChange={(e) =>
                    setMerchantForm({
                      ...merchantForm,
                      billNumber: e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </div>

              <button onClick={handleGenerateQR} className="btn-primary w-full">
                Generate QR Code
              </button>
            </div>
          )}

          {(step === 'scan' || step === 'complete') && qrImage && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <img
                  src={qrImage}
                  alt="Payment QR Code"
                  className="mx-auto mb-4"
                />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-900">
                    {merchantForm.merchantName}
                  </p>
                  <p className="text-gray-600">{merchantForm.merchantCity}</p>
                  <p className="text-2xl font-bold text-bakong-blue">
                    {merchantForm.amount} {merchantForm.currency}
                  </p>
                  {merchantForm.billNumber && (
                    <p className="text-gray-500">
                      Bill: {merchantForm.billNumber}
                    </p>
                  )}
                </div>
              </div>

              {step === 'complete' && paymentStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">
                        Payment Received!
                      </h3>
                      <p className="text-sm text-green-700">
                        Transaction ID: {transactionId}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Amount: {merchantForm.amount} {merchantForm.currency}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 'scan' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 text-center">
                    Waiting for customer to scan and pay...
                  </p>
                </div>
              )}

              {step === 'complete' && (
                <button onClick={handleReset} className="btn-outline w-full">
                  New Transaction
                </button>
              )}
            </div>
          )}
        </div>

        {/* Customer Side */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
              C
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer</h2>
              <p className="text-sm text-gray-600">Scan QR and pay</p>
            </div>
          </div>

          {step === 'generate' && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">
                Waiting for merchant to generate QR code...
              </p>
            </div>
          )}

          {step === 'scan' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 text-center font-medium mb-2">
                  QR Code Scanned!
                </p>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>Pay to: {merchantForm.merchantName}</p>
                  <p>
                    Amount: {merchantForm.amount} {merchantForm.currency}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  className="input"
                  value={customerForm.customerName}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      customerName: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="input"
                  value={customerForm.customerPhone}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      customerPhone: e.target.value,
                    })
                  }
                  placeholder="+855 12 345 678"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Payment Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Merchant</span>
                    <span className="font-medium">
                      {merchantForm.merchantName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">
                      {merchantForm.merchantCity}
                    </span>
                  </div>
                  {merchantForm.billNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bill Number</span>
                      <span className="font-medium">
                        {merchantForm.billNumber}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-bakong-blue">
                        {merchantForm.amount} {merchantForm.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={paymentStatus === 'pending'}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentStatus === 'pending'
                  ? 'Processing...'
                  : 'Confirm Payment'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                This simulation has a 90% success rate to demonstrate both
                success and failure scenarios
              </p>
            </div>
          )}

          {step === 'complete' && paymentStatus === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-green-700 mb-4">
                  Your payment has been processed
                </p>
                <div className="bg-white rounded-lg p-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono font-medium">
                      {transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid to</span>
                    <span className="font-medium">
                      {merchantForm.merchantName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold text-green-600">
                      {merchantForm.amount} {merchantForm.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && paymentStatus === 'failed' && (
            <div className="space-y-4">
              <div className="bg-red-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Payment Failed
                </h3>
                <p className="text-red-700 mb-4">
                  Please try again or contact support
                </p>
              </div>
              <button
                onClick={() => setStep('scan')}
                className="btn-primary w-full"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
