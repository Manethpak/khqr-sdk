import { Hono } from 'hono'
import { createKHQR } from '@manethpak/khqr-sdk'

const app = new Hono()

// Helper to get khqr instance with token priority
// If user provides token, use it; otherwise use server's env token
const getKHQR = (userToken?: string) => {
  const token = userToken || process.env.BAKONG_API_TOKEN

  if (!token) {
    console.warn(
      '⚠️  No Bakong API token configured. Set BAKONG_API_TOKEN in .env or provide token in request.'
    )
  }

  return createKHQR({
    baseURL: 'https://api-bakong.nbc.gov.kh',
    authToken: token,
  })
}

// POST /api/bakong/renew-token
// Renew API authentication token
app.post('/renew-token', async (c) => {
  try {
    const { email, token } = await c.req.json()

    if (!email || typeof email !== 'string') {
      return c.json({ error: 'Email is required' }, 400)
    }

    const khqr = getKHQR(token)
    const response = await khqr.api.renew_token(email)

    return c.json({
      ...response,
      tokenSource: token ? 'user' : 'env',
    })
  } catch (error) {
    return c.json(
      {
        error: 'Failed to renew token',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// POST /api/bakong/check-account
// Check if a Bakong account exists
app.post('/check-account', async (c) => {
  try {
    const { bakongAccountID, token } = await c.req.json()

    if (!bakongAccountID || typeof bakongAccountID !== 'string') {
      return c.json({ error: 'Bakong Account ID is required' }, 400)
    }

    const khqr = getKHQR(token)

    // Log for debugging
    console.log('Checking account:', bakongAccountID)
    console.log(
      'Using token:',
      token ? 'user-provided' : 'from env',
      token
        ? '(provided)'
        : process.env.BAKONG_API_TOKEN
          ? '(set)'
          : '(missing)'
    )

    const response = await khqr.api.check_backong_account(bakongAccountID)

    return c.json({
      ...response,
      tokenSource: token ? 'user' : 'env',
    })
  } catch (error) {
    console.error('Error checking account:', error)
    return c.json(
      {
        error: 'Failed to check account',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// POST /api/bakong/check-tx-md5
// Check transaction by MD5 hash
app.post('/check-tx-md5', async (c) => {
  try {
    const { md5, token } = await c.req.json()

    if (!md5 || typeof md5 !== 'string') {
      return c.json({ error: 'MD5 hash is required' }, 400)
    }

    const khqr = getKHQR(token)
    const response = await khqr.api.check_transaction_by_md5(md5)

    return c.json({
      ...response,
      tokenSource: token ? 'user' : 'env',
    })
  } catch (error) {
    return c.json(
      {
        error: 'Failed to check transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// POST /api/bakong/check-tx-short-hash
// Check transaction by short hash (requires hash, amount, and currency)
app.post('/check-tx-short-hash', async (c) => {
  try {
    const { shortHashRequest, token } = await c.req.json()

    if (!shortHashRequest) {
      return c.json({ error: 'Short hash request data is required' }, 400)
    }

    const { hash, amount, currency } = shortHashRequest

    if (!hash || typeof hash !== 'string') {
      return c.json({ error: 'Hash is required' }, 400)
    }

    if (!amount || typeof amount !== 'number') {
      return c.json({ error: 'Amount is required and must be a number' }, 400)
    }

    if (!currency || (currency !== 'KHR' && currency !== 'USD')) {
      return c.json({ error: 'Currency must be KHR or USD' }, 400)
    }

    const khqr = getKHQR(token)
    const response = await khqr.api.check_transaction_by_short_hash({
      hash,
      amount,
      currency,
    })

    return c.json({
      ...response,
      tokenSource: token ? 'user' : 'env',
    })
  } catch (error) {
    console.error('Error checking transaction by short hash:', error)
    return c.json(
      {
        error: 'Failed to check transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

export default app
