import { handle } from '@hono/node-server/vercel'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import qrRoutes from '../lib/routes/qr'
import paymentRoutes from '../lib/routes/payment'
import bakongRoutes from '../lib/routes/bakong'

const app = new Hono()

// CORS middleware
app.use(
  '/*',
  cors({
    origin: '*',
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
    environment: 'serverless',
    bakongTokenConfigured: !!process.env.BAKONG_API_TOKEN,
    note: 'Demo uses in-memory storage. Data may reset on cold starts (~5-15 min of inactivity).',
  })
})

export default handle(app)
