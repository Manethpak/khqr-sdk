import { Hono } from 'hono'
import { khqr } from '../khqr'

const app = new Hono()

// Generate KHQR
app.post('/generate', async (c) => {
  try {
    const body = await c.req.json()
    const result = khqr.qr.generateKHQR(body)

    if (result.error) {
      return c.json(
        {
          error: result.error.message,
          code: result.error.code,
          details: result.error.details,
        },
        400
      )
    }

    return c.json(result.result)
  } catch (error) {
    return c.json(
      {
        error: 'Failed to generate QR code',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// Decode KHQR
app.post('/decode', async (c) => {
  try {
    const { qr: qrString } = await c.req.json()

    if (!qrString || typeof qrString !== 'string') {
      return c.json({ error: 'QR string is required' }, 400)
    }

    const result = khqr.qr.decodeKHQR(qrString)

    if (result.error) {
      return c.json(
        {
          error: result.error.message,
          code: result.error.code,
          details: result.error.details,
        },
        400
      )
    }

    return c.json(result.result)
  } catch (error) {
    return c.json(
      {
        error: 'Failed to decode QR code',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// Verify KHQR
app.post('/verify', async (c) => {
  try {
    const { qr: qrString } = await c.req.json()

    if (!qrString || typeof qrString !== 'string') {
      return c.json({ error: 'QR string is required' }, 400)
    }

    const result = khqr.qr.verifyKHQRString(qrString)

    if (result.error) {
      return c.json(
        {
          error: result.error.message,
          code: result.error.code,
          details: result.error.details,
        },
        400
      )
    }

    return c.json(result.result)
  } catch (error) {
    return c.json(
      {
        error: 'Failed to verify QR code',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

export default app
