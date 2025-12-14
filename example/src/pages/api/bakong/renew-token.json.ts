import type { APIRoute } from 'astro'
import { createKHQR } from '@manethpak/khqr-sdk'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { email, token } = body

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Use user-provided token or fallback to server env token
    const authToken = token || import.meta.env.BAKONG_API_TOKEN

    const khqr = createKHQR({
      baseURL: 'https://api-bakong.nbc.gov.kh',
      authToken,
    })

    const response = await khqr.api.renew_token(email)

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
        error: 'Failed to renew token',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
