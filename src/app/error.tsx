'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-coffee-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-8 coffee-shadow">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          
          <h1 className="text-2xl font-display font-bold text-coffee-900 mb-4">
            Oops! Something went wrong
          </h1>
          
          <p className="text-coffee-700 mb-6">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working to fix it.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>Try Again</span>
            </button>
            
            <Link
              href="/"
              className="w-full bg-cream-200 text-coffee-900 py-3 rounded-lg font-semibold hover:bg-cream-300 transition-colors flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Go Home</span>
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="text-sm text-coffee-600 cursor-pointer">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-coffee-800 bg-coffee-50 p-3 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}