import type { APIRoute } from 'astro'
import { createKHQR } from '@manethpak/khqr-sdk'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { bakongAccountID, token } = body

    if (!bakongAccountID || typeof bakongAccountID !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Bakong Account ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use user-provided token or fallback to server env token
    const authToken = token || import.meta.env.BAKONG_API_TOKEN

    const khqr = createKHQR({
      baseURL: 'https://api-bakong.nbc.gov.kh',
      authToken,
    })

    const response = await khqr.api.check_backong_account(bakongAccountID)

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
        error: 'Failed to check account',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
