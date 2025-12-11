import { handle } from '@hono/node-server/vercel'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import qrRoutes from '../server/routes/qr'
import paymentRoutes from '../server/routes/payment'

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

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'production',
  })
})

export default handle(app)
