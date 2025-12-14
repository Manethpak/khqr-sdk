import { Hono } from 'hono'
import { paymentStore, type Transaction } from '../db/payments'
import { khqr } from '../khqr'

const app = new Hono()

// Initiate payment (decode QR and create pending transaction)
app.post('/initiate', async (c) => {
  try {
    const { qr: qrString, customerAccountId } = await c.req.json()

    if (!qrString || typeof qrString !== 'string') {
      return c.json({ error: 'QR string is required' }, 400)
    }

    if (!customerAccountId || typeof customerAccountId !== 'string') {
      return c.json({ error: 'Customer account ID is required' }, 400)
    }

    // Decode QR
    const decoded = khqr.qr.decodeKHQR(qrString)

    if (decoded.error) {
      return c.json(
        {
          error: 'Invalid QR code',
          details: decoded.error.message,
        },
        400
      )
    }

    const qrData = decoded.result!

    // Verify QR is valid
    const verified = khqr.qr.verifyKHQRString(qrString)
    if (verified.error || !verified.result?.isValid) {
      return c.json(
        {
          error: 'QR code verification failed',
          details: verified.result?.errors || [],
        },
        400
      )
    }

    // Generate QR to get MD5 (for tracking)
    const generated = khqr.qr.generateKHQR({
      bakongAccountID: qrData.merchantAccountInfo?.bakongAccountID || '',
      merchantName: qrData.merchantName || '',
      merchantCity: qrData.merchantCity || '',
      amount: qrData.transactionAmount
        ? parseFloat(qrData.transactionAmount)
        : undefined,
      currency: qrData.transactionCurrency === '116' ? 'KHR' : 'USD',
    })

    if (generated.error) {
      return c.json({ error: 'Failed to process QR code' }, 400)
    }

    // Create pending transaction
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      md5: generated.result!.md5,
      qr: qrString,
      fromAccountId: customerAccountId,
      toAccountId: qrData.merchantAccountInfo?.bakongAccountID || '',
      amount: qrData.transactionAmount
        ? parseFloat(qrData.transactionAmount)
        : 0,
      currency: qrData.transactionCurrency === '116' ? 'KHR' : 'USD',
      merchantName: qrData.merchantName || '',
      merchantCity: qrData.merchantCity || '',
      status: 'pending',
      createdAt: Date.now(),
    }

    paymentStore.addTransaction(transaction)

    return c.json({
      paymentId: transaction.id,
      details: {
        merchantName: qrData.merchantName,
        merchantCity: qrData.merchantCity,
        amount: transaction.amount,
        currency: transaction.currency,
        bakongAccountID: qrData.merchantAccountInfo?.bakongAccountID,
      },
    })
  } catch (error) {
    return c.json(
      {
        error: 'Failed to initiate payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// Confirm payment
app.post('/confirm', async (c) => {
  try {
    const { paymentId } = await c.req.json()

    if (!paymentId || typeof paymentId !== 'string') {
      return c.json({ error: 'Payment ID is required' }, 400)
    }

    const transaction = paymentStore.getTransaction(paymentId)

    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404)
    }

    if (transaction.status !== 'pending') {
      return c.json(
        { error: 'Transaction already processed', status: transaction.status },
        400
      )
    }

    // Simulate payment processing (90% success rate)
    const success = Math.random() > 0.1

    const updatedTransaction = paymentStore.updateTransactionStatus(
      paymentId,
      success ? 'success' : 'failed'
    )

    return c.json({
      transaction: updatedTransaction,
      success,
    })
  } catch (error) {
    return c.json(
      {
        error: 'Failed to confirm payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// Get transaction by ID
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const transaction = paymentStore.getTransaction(id)

  if (!transaction) {
    return c.json({ error: 'Transaction not found' }, 404)
  }

  return c.json(transaction)
})

// Get transaction by MD5
app.get('/md5/:md5', async (c) => {
  const md5 = c.req.param('md5')
  const transaction = paymentStore.getTransactionByMD5(md5)

  if (!transaction) {
    return c.json({ error: 'Transaction not found' }, 404)
  }

  return c.json(transaction)
})

// Get all transactions
app.get('/', async (c) => {
  const status = c.req.query('status')
  let transactions = paymentStore.getAllTransactions()

  if (status && ['pending', 'success', 'failed'].includes(status)) {
    transactions = transactions.filter((tx) => tx.status === status)
  }

  return c.json({ transactions, count: transactions.length })
})

// Clear all transactions (for demo reset)
app.delete('/', async (c) => {
  paymentStore.clearAll()
  return c.json({ message: 'All transactions cleared' })
})

export default app
