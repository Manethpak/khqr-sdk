import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { createKHQR } from '@manethpak/khqr-sdk'
import { z } from 'zod'

const app = new Hono()
app.use(logger())

// Initialize KHQR SDK
const khqr = createKHQR({
  baseURL: process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh',
  authToken: process.env.BAKONG_API_TOKEN,
})

// Serve static files
app.use('/*', serveStatic({ root: './public' }))

// ============================================
// QR GENERATION ENDPOINTS
// ============================================

app.post(
  '/api/qr/generate-static',
  zValidator(
    'json',
    z.object({
      bakongAccountID: z.string().min(1),
      merchantName: z.string().min(1),
      merchantCity: z.string().min(1),
      currency: z.enum(['KHR', 'USD']).default('KHR'),
      merchantCategoryCode: z.string().optional(),
    })
  ),
  (c) => {
    const data = c.req.valid('json')
    const result = khqr.qr.generateKHQR(data)
    return result.error
      ? c.json({ error: result.error }, 400)
      : c.json({ data: result.result })
  }
)

app.post(
  '/api/qr/generate-dynamic',
  zValidator(
    'json',
    z.object({
      bakongAccountID: z.string().min(1),
      merchantName: z.string().min(1),
      merchantCity: z.string().min(1),
      amount: z.number().positive(),
      currency: z.enum(['KHR', 'USD']).default('KHR'),
      billNumber: z.string().optional(),
      mobileNumber: z.string().optional(),
      storeLabel: z.string().optional(),
      terminalLabel: z.string().optional(),
      purposeOfTransaction: z.string().optional(),
    })
  ),
  (c) => {
    const data = c.req.valid('json')
    const result = khqr.qr.generateKHQR(data)
    return result.error
      ? c.json({ error: result.error }, 400)
      : c.json({ data: result.result })
  }
)

app.post(
  '/api/qr/generate-merchant',
  zValidator(
    'json',
    z.object({
      bakongAccountID: z.string().min(1),
      merchantID: z.string().min(1),
      merchantName: z.string().min(1),
      merchantCity: z.string().min(1),
      acquiringBank: z.string().optional(),
      amount: z.number().positive().optional(),
      currency: z.enum(['KHR', 'USD']).default('KHR'),
      merchantCategoryCode: z.string().optional(),
    })
  ),
  (c) => {
    const data = c.req.valid('json')
    const result = khqr.qr.generateKHQR(data)
    return result.error
      ? c.json({ error: result.error }, 400)
      : c.json({ data: result.result })
  }
)

// ============================================
// QR DECODING & VERIFICATION ENDPOINTS
// ============================================

app.post(
  '/api/qr/decode',
  zValidator('json', z.object({ qrString: z.string().min(1) })),
  (c) => {
    const { qrString } = c.req.valid('json')
    const result = khqr.qr.decodeKHQR(qrString)
    return result.error
      ? c.json({ error: result.error }, 400)
      : c.json({ data: result.result })
  }
)

app.post(
  '/api/qr/verify',
  zValidator('json', z.object({ qrString: z.string().min(1) })),
  (c) => {
    const { qrString } = c.req.valid('json')
    const result = khqr.qr.verifyKHQRString(qrString)
    return result.error
      ? c.json({ error: result.error }, 400)
      : c.json({ data: result.result })
  }
)

// ============================================
// BAKONG API ENDPOINTS
// ============================================

app.post(
  '/api/bakong/renew-token',
  zValidator('json', z.object({ email: z.string().min(1) })),
  async (c) => {
    try {
      const { email } = c.req.valid('json')
      const response = await khqr.api.renew_token(email)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/check-account',
  zValidator('json', z.object({ bakongAccountID: z.string().min(1) })),
  async (c) => {
    try {
      const { bakongAccountID } = c.req.valid('json')
      const response = await khqr.api.check_backong_account(bakongAccountID)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/generate-deeplink',
  zValidator(
    'json',
    z.object({
      qr: z.string().min(1),
      sourceInfo: z.object({
        appIconUrl: z.string().min(1),
        appName: z.string().min(1),
        appDeepLinkCallback: z.string().min(1),
      }),
    })
  ),
  async (c) => {
    try {
      const data = c.req.valid('json')
      const response = await khqr.api.generate_deeplink(data)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/check-transaction-md5',
  zValidator('json', z.object({ md5: z.string().min(1) })),
  async (c) => {
    try {
      const { md5 } = c.req.valid('json')
      const response = await khqr.api.check_transaction_by_md5(md5)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/check-transaction-hash',
  zValidator('json', z.object({ hash: z.string().min(1) })),
  async (c) => {
    try {
      const { hash } = c.req.valid('json')
      const response = await khqr.api.check_transaction_by_hash(hash)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/check-transaction-short-hash',
  zValidator('json', z.object({ shortHash: z.string().min(1) })),
  async (c) => {
    try {
      const { shortHash } = c.req.valid('json')
      const response = await khqr.api.check_transaction_by_short_hash(shortHash)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/check-transaction-instruction-ref',
  zValidator('json', z.object({ instructionRef: z.string().min(1) })),
  async (c) => {
    try {
      const { instructionRef } = c.req.valid('json')
      const response =
        await khqr.api.check_transaction_by_instruction_ref(instructionRef)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/check-transaction-external-ref',
  zValidator('json', z.object({ externalRef: z.string().min(1) })),
  async (c) => {
    try {
      const { externalRef } = c.req.valid('json')
      const response =
        await khqr.api.check_transaction_by_external_ref(externalRef)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/check-transaction-md5-list',
  zValidator('json', z.object({ md5List: z.array(z.string().min(1)) })),
  async (c) => {
    try {
      const { md5List } = c.req.valid('json')
      const response = await khqr.api.check_transaction_by_md5_list(md5List)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

app.post(
  '/api/bakong/check-transaction-hash-list',
  zValidator('json', z.object({ hashList: z.array(z.string().min(1)) })),
  async (c) => {
    try {
      const { hashList } = c.req.valid('json')
      const response = await khqr.api.check_transaction_by_hash_list(hashList)
      return c.json({ data: response })
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500
      )
    }
  }
)

// Start server
const port = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port }, (info) => {
  console.log(
    `🚀 KHQR SDK Demo Server running at http://localhost:${info.port}`
  )
  console.log(
    `📖 Open the URL in your browser to see all SDK functions in action`
  )
})
