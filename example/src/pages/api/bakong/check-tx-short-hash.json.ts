import type { APIRoute } from 'astro'
import { createKHQR } from '@manethpak/khqr-sdk'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { shortHashRequest, token } = body

    if (!shortHashRequest) {
      return new Response(
        JSON.stringify({ error: 'Short hash request data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { hash, amount, currency } = shortHashRequest

    if (!hash || typeof hash !== 'string') {
      return new Response(JSON.stringify({ error: 'Hash is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!amount || typeof amount !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Amount is required and must be a number' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!currency || (currency !== 'KHR' && currency !== 'USD')) {
      return new Response(
        JSON.stringify({ error: 'Currency must be KHR or USD' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use user-provided token or fallback to server env token
    const authToken = token || import.meta.env.BAKONG_API_TOKEN

    const khqr = createKHQR({
      baseURL: 'https://api-bakong.nbc.gov.kh',
      authToken,
    })

    const response = await khqr.api.check_transaction_by_short_hash({
      hash,
      amount,
      currency,
    })

    return new Response(
      JSON.stringify({
        ...response,
        tokenSource: token ? 'user' : 'env',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to check transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
