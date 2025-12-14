# KHQR SDK Demo

> Interactive demo application showcasing the KHQR SDK for Cambodia's Bakong QR payment system.

![KHQR Demo](../public/preview.png)

## 🎯 Features

- **QR Code Generator**: Create static and dynamic KHQR codes with customizable payment details
- **Bakong API Tester**: Test real Bakong API endpoints with manual input
- **QR Verification**: Decode and validate KHQR strings with CRC integrity checks
- **Type-Safe**: Full TypeScript support throughout the application
- **Modern SSR**: Built with Astro, React islands, and TailwindCSS

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

Then open **http://localhost:4321** in your browser.

### Production

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Deploy to Vercel
pnpm deploy
```

## 📁 Project Structure

```
example/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── qr/
│   │   │   │   └── generate.ts       # QR generation endpoint
│   │   │   └── bakong/
│   │   │       ├── check-account.ts  # Bakong API proxy
│   │   │       ├── check-tx-md5.ts   # Transaction check proxy
│   │   │       └── ...
│   │   ├── index.astro               # Homepage
│   │   ├── generator.astro           # QR Generator page
│   │   └── api-tester.astro          # API Tester page
│   ├── components/
│   │   ├── QRGeneratorClient.tsx     # QR Generator React island
│   │   ├── BakongAPITesterClient.tsx # API Tester React island
│   │   └── ToasterProvider.tsx       # Toast notifications
│   ├── layouts/
│   │   └── Layout.astro              # Base layout
│   ├── styles/
│   │   └── index.css                 # Global styles
│   ├── utils/
│   │   └── api.ts                    # API client functions
│   └── types/
│       └── index.ts                  # TypeScript types
├── public/                            # Static assets
├── astro.config.mjs                   # Astro configuration
├── tailwind.config.js                 # TailwindCSS configuration
├── vercel.json                        # Vercel deployment config
└── package.json
```

## 🔌 API Endpoints

### QR Operations

```
POST /api/qr/generate
  Body: { bakongAccountID, merchantName, merchantCity, currency, amount?, ... }
  Response: { qr: string, md5: string }
```

### Bakong API (Proxy Endpoints)

```
POST /api/bakong/renew-token
  Body: { email, token? }
  Response: APIResponse

POST /api/bakong/check-account
  Body: { bakongAccountID, token? }
  Response: APIResponse

POST /api/bakong/check-tx-md5
  Body: { md5, token? }
  Response: APIResponse

POST /api/bakong/check-tx-short-hash
  Body: { shortHashRequest: { hash, amount, currency }, token? }
  Response: APIResponse
```

## 📦 Tech Stack

### Framework

- **Astro 5** - SSR framework with React islands architecture
- **React 18** - Interactive UI components (islands)
- **TypeScript** - Type safety

### Styling

- **TailwindCSS** - Utility-first CSS
- **Lucide React** - Icons

### Libraries

- **@manethpak/khqr-sdk** - KHQR generation, decoding, and validation
- **QRCode** - QR code image generation
- **Sonner** - Toast notifications

### Deployment

- **Vercel** - Serverless deployment with edge functions

## 🌐 Deployment

### Deploy to Vercel

The easiest way to deploy this demo:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/manethpak/khqr-sdk/tree/main/example)

Or manually:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
cd example
vercel
```

### Environment Variables

For real Bakong API integration (optional):

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your token
BAKONG_API_TOKEN=your_jwt_token_here
```

## Architecture

This demo uses **Astro's islands architecture** for optimal performance:

- **Static pages**: Generated at build time (homepage)
- **SSR pages**: Server-rendered on demand (generator, api-tester)
- **React islands**: Interactive components hydrated on the client
- **API routes**: Serverless functions that proxy to Bakong API or handle QR generation

### Why Astro?

- **Better performance**: Ships minimal JavaScript (only islands are interactive)
- **Simpler deployment**: Single unified codebase with built-in SSR
- **Vercel-optimized**: First-class Vercel adapter support
- **Developer experience**: File-based routing, automatic TypeScript support

### API Proxy Pattern

The API endpoints follow a simple proxy pattern:

1. User provides input through React component
2. Component calls `/api/*` endpoint
3. API endpoint uses KHQR SDK server-side
4. Response sent back to client

This approach:

- ✅ Keeps SDK logic server-side (Node.js crypto module compatibility)
- ✅ Allows users to test with their own API tokens
- ✅ No database or state management needed
- ✅ Perfect for demo/testing purposes

## 🧪 Development Notes

### No Backend State

The demo is designed for manual testing:

- No database or persistence layer
- API endpoints are stateless proxies
- Users provide all input directly through forms
- Perfect for learning and testing the KHQR SDK

### Adding Custom Endpoints

Create a new file in `src/pages/api/`:

```typescript
// src/pages/api/custom.ts
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()

  // Your logic here

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

## 📚 Learn More

- [KHQR SDK Documentation](https://github.com/manethpak/khqr-sdk#readme)
- [Bakong Official Site](https://bakong.nbc.gov.kh)
- [Astro Documentation](https://docs.astro.build)
- [Vercel Deployment](https://vercel.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

ISC © [Manethpak](https://github.com/manethpak)

---

**Made with ❤️ for the Cambodian fintech community**
