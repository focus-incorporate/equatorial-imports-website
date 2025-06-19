'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, ShoppingCart, Zap } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 4) return 'text-green-600 bg-green-100';
    if (intensity <= 7) return 'text-yellow-600 bg-yellow-100';
    if (intensity <= 9) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRoastColor = (roast: string) => {
    switch (roast) {
      case 'light': return 'bg-amber-200';
      case 'medium': return 'bg-amber-500';
      case 'dark': return 'bg-amber-800';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl coffee-shadow hover-lift transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Intensity Badge */}
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getIntensityColor(product.intensity)}`}>
            <Zap size={14} />
            <span>{product.intensity}</span>
          </div>
        </div>

        {/* Brand Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-coffee-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            {product.brand === 'daniels-blend' ? "Daniel's Blend" : 'Viaggio Espresso'}
          </div>
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-coffee-900 bg-opacity-20 flex items-center justify-center transition-opacity duration-300">
            <div className="text-center text-white">
              <h4 className="font-semibold mb-2">Quick View</h4>
              <p className="text-sm opacity-90">{product.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Product Name & Type */}
        <div className="mb-3">
          <h3 className="text-xl font-display font-bold text-coffee-900 mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-coffee-600 capitalize">
            {product.type} • {product.roast} roast
          </p>
        </div>

        {/* Roast Level Indicator */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-coffee-700">Roast Level:</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-full ${
                    (product.roast === 'light' && level === 1) ||
                    (product.roast === 'medium' && level <= 2) ||
                    (product.roast === 'dark' && level <= 3)
                      ? getRoastColor(product.roast)
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Flavor Notes */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-coffee-800 mb-2">Flavor Notes:</h4>
          <div className="flex flex-wrap gap-1">
            {product.flavorNotes.map((note, index) => (
              <span
                key={index}
                className="text-xs bg-cream-100 text-coffee-700 px-2 py-1 rounded-full"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Compatibility */}
        {product.compatibility && (
          <div className="mb-4">
            <p className="text-sm text-coffee-600">
              <strong>Compatible:</strong> {product.compatibility.join(', ')}
            </p>
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-cream-200">
          <div>
            <span className="text-2xl font-bold text-coffee-900">${product.price}</span>
            {product.weight && (
              <p className="text-sm text-coffee-600">{product.weight}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quantity Selector */}
            <div className="flex items-center border border-coffee-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-coffee-100 transition-colors"
              >
                <span className="text-coffee-600 text-sm">-</span>
              </button>
              <span className="px-3 py-1 text-sm font-medium text-coffee-800">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:bg-coffee-100 transition-colors"
              >
                <Plus size={14} className="text-coffee-600" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart(product)}
              className="bg-coffee-600 text-white px-4 py-2 rounded-lg hover:bg-coffee-700 transition-colors flex items-center space-x-1 group"
            >
              <ShoppingCart size={16} />
              <span className="text-sm font-medium">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}