import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { createKHQR } from 'khqr-sdk'
import z from 'zod'

const app = new Hono()
app.use(logger())

const khqr = createKHQR({
  baseURL: 'https://api-bakong.nbc.gov.kh',
  auth: {
    type: 'Bearer',
    token: process.env.BAKONG_API_TOKEN || 'YOUR_JWT_TOKEN',
  },
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post(
  '/check-account',
  zValidator(
    'json',
    z.object({
      accountId: z.string().min(1),
    })
  ),
  async (c) => {
    const { accountId } = c.req.valid('json')

    const { data, error } = await khqr.$fetch('/v1/check_bakong_account', {
      body: {
        accountId: accountId,
      },
    })

    if (error) {
      return c.json(
        {
          data: null,
          error,
        },
        error.status as ContentfulStatusCode
      )
    }

    return c.json({
      data,
      error: null,
    })
  }
)

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
