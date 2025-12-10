import { createKHQR } from '@manethpak/khqr-sdk'

export const khqr = createKHQR({
  baseURL: 'https://api-bakong.nbc.gov.kh',
  authToken: process.env.BAKONG_API_KEY,
})
