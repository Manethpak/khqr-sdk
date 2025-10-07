import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'types/index': './src/qr/types/index.ts',
    'constants/index': './src/qr/constants/index.ts',
    'helper/index': './src/qr/helper/index.ts',
  }, // Entry files
  format: ['esm', 'cjs'], // Support for ESM and CommonJS
  clean: true,
  minify: true,
  treeshake: true,
})
