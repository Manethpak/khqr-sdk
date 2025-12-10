import { Logo } from '@/components/logo'
import { ArrowRight, QrCode, Smartphone, CheckCircle, Code } from 'lucide-react'

interface HomePageProps {
  onNavigate: (tab: string) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4">
          <Logo className="size-18 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">KHQR SDK Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Interactive demonstration of the KHQR SDK for Cambodia's Bakong QR
          payment system. Generate, decode, and simulate real-world payment
          flows.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('generator')}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Try QR Generator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>Payment Demo</span>
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon={<QrCode className="w-6 h-6" />}
          title="QR Generation"
          description="Generate static and dynamic KHQR codes with full EMV compliance"
          onClick={() => onNavigate('generator')}
        />
        <FeatureCard
          icon={<Smartphone className="w-6 h-6" />}
          title="Payment Simulation"
          description="Experience real-world payment flows from both merchant and customer perspectives"
          onClick={() => onNavigate('simulator')}
        />
        <FeatureCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="QR Verification"
          description="Decode and verify KHQR strings with CRC integrity checks"
          onClick={() => onNavigate('verify')}
        />
        <FeatureCard
          icon={<Code className="w-6 h-6" />}
          title="TypeScript SDK"
          description="Fully typed SDK with comprehensive error handling and validation"
        />
      </div>

      {/* Quick Example */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Example</h2>
        <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
          <pre className="text-sm text-gray-100">
            <code>{`import { createKHQR } from '@manethpak/khqr-sdk'

const khqr = createKHQR({
  baseURL: 'https://api-bakong.nbc.gov.kh',
  authToken: 'your_token'
})

// Generate a QR code
const result = khqr.qr.generateKHQR({
  bakongAccountID: 'merchant@aclb',
  merchantName: 'Coffee Shop',
  merchantCity: 'Phnom Penh',
  amount: 10000,
  currency: 'KHR'
})

console.log(result.result?.qr) // EMV-compliant QR string
console.log(result.result?.md5) // Transaction tracking hash`}</code>
          </pre>
        </div>
        <div className="mt-4 flex justify-end">
          <a
            href="https://github.com/manethpak/khqr-sdk#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bakong-500 hover:text-bakong-600 font-medium flex items-center space-x-1"
          >
            <span>View Documentation</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Payment Flow Demo */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Step
            number={1}
            title="Merchant Generates QR"
            description="Create a static or dynamic QR code with payment details"
          />
          <Step
            number={2}
            title="Customer Scans"
            description="Customer scans the QR code with their Bakong app"
          />
          <Step
            number={3}
            title="Payment Complete"
            description="Transaction is verified and funds are transferred"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`card hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="w-12 h-12 bg-bakong-100 text-bakong-600 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-bakong-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
