import { createFetch } from '@better-fetch/fetch'
import { $schema } from './schema'

// Export your public API here
export const VERSION = '1.0.0'

async function main() {
  const $fetch = createFetch({
    schema: $schema,
    baseURL: 'https://api-bakong.nbc.gov.kh',
  })

  const { data, error } = await $fetch('/v1/generate_deeplink_by_qr', {
    body: {
      qr: 'manethpak00@gmail.com',
      sourceInfo: {
        appIconUrl: 'https://example.com/icon.png',
        appName: 'My App',
        appDeepLinkCallback: 'myapp://callback',
      },
    },
  })
  data?.data.shortLink
}

main()
