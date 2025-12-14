import { useState } from 'react'
import {
  Terminal,
  Key,
  UserCheck,
  Hash,
  Copy,
  Check,
  AlertCircle,
  Info,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, type APIResponse } from '@/utils/api'

export default function BakongAPITesterPage() {
  const [userToken, setUserToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-8 h-8 text-bakong-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Bakong API Tester
          </h1>
        </div>
        <p className="text-gray-600">
          Test Bakong API endpoints using the khqr.api methods. Optionally
          provide your own JWT token or use the server's configured token.
        </p>
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-900">
            <strong>Note:</strong> You need a valid Bakong API token to use
            these endpoints. Register at{' '}
            <a
              href="https://api-bakong.nbc.gov.kh"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-yellow-700"
            >
              api-bakong.nbc.gov.kh
            </a>{' '}
            to get your token. Set it in your .env file as BAKONG_API_TOKEN or
            enter it below.
          </div>
        </div>
      </div>

      {/* JWT Token Input Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-blue-600 mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">
                JWT Token (Optional)
              </h3>
              <div className="group relative">
                <Info className="w-4 h-4 text-blue-600 cursor-help" />
                <div className="absolute left-0 top-6 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  Provide your Bakong API JWT token to override the server's
                  token. Leave empty to use the token from environment variables
                  (BAKONG_API_TOKEN).
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                  placeholder="Enter your JWT token or leave empty to use server token"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {userToken && (
                <button
                  type="button"
                  onClick={() => {
                    setUserToken('')
                    toast.info('Cleared token - will use server token')
                  }}
                  className="btn-secondary"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {userToken ? (
                <span className="text-blue-700 font-medium">
                  Using your provided token
                </span>
              ) : (
                <span className="text-gray-500">
                  Using server token from environment
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* API Testing Sections */}
      <RenewTokenSection userToken={userToken} />
      <CheckAccountSection userToken={userToken} />
      <CheckMD5Section userToken={userToken} />
      <CheckShortHashSection userToken={userToken} />
    </div>
  )
}

// Renew Token Section
function RenewTokenSection({ userToken }: { userToken: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<APIResponse | null>(null)

  const handleTest = async () => {
    if (!email) {
      toast.error('Email is required')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const res = await api.bakong.renewToken(email, userToken || undefined)
      setResponse(res)
      if (res.responseCode === 0) {
        toast.success('Token renewed successfully!')
      } else {
        toast.error(`Failed: ${res.responseMessage}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setEmail('developer@example.com')
    toast.info('Loaded example email')
  }

  return (
    <APITestSection
      icon={<Key className="w-6 h-6" />}
      title="Renew Token"
      description="Renew your Bakong API authentication token using your registered email address."
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="renew-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address *
          </label>
          <input
            id="renew-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@example.com"
            className="input"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            The email address registered with your Bakong API account
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={loading || !email}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test API'
            )}
          </button>
          <button
            type="button"
            onClick={loadExample}
            disabled={loading}
            className="btn-secondary"
          >
            Load Example
          </button>
        </div>

        {response && <ResponseDisplay response={response} />}
      </div>
    </APITestSection>
  )
}

// Check Account Section
function CheckAccountSection({ userToken }: { userToken: string }) {
  const [accountId, setAccountId] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<APIResponse | null>(null)

  const handleTest = async () => {
    if (!accountId) {
      toast.error('Bakong Account ID is required')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const res = await api.bakong.checkAccount(
        accountId,
        userToken || undefined
      )
      setResponse(res)
      if (res.responseCode === 0) {
        toast.success('Account exists!')
      } else {
        toast.error(`${res.responseMessage}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setAccountId('coffee@aclb')
    toast.info('Loaded example account ID')
  }

  return (
    <APITestSection
      icon={<UserCheck className="w-6 h-6" />}
      title="Check Bakong Account"
      description="Verify if a Bakong account ID exists in the system. Returns responseCode 0 if account exists, 1 if not found."
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="account-id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bakong Account ID *
          </label>
          <input
            id="account-id"
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="username@bank"
            className="input"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: username@bank (e.g., coffee@aclb, merchant@wing)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={loading || !accountId}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Account'
            )}
          </button>
          <button
            type="button"
            onClick={loadExample}
            disabled={loading}
            className="btn-secondary"
          >
            Load Example
          </button>
        </div>

        {response && <ResponseDisplay response={response} />}
      </div>
    </APITestSection>
  )
}

// Check MD5 Section
function CheckMD5Section({ userToken }: { userToken: string }) {
  const [md5, setMd5] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<APIResponse | null>(null)

  const handleTest = async () => {
    if (!md5) {
      toast.error('MD5 hash is required')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const res = await api.bakong.checkTransactionByMD5(
        md5,
        userToken || undefined
      )
      setResponse(res)
      if (res.responseCode === 0) {
        toast.success('Transaction found!')
      } else {
        toast.error(`${res.responseMessage}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setMd5('5d41402abc4b2a76b9719d911017c592')
    toast.info('Loaded example MD5 hash')
  }

  return (
    <APITestSection
      icon={<Hash className="w-6 h-6" />}
      title="Check Transaction by MD5"
      description="Look up a transaction using its MD5 hash. The MD5 is generated when you create a KHQR code and can be used to track payment status."
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="md5-hash"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            MD5 Hash *
          </label>
          <input
            id="md5-hash"
            type="text"
            value={md5}
            onChange={(e) => setMd5(e.target.value)}
            placeholder="5d41402abc4b2a76b9719d911017c592"
            className="input font-mono text-sm"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            The MD5 hash returned when generating a QR code (32 characters)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={loading || !md5}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Transaction'
            )}
          </button>
          <button
            type="button"
            onClick={loadExample}
            disabled={loading}
            className="btn-secondary"
          >
            Load Example
          </button>
        </div>

        {response && <ResponseDisplay response={response} />}
      </div>
    </APITestSection>
  )
}

// Check Short Hash Section
function CheckShortHashSection({ userToken }: { userToken: string }) {
  const [hash, setHash] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'KHR' | 'USD'>('KHR')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<APIResponse | null>(null)

  const handleTest = async () => {
    if (!hash) {
      toast.error('Hash is required')
      return
    }
    if (!amount) {
      toast.error('Amount is required')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const res = await api.bakong.checkTransactionByShortHash(
        {
          hash,
          amount: parseFloat(amount),
          currency,
        },
        userToken || undefined
      )
      setResponse(res)
      if (res.responseCode === 0) {
        toast.success('Transaction found!')
      } else {
        toast.error(`${res.responseMessage}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setHash('a1b2c3d4')
    setAmount('10000')
    setCurrency('KHR')
    toast.info('Loaded example data')
  }

  return (
    <APITestSection
      icon={<Hash className="w-6 h-6" />}
      title="Check Transaction by Short Hash"
      description="Look up a transaction using its short hash, amount, and currency. This requires the transaction hash (8 hex characters), amount, and currency to verify."
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="hash"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hash *
          </label>
          <input
            id="hash"
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="a1b2c3d4"
            className="input font-mono text-sm"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            8-character hexadecimal hash (e.g., a1b2c3d4)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount *
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="input"
              disabled={loading}
              step={currency === 'USD' ? '0.01' : '1'}
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Currency *
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'KHR' | 'USD')}
              className="input"
              disabled={loading}
            >
              <option value="KHR">KHR (៛)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={loading || !hash || !amount}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Transaction'
            )}
          </button>
          <button
            type="button"
            onClick={loadExample}
            disabled={loading}
            className="btn-secondary"
          >
            Load Example
          </button>
        </div>

        {response && <ResponseDisplay response={response} />}
      </div>
    </APITestSection>
  )
}

// Reusable Components

function APITestSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-bakong-100 text-bakong-600 rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ResponseDisplay({ response }: { response: APIResponse }) {
  const [copied, setCopied] = useState(false)

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2))
    setCopied(true)
    toast.success('Response copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const isSuccess = response.responseCode === 0

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Response:</span>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              isSuccess
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isSuccess ? 'SUCCESS' : 'FAILED'}
          </span>
          {response.tokenSource && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {response.tokenSource === 'user' ? 'User Token' : 'Server Token'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={copyResponse}
          className="btn-secondary text-xs flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {!isSuccess && response.errorCode && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-900">
              Error Code: {response.errorCode}
            </p>
            <p className="text-red-700">{response.responseMessage}</p>
            {response.errorCode === 14 && (
              <p className="text-red-600 mt-1 text-xs">
                This error typically means the API token is missing or invalid.
                Please check your BAKONG_API_TOKEN configuration.
              </p>
            )}
            {response.errorCode === 6 && (
              <p className="text-red-600 mt-1 text-xs">
                Unauthorized - Your API token may be expired or invalid.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-xs text-gray-100">
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
    </div>
  )
}
