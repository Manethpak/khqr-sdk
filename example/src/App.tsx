import { useState, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import './styles/index.css'

// Lazy load pages for better performance
const QRGeneratorPage = lazy(() => import('./pages/QRGeneratorPage'))
const BakongAPITesterPage = lazy(() => import('./pages/BakongAPITesterPage'))

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
      case 'api-tester':
        return (
          <Suspense
            fallback={<div className="text-center py-12">Loading...</div>}
          >
            <BakongAPITesterPage />
          </Suspense>
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
