import type { QRResult } from '@/types'

const API_BASE = '/api'

export interface APIResponse {
  responseCode: 0 | 1
  responseMessage: string
  errorCode: number | null
  data: any
  tokenSource?: 'user' | 'env'
}

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
      apiRequest<QRResult>('/qr/generate.json', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    decode: (qr: string) =>
      apiRequest('/qr/decode.json', {
        method: 'POST',
        body: JSON.stringify({ qr }),
      }),
    verify: (qr: string) =>
      apiRequest('/qr/verify.json', {
        method: 'POST',
        body: JSON.stringify({ qr }),
      }),
  },
  payments: {
    initiate: (qr: string, customerAccountId: string) =>
      apiRequest('/payments/initiate.json', {
        method: 'POST',
        body: JSON.stringify({ qr, customerAccountId }),
      }),
    confirm: (paymentId: string) =>
      apiRequest('/payments/confirm.json', {
        method: 'POST',
        body: JSON.stringify({ paymentId }),
      }),
    getById: (id: string) => apiRequest(`/payments/${id}`),
    getByMD5: (md5: string) => apiRequest(`/payments/md5/${md5}`),
    getAll: (status?: string) =>
      apiRequest(`/payments${status ? `?status=${status}` : ''}`),
    clearAll: () =>
      apiRequest('/payments.json', {
        method: 'DELETE',
      }),
  },
  bakong: {
    renewToken: (email: string, token?: string): Promise<APIResponse> =>
      apiRequest<APIResponse>('/bakong/renew-token.json', {
        method: 'POST',
        body: JSON.stringify({ email, token }),
      }),
    checkAccount: (
      bakongAccountID: string,
      token?: string
    ): Promise<APIResponse> =>
      apiRequest<APIResponse>('/bakong/check-account.json', {
        method: 'POST',
        body: JSON.stringify({ bakongAccountID, token }),
      }),
    checkTransactionByMD5: (
      md5: string,
      token?: string
    ): Promise<APIResponse> =>
      apiRequest<APIResponse>('/bakong/check-tx-md5.json', {
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
    ): Promise<APIResponse> =>
      apiRequest<APIResponse>('/bakong/check-tx-short-hash.json', {
        method: 'POST',
        body: JSON.stringify({ shortHashRequest, token }),
      }),
  },
}
