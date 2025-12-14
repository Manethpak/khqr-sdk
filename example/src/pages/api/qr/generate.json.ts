import type { APIRoute } from 'astro'
import { createKHQR } from '@manethpak/khqr-sdk'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()

    const khqr = createKHQR({
      baseURL: 'https://api-bakong.nbc.gov.kh',
      authToken: import.meta.env.BAKONG_API_TOKEN,
    })

    if (!body.expiryTime) {
      body.expiryTime = 100
    }
    const expiryTime = body.expiryTime * 1000 + Date.now()

    const result = khqr.qr.generateKHQR({
      ...body,
      expirationTimestamp: expiryTime,
      acquiringBank: body.bakongAccountID?.split('@')[1] || '',
    })

    if (result.error) {
      return new Response(
        JSON.stringify({
          error: result.error.message,
          code: result.error.code,
          details: result.error.details,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify(result.result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to generate QR code',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
