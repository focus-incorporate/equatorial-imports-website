import Link from 'next/link'
import { Home, Settings } from 'lucide-react'

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-coffee-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-8 coffee-shadow">
          <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="text-coffee-600" size={32} />
          </div>
          
          <h1 className="text-6xl font-display font-bold text-coffee-900 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-display font-bold text-coffee-800 mb-4">
            Admin Page Not Found
          </h2>
          
          <p className="text-coffee-700 mb-6">
            Sorry, the admin page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/admin/dashboard"
              className="w-full bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Settings size={20} />
              <span>Go to Dashboard</span>
            </Link>
            
            <Link
              href="/"
              className="w-full bg-cream-200 text-coffee-900 py-3 rounded-lg font-semibold hover:bg-cream-300 transition-colors flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Go to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}