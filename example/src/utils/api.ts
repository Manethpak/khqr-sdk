import type { QRResult } from '@/types'

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Request failed',
    }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Helper functions for common use cases
export async function generateQR(data: {
  accountID: string
  merchantName: string
  merchantCity: string
  amount?: number
  currency?: 'USD' | 'KHR'
  billNumber?: string
  storeLabel?: string
  terminalLabel?: string
  purposeOfTransaction?: string
  mobileNumber?: string
}): Promise<string> {
  const result = await apiRequest<{ qr: string }>('/qr/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return result.qr
}

export async function simulatePayment(data: {
  qrString: string
  customerName: string
  customerPhone: string
}): Promise<{
  success: boolean
  transactionId: string
  message: string
}> {
  return apiRequest('/payments/simulate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const api = {
  qr: {
    generate: (data: unknown): Promise<QRResult> =>
      apiRequest<QRResult>('/qr/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    decode: (qr: string) =>
      apiRequest('/qr/decode', {
        method: 'POST',
        body: JSON.stringify({ qr }),
      }),
    verify: (qr: string) =>
      apiRequest('/qr/verify', {
        method: 'POST',
        body: JSON.stringify({ qr }),
      }),
  },
  payments: {
    initiate: (qr: string, customerAccountId: string) =>
      apiRequest('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ qr, customerAccountId }),
      }),
    confirm: (paymentId: string) =>
      apiRequest('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentId }),
      }),
    getById: (id: string) => apiRequest(`/payments/${id}`),
    getByMD5: (md5: string) => apiRequest(`/payments/md5/${md5}`),
    getAll: (status?: string) =>
      apiRequest(`/payments${status ? `?status=${status}` : ''}`),
    clearAll: () =>
      apiRequest('/payments', {
        method: 'DELETE',
      }),
  },
  bakong: {
    renewToken: (email: string, token?: string) =>
      apiRequest('/bakong/renew-token', {
        method: 'POST',
        body: JSON.stringify({ email, token }),
      }),
    checkAccount: (bakongAccountID: string, token?: string) =>
      apiRequest('/bakong/check-account', {
        method: 'POST',
        body: JSON.stringify({ bakongAccountID, token }),
      }),
    checkTransactionByMD5: (md5: string, token?: string) =>
      apiRequest('/bakong/check-tx-md5', {
        method: 'POST',
        body: JSON.stringify({ md5, token }),
      }),
    checkTransactionByShortHash: (
      shortHashRequest: {
        hash: string
        amount: number
        currency: 'KHR' | 'USD'
      },
      token?: string
    ) =>
      apiRequest('/bakong/check-tx-short-hash', {
        method: 'POST',
        body: JSON.stringify({ shortHashRequest, token }),
      }),
  },
}
