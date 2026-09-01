import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  output: 'server',

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@manethpak/khqr-sdk/svg': fileURLToPath(
          new URL('../src/svg/index.ts', import.meta.url)
        ),
        qrcode: fileURLToPath(import.meta.resolve('qrcode')),
      },
    },
  },
})
