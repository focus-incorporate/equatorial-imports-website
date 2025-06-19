'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Coffee, Filter, Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { danielsBlendProducts, viaggioEspressoProducts } from '@/data/products';
import { Product } from '@/types';
import { useCart } from '@/lib/CartContext';

// Dynamically import 3D component to avoid SSR issues
const FallingBeans = dynamic(() => import('@/components/3d/FallingBeans'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-coffee-gradient opacity-20" />
});

export default function CoffeePage() {
  const { addItem } = useCart();
  const [filterIntensity, setFilterIntensity] = useState<string>('all');
  const [filterRoast, setFilterRoast] = useState<string>('all');

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const filteredDanielsProducts = danielsBlendProducts.filter(product => {
    if (filterIntensity !== 'all') {
      const intensityRange = filterIntensity.split('-').map(Number);
      if (intensityRange.length === 2) {
        if (product.intensity < intensityRange[0] || product.intensity > intensityRange[1]) return false;
      }
    }
    if (filterRoast !== 'all' && product.roast !== filterRoast) return false;
    return true;
  });

  const filteredViaggioProducts = viaggioEspressoProducts.filter(product => {
    if (filterIntensity !== 'all') {
      const intensityRange = filterIntensity.split('-').map(Number);
      if (intensityRange.length === 2) {
        if (product.intensity < intensityRange[0] || product.intensity > intensityRange[1]) return false;
      }
    }
    if (filterRoast !== 'all' && product.roast !== filterRoast) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-coffee-gradient relative">
      {/* 3D Falling Beans Background */}
      <FallingBeans />

      {/* Hero Section */}
      <section className="relative z-10 py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <Coffee className="text-cream-200" size={48} />
              <h1 className="text-4xl sm:text-6xl font-display font-bold text-cream-50">
                Coffee Collection
              </h1>
            </div>
            <p className="text-xl text-cream-200 max-w-3xl mx-auto leading-relaxed">
              Discover our premium coffee imports featuring the finest blends from Daniel&apos;s Blend 
              and Viaggio Espresso. From intense dark roasts to aromatic flavored varieties.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center mb-4">
              <Filter className="text-cream-200 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-cream-100">Filter Products</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Intensity Filter */}
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">
                  Intensity Level
                </label>
                <select
                  value={filterIntensity}
                  onChange={(e) => setFilterIntensity(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white text-coffee-900 font-medium focus:ring-2 focus:ring-cream-300"
                >
                  <option value="all">All Intensities</option>
                  <option value="1-4">Mild (1-4)</option>
                  <option value="5-7">Medium (5-7)</option>
                  <option value="8-10">Strong (8-10)</option>
                  <option value="11-12">Very Strong (11-12)</option>
                </select>
              </div>

              {/* Roast Filter */}
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">
                  Roast Level
                </label>
                <select
                  value={filterRoast}
                  onChange={(e) => setFilterRoast(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white text-coffee-900 font-medium focus:ring-2 focus:ring-cream-300"
                >
                  <option value="all">All Roasts</option>
                  <option value="light">Light Roast</option>
                  <option value="medium">Medium Roast</option>
                  <option value="dark">Dark Roast</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daniel's Blend Section */}
      <section className="relative z-10 py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-coffee-900 mb-4">
              Daniel&apos;s Blend
            </h2>
            <div className="flex justify-center items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="text-amber-400 fill-current" size={20} />
              ))}
            </div>
            <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
              Premium Nespresso-compatible capsules crafted with 100% aluminum pods, 
              no preservatives, and completely recyclable. Experience intensity levels from 5 to 12.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="bg-coffee-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                100% Aluminum Pods
              </span>
              <span className="bg-coffee-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                No Preservatives
              </span>
              <span className="bg-coffee-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                Recyclable
              </span>
              <span className="bg-coffee-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                Nespresso Compatible
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDanielsProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Viaggio Espresso Section */}
      <section className="relative z-10 py-16 bg-coffee-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-cream-50 mb-4">
              Viaggio Espresso
            </h2>
            <div className="flex justify-center items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="text-amber-400 fill-current" size={20} />
              ))}
            </div>
            <p className="text-lg text-cream-200 max-w-2xl mx-auto">
              Sustainably sourced premium origin beans with multi-system compatibility. 
              Available as coffee beans for all brewing methods, Nespresso capsules, and Dolce Gusto capsules.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="bg-cream-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                Sustainably Sourced
              </span>
              <span className="bg-cream-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                Premium Origin
              </span>
              <span className="bg-cream-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                Multi-System Compatible
              </span>
              <span className="bg-cream-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                All Brewing Methods
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredViaggioProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-20 bg-cream-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-coffee-900 mb-6">
            Ready to Order?
          </h2>
          <p className="text-lg text-coffee-700 mb-8">
            All products available for cash-on-delivery throughout Seychelles. 
            Contact us to place your order or for bulk pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-coffee-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-coffee-700 transition-colors">
              Contact for Orders
            </button>
            <button className="border-2 border-coffee-600 text-coffee-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-coffee-600 hover:text-white transition-colors">
              Bulk Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}