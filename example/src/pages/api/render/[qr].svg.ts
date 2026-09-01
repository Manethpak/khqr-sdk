import type { APIRoute } from 'astro'
import { generateKHQRSVG } from '@manethpak/khqr-sdk/svg'

export const GET: APIRoute = ({ params }) => {
  const qrString = params.qr

  if (!qrString) {
    return new Response('KHQR string is required', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const rendered = generateKHQRSVG(qrString)

  if (rendered.error) {
    return new Response(rendered.error.message, {
      status: 400,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  }

  return new Response(rendered.result, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
