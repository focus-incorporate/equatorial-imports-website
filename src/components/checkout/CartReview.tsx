'use client';

import { useCart } from '@/lib/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartReviewProps {
  onNext: () => void;
  onContinueShopping: () => void;
}

export default function CartReview({ onNext, onContinueShopping }: CartReviewProps) {
  const { state, dispatch } = useCart();

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', productId });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', productId, quantity: newQuantity });
    }
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  };

  if (state.items.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-coffee-900 mb-4">Your cart is empty</h2>
        <p className="text-coffee-600 mb-6">Add some delicious coffee to get started!</p>
        <button
          onClick={onContinueShopping}
          className="bg-coffee-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-coffee-700 transition-colors"
        >
          Shop Coffee
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-coffee-900 mb-6">Review Your Order</h2>
      
      <div className="space-y-4 mb-6">
        {state.items.map((item) => (
          <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-cream-200 rounded-lg">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-coffee-900">{item.product.name}</h3>
              <p className="text-coffee-600 text-sm">{item.product.type} • {item.product.weight}</p>
              <p className="text-coffee-800 font-medium">${item.product.price.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full border border-coffee-300 flex items-center justify-center hover:bg-coffee-50"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full border border-coffee-300 flex items-center justify-center hover:bg-coffee-50"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-coffee-900">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-red-500 hover:text-red-700 mt-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-cream-200 pt-4 mb-6">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span>${state.total.toFixed(2)}</span>
        </div>
        <p className="text-sm text-coffee-600 mt-2">
          Payment on delivery • Free delivery in Victoria, SCR 25 other areas
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onContinueShopping}
          className="flex-1 border-2 border-coffee-600 text-coffee-600 py-3 px-6 rounded-full font-semibold hover:bg-coffee-600 hover:text-white transition-colors"
        >
          Continue Shopping
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-coffee-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-coffee-700 transition-colors"
        >
          Proceed to Customer Info
        </button>
      </div>
    </div>
  );
}