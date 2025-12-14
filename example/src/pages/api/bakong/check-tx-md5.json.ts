import type { APIRoute } from 'astro'
import { createKHQR } from '@manethpak/khqr-sdk'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { md5, token } = body

    if (!md5 || typeof md5 !== 'string') {
      return new Response(JSON.stringify({ error: 'MD5 hash is required' }), {
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

    const response = await khqr.api.check_transaction_by_md5(md5)

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
