import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { toast } from 'sonner'
import { RefreshCw, Trash2, Filter } from 'lucide-react'

interface Transaction {
  id: string
  qrData: {
    merchantName: string
    merchantCity: string
    amount?: number
    currency?: string
    billNumber?: string
  }
  customerName: string
  customerPhone: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

export default function TransactionsDashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const result = await api.payments.getAll(
        statusFilter === 'all' ? undefined : statusFilter
      )
      setTransactions((result as any).payments || [])
    } catch (error) {
      toast.error('Failed to load transactions')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [statusFilter])

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all transactions?')) return

    try {
      await api.payments.clearAll()
      toast.success('All transactions cleared')
      loadTransactions()
    } catch (error) {
      toast.error('Failed to clear transactions')
      console.error(error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">
          View and manage all payment transactions
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-40"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadTransactions}
              disabled={loading}
              className="btn-outline flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
            <button
              onClick={handleClearAll}
              disabled={transactions.length === 0}
              className="btn-outline flex items-center gap-2 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bakong-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No transactions found
          </h3>
          <p className="text-gray-600">
            {statusFilter === 'all'
              ? 'Start by creating a QR code and simulating a payment'
              : `No ${statusFilter} transactions`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {tx.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(tx.createdAt)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Merchant Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">
                        Merchant
                      </h3>
                      <p className="font-semibold text-gray-900">
                        {tx.qrData.merchantName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tx.qrData.merchantCity}
                      </p>
                      {tx.qrData.billNumber && (
                        <p className="text-sm text-gray-500 mt-1">
                          Bill: {tx.qrData.billNumber}
                        </p>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">
                        Customer
                      </h3>
                      <p className="font-semibold text-gray-900">
                        {tx.customerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tx.customerPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right ml-4">
                  <div className="text-sm font-semibold text-gray-500 mb-1">
                    Amount
                  </div>
                  <div className="text-2xl font-bold text-bakong-blue">
                    {tx.qrData.amount || 'N/A'} {tx.qrData.currency || ''}
                  </div>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Transaction ID</span>
                  <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {tx.id}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && transactions.length > 0 && (
        <div className="card mt-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">
                {transactions.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {transactions.filter((tx) => tx.status === 'completed').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {transactions.filter((tx) => tx.status === 'pending').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">
                {transactions.filter((tx) => tx.status === 'failed').length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
