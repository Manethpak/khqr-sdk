import { ReactNode } from 'react'
import { Github, QrCode, Terminal } from 'lucide-react'
import { Logo } from './logo'

interface LayoutProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Layout({
  children,
  activeTab,
  onTabChange,
}: LayoutProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: QrCode },
    { id: 'generator', label: 'QR Generator' },
    { id: 'api-tester', label: 'API Tester', icon: Terminal },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo className="size-10 shadow-sm" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  KHQR SDK Demo
                </h1>
                <p className="text-xs text-gray-500">Bakong Payment System</p>
              </div>
            </div>
            <a
              href="https://github.com/manethpak/khqr-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-bakong-500 text-bakong-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Built with{' '}
            <a
              href="https://github.com/manethpak/khqr-sdk"
              className="text-bakong-500 hover:text-bakong-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              KHQR SDK
            </a>{' '}
            - Cambodia's Bakong QR Payment System
          </p>
        </div>
      </footer>
    </div>
  )
}
