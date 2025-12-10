import { useState, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import './styles/index.css'

// Lazy load pages for better performance
const QRGeneratorPage = lazy(() => import('./pages/QRGeneratorPage'))

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} />
      case 'generator':
        return (
          <Suspense
            fallback={<div className="text-center py-12">Loading...</div>}
          >
            <QRGeneratorPage />
          </Suspense>
        )
      case 'simulator':
        return (
          <div className="text-center py-12 text-gray-500">
            Payment Simulator - Coming soon...
          </div>
        )
      case 'transactions':
        return (
          <div className="text-center py-12 text-gray-500">
            Transactions - Coming soon...
          </div>
        )
      case 'verify':
        return (
          <div className="text-center py-12 text-gray-500">
            Verify QR - Coming soon...
          </div>
        )
      default:
        return <HomePage onNavigate={setActiveTab} />
    }
  }

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
