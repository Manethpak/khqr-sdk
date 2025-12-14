# KHQR SDK Demo

> Interactive demo application showcasing the KHQR SDK for Cambodia's Bakong QR payment system.

![KHQR Demo](../public/preview.png)

## 🎯 Features

- **QR Code Generator**: Create static and dynamic KHQR codes with customizable payment details
- **Payment Simulator**: Experience real-world payment flows from merchant and customer perspectives
- **Transaction Dashboard**: Monitor and track payment transactions in real-time
- **QR Verification**: Decode and validate KHQR strings with CRC integrity checks
- **Type-Safe**: Full TypeScript support throughout the application
- **Modern Stack**: Built with Vite, React, Hono, and TailwindCSS

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm (recommended) or npm
- Vercel CLI: `npm i -g vercel`

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

**You need TWO terminals running:**

```bash
# Terminal 1: Start API server
pnpm dev:api

# Terminal 2: Start frontend
pnpm dev
```

Then open **http://localhost:3000** in your browser.

> 📖 **Need help?** See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup guide, troubleshooting, and architecture explanation.

### Production

```bash
# Build for production
pnpm build

# Deploy to Vercel
pnpm deploy
```

### Development

The app requires **two terminals** for local development:

**Terminal 1 - Start API Server:**

```bash
pnpm dev:api
# or: vercel dev --listen 3001
```

**Terminal 2 - Start Frontend:**

```bash
pnpm dev
```

Access the app:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api

Vite automatically proxies `/api/*` requests from the frontend to the API server.

### Production

```bash
# Build for production
pnpm build

# Deploy to Vercel
pnpm deploy
```

## 📁 Project Structure

```
example/
├── api/                    # Vercel serverless function entry
│   └── index.ts           # Main serverless handler
├── lib/                    # Shared serverless logic
│   ├── routes/
│   │   ├── qr.ts          # QR generation/decoding endpoints
│   │   ├── payment.ts     # Payment simulation endpoints
│   │   └── bakong.ts      # Bakong API integration
│   ├── db/
│   │   └── payments.ts    # In-memory payment storage
│   └── khqr.ts            # KHQR SDK instance
├── src/                    # React frontend
│   ├── components/
│   │   └── Layout.tsx     # App layout
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing page
│   │   └── QRGeneratorPage.tsx    # QR generator
│   ├── utils/
│   │   └── api.ts         # API client
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   ├── styles/
│   │   └── index.css      # Global styles
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── vercel.json            # Vercel deployment config
└── README.md
```

## 🔌 API Endpoints

### QR Operations

```
POST /api/qr/generate
  Body: IndividualInfo | MerchantInfo
  Response: { qr: string, md5: string }

POST /api/qr/decode
  Body: { qr: string }
  Response: DecodedKHQRData

POST /api/qr/verify
  Body: { qr: string }
  Response: VerifyStringResult
```

### Payment Simulation

```
POST /api/payments/initiate
  Body: { qr: string, customerAccountId: string }
  Response: { paymentId, details }

POST /api/payments/confirm
  Body: { paymentId: string }
  Response: { transaction, success }

GET /api/payments
  Query: ?status=SUCCESS&limit=10
  Response: { transactions, count }

GET /api/payments/:id
  Response: Transaction

GET /api/payments/md5/:md5
  Response: Transaction
```

## 📦 Tech Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **QRCode** - QR code image generation

### Backend

- **Hono** - Web framework
- **TypeScript** - Type safety
- **@hono/node-server** - Node.js adapter

### SDK

- **@manethpak/khqr-sdk** - KHQR generation, decoding, and validation

## 🌐 Deployment

### Deploy to Vercel

The easiest way to deploy this demo:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/manethpak/khqr-sdk/tree/main/example)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd example
vercel
```

### Production Build

The production build creates optimized static files and serverless functions:

```bash
# Build frontend and API
pnpm build

# Deploy to Vercel
pnpm deploy
```

### Environment Variables

For real Bakong API integration (optional):

```bash
# Copy example env file
cp .env.example .env

# Edit .env
BAKONG_API_URL=https://api-bakong.nbc.gov.kh
BAKONG_API_TOKEN=your_token_here
```

## 🎨 Customization

### Adding Custom Routes

1. Create a new route file in `lib/routes/`
2. Import and register it in `api/index.ts`

```typescript
// lib/routes/custom.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/hello', (c) => c.json({ message: 'Hello!' }))

export default app

// api/index.ts
import customRoutes from '../lib/routes/custom'

app.route('/api/custom', customRoutes)
```

### Adding New Pages

1. Create a page component in `src/pages/`
2. Add a route in `src/App.tsx`
3. Add a tab in `src/components/Layout.tsx`

## 🧪 Development Notes

### Mock Data

The demo uses in-memory storage for payments to keep things simple and focused on showcasing SDK functionality.

**Important:** In serverless deployment (Vercel), data may reset on cold starts (~5-15 minutes of inactivity). This is expected behavior for a demo application.

For production use with persistent storage, consider integrating:

- Vercel KV (Redis)
- Vercel Postgres
- Upstash Redis
- Any cloud database service

### QR Code Generation

QR codes are generated using the KHQR SDK and displayed as images using the `qrcode` library.

### Payment Simulation

Payments have a 90% success rate to simulate real-world scenarios with occasional failures.

## 📚 Learn More

- [KHQR SDK Documentation](https://github.com/manethpak/khqr-sdk#readme)
- [Bakong Official Site](https://bakong.nbc.gov.kh)
- [EMV QR Code Specification](https://www.emvco.com/emv-technologies/qrcodes/)
- [Hono Documentation](https://hono.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

ISC © [Manethpak](https://github.com/manethpak)

---

**Made with ❤️ for the Cambodian fintech community**
