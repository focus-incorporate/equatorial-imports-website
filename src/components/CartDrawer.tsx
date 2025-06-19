'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import CheckoutModal from './CheckoutModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-cream-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="text-coffee-600" size={24} />
            <h2 className="text-xl font-display font-bold text-coffee-900">
              Shopping Cart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-coffee-100 rounded-full transition-colors"
          >
            <X className="text-coffee-600" size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-4">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto text-coffee-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-coffee-800 mb-2">
                Your cart is empty
              </h3>
              <p className="text-coffee-600 mb-6">
                Add some delicious coffee to get started!
              </p>
              <button
                onClick={onClose}
                className="bg-coffee-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-coffee-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-cream-50 rounded-lg p-4 flex items-center space-x-4"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-coffee-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-coffee-600 capitalize">
                      {item.product.brand === 'daniels-blend' ? "Daniel's Blend" : 'Viaggio Espresso'}
                    </p>
                    <p className="text-sm font-semibold text-coffee-800">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-coffee-200 hover:bg-coffee-300 flex items-center justify-center transition-colors"
                    >
                      <Minus size={14} className="text-coffee-700" />
                    </button>
                    <span className="w-8 text-center font-semibold text-coffee-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-coffee-200 hover:bg-coffee-300 flex items-center justify-center transition-colors"
                    >
                      <Plus size={14} className="text-coffee-700" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-1 hover:bg-coffee-200 rounded-full transition-colors"
                  >
                    <X size={16} className="text-coffee-600" />
                  </button>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full text-center text-sm text-coffee-600 hover:text-coffee-800 py-2 border-t border-cream-200 mt-4"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-cream-200 p-4 space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-coffee-600">
                  {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'}
                </p>
                <p className="text-2xl font-bold text-coffee-900">
                  ${state.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-coffee-600 text-white py-4 rounded-full font-semibold text-lg hover:bg-coffee-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CreditCard size={20} />
              <span>Checkout (Cash on Delivery)</span>
            </button>

            {/* Delivery Info */}
            <p className="text-xs text-coffee-600 text-center">
              Free delivery throughout Seychelles • Cash on delivery available
            </p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
      />
    </>
  );
}