'use client';

import { useState } from 'react';
import { Banknote, CreditCard, Shield, Clock } from 'lucide-react';

interface PaymentMethodProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentMethod({ onNext, onBack }: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash-on-delivery' | 'online'>('cash-on-delivery');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-coffee-900 mb-6">Payment Method</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Options */}
        <div className="space-y-4">
          {/* Cash on Delivery */}
          <div
            className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
              selectedMethod === 'cash-on-delivery'
                ? 'border-coffee-600 bg-coffee-50'
                : 'border-cream-300 hover:border-coffee-300'
            }`}
            onClick={() => setSelectedMethod('cash-on-delivery')}
          >
            <div className="flex items-center mb-4">
              <input
                type="radio"
                id="cash-on-delivery"
                name="paymentMethod"
                value="cash-on-delivery"
                checked={selectedMethod === 'cash-on-delivery'}
                onChange={(e) => setSelectedMethod(e.target.value as 'cash-on-delivery')}
                className="w-4 h-4 text-coffee-600 border-cream-300 focus:ring-coffee-600"
              />
              <label htmlFor="cash-on-delivery" className="ml-3 flex items-center font-semibold text-coffee-900">
                <Banknote size={20} className="mr-2" />
                Cash on Delivery
              </label>
            </div>
            <div className="pl-7 space-y-2">
              <div className="flex items-center text-green-600 text-sm">
                <Shield size={16} className="mr-2" />
                Most popular & secure payment method
              </div>
              <p className="text-coffee-600 text-sm">
                Pay with cash when your order is delivered. No need to pay online.
              </p>
              <div className="flex items-center text-coffee-600 text-sm">
                <Clock size={16} className="mr-2" />
                Available for all delivery areas
              </div>
            </div>
          </div>

          {/* Online Payment (Coming Soon) */}
          <div className="border-2 border-cream-200 rounded-lg p-6 opacity-60">
            <div className="flex items-center mb-4">
              <input
                type="radio"
                id="online-payment"
                name="paymentMethod"
                value="online"
                disabled
                className="w-4 h-4 text-coffee-600 border-cream-300 focus:ring-coffee-600"
              />
              <label htmlFor="online-payment" className="ml-3 flex items-center font-semibold text-coffee-900">
                <CreditCard size={20} className="mr-2" />
                Online Payment
                <span className="ml-2 text-xs bg-cream-200 text-coffee-600 px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </label>
            </div>
            <div className="pl-7">
              <p className="text-coffee-600 text-sm">
                Credit card and mobile money payments will be available soon.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        {selectedMethod === 'cash-on-delivery' && (
          <div className="bg-coffee-600 text-white rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Cash on Delivery Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-coffee-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">✓</div>
                <div>
                  <strong>No prepayment required</strong><br />
                  You only pay when you receive your order.
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-coffee-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">✓</div>
                <div>
                  <strong>Exact change appreciated</strong><br />
                  Have the exact amount ready to speed up delivery.
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-coffee-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">✓</div>
                <div>
                  <strong>Delivery confirmation</strong><br />
                  We'll call you before delivery to confirm availability.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-cream-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 text-coffee-600 border-cream-300 rounded focus:ring-coffee-600"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-coffee-700">
              I agree to the terms and conditions
            </label>
          </div>
          <p className="text-xs text-coffee-600 ml-6">
            By placing this order, you agree to our delivery terms and return policy.
            Orders are subject to availability and confirmation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border-2 border-coffee-600 text-coffee-600 py-3 px-6 rounded-full font-semibold hover:bg-coffee-600 hover:text-white transition-colors"
          >
            Back to Delivery
          </button>
          <button
            type="submit"
            className="flex-1 bg-coffee-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-coffee-700 transition-colors"
          >
            Review Order
          </button>
        </div>
      </form>
    </div>
  );
}