import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import qrRoutes from './routes/qr'
import paymentRoutes from './routes/payment'
import bakongRoutes from './routes/bakong'

const app = new Hono()
const isProd = process.env.NODE_ENV === 'production'

// CORS middleware
app.use(
  '/*',
  cors({
    origin: isProd ? '*' : 'http://localhost:3000',
    credentials: true,
  })
)

// API routes
app.route('/api/qr', qrRoutes)
app.route('/api/payments', paymentRoutes)
app.route('/api/bakong', bakongRoutes)

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: isProd ? 'production' : 'development',
    bakongTokenConfigured: !!process.env.BAKONG_API_TOKEN,
  })
})

// Serve static files in production
if (isProd) {
  app.use('/*', serveStatic({ root: './dist' }))
  app.get('*', serveStatic({ path: './dist/index.html' }))
}

// Start server
const port = isProd ? Number(process.env.PORT) || 3000 : 3001

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 Server running on http://localhost:${info.port}`)
    console.log(`📊 Environment: ${isProd ? 'production' : 'development'}`)
  }
)

export default app
