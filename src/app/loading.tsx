import { Coffee } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-coffee-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Coffee 
            className="text-cream-200 animate-pulse mx-auto mb-4" 
            size={64} 
          />
          <div className="absolute inset-0 animate-spin">
            <div className="w-16 h-16 border-4 border-cream-200 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-cream-100 mb-2">
          Loading...
        </h2>
        <p className="text-cream-200">
          Brewing up something delicious
        </p>
      </div>
    </div>
  )
}