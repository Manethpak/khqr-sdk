import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'types/index': './src/qr/types/index.ts',
    'constants/index': './src/qr/constants/index.ts',
    'helper/index': './src/qr/helper/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: false,
})
