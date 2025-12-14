// NOTE: This demo uses in-memory storage for simplicity.
// Data will reset on serverless cold starts (~5-15 min of inactivity).
// For production persistence, consider using Vercel KV, Postgres, or similar.

export type Transaction = {
  id: string
  md5: string
  qr: string
  fromAccountId: string
  toAccountId: string
  amount: number
  currency: 'KHR' | 'USD'
  merchantName: string
  merchantCity: string
  status: 'pending' | 'success' | 'failed'
  createdAt: number
  completedAt?: number
}

class PaymentStore {
  private transactions: Map<string, Transaction> = new Map()

  addTransaction(transaction: Transaction) {
    this.transactions.set(transaction.id, transaction)
    return transaction
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id)
  }

  getTransactionByMD5(md5: string): Transaction | undefined {
    return Array.from(this.transactions.values()).find((tx) => tx.md5 === md5)
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    )
  }

  updateTransactionStatus(
    id: string,
    status: Transaction['status']
  ): Transaction | undefined {
    const transaction = this.transactions.get(id)
    if (transaction) {
      transaction.status = status
      if (status === 'success' || status === 'failed') {
        transaction.completedAt = Date.now()
      }
      return transaction
    }
    return undefined
  }

  clearAll() {
    this.transactions.clear()
  }
}

export const paymentStore = new PaymentStore()
