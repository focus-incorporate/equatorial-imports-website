'use client';

import { useState } from 'react';
// Router import removed - using window.location.href
import { useCart } from '@/lib/CartContext';
// Email service no longer needed - handled by API
import { User, MapPin, Clock, Banknote, Package } from 'lucide-react';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  createAccount: boolean;
}

interface DeliveryData {
  address: string;
  district: string;
  island: string;
  deliveryNotes: string;
  timePreference: string;
}

interface OrderReviewProps {
  customerData: CustomerData;
  deliveryData: DeliveryData;
  onBack: () => void;
}

export default function OrderReview({
  customerData,
  deliveryData,
  onBack
}: OrderReviewProps) {
  const { state, dispatch } = useCart();
  // Router no longer needed - using window.location.href
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const getDeliveryFee = () => {
    if (deliveryData.island === 'mahe' && ['Victoria', 'Mont Fleuri', 'Roche Caiman', 'St. Louis'].includes(deliveryData.district)) {
      return 0;
    }
    return 25;
  };

  const deliveryFee = getDeliveryFee();
  const finalTotal = state.total + deliveryFee;

  const getTimePreferenceLabel = (pref: string) => {
    const preferences: Record<string, string> = {
      'morning': 'Morning (8AM - 12PM)',
      'afternoon': 'Afternoon (12PM - 5PM)',
      'evening': 'Evening (5PM - 8PM)',
      'anytime': 'Anytime'
    };
    return preferences[pref] || 'Anytime';
  };

  const placeOrder = async () => {
    setIsPlacingOrder(true);

    try {
      // Prepare order data for the new API
      const orderData = {
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerPhone: customerData.phone,
        deliveryAddress: `${deliveryData.address}, ${deliveryData.district}, ${deliveryData.island}`,
        deliveryNotes: deliveryData.deliveryNotes,
        timePreference: deliveryData.timePreference,
        items: state.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal: state.total,
        deliveryFee: deliveryFee,
        total: finalTotal,
        paymentMethod: 'cash-on-delivery',
      };

      // Send order to the integrated API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Order creation failed');
      }

      console.log('Order created successfully:', result);

      // Clear cart on successful order
      dispatch({ type: 'CLEAR_CART' });

      // Navigate to success page with the actual order ID
      window.location.href = `/checkout/success?orderId=${result.orderId}`;
      
    } catch (error) {
      console.error('Order placement error:', error);
      setIsPlacingOrder(false);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('Insufficient stock')) {
        alert('Sorry, some items in your cart are no longer available in the requested quantity. Please review your cart and try again.');
      } else if (errorMessage.includes('Product not found')) {
        alert('Some products in your cart are no longer available. Please review your cart and try again.');
      } else {
        alert('Order placement failed. Please try again or contact support.');
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-coffee-900 mb-6">Review Your Order</h2>
      
      <div className="space-y-6">
        {/* Customer Information */}
        <div className="bg-cream-50 rounded-lg p-6">
          <h3 className="font-semibold text-coffee-900 mb-4 flex items-center">
            <User size={18} className="mr-2" />
            Customer Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong> {customerData.name}
            </div>
            <div>
              <strong>Email:</strong> {customerData.email}
            </div>
            <div>
              <strong>Phone:</strong> {customerData.phone}
            </div>
            {customerData.createAccount && (
              <div className="text-coffee-600">
                Account will be created after order
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-cream-50 rounded-lg p-6">
          <h3 className="font-semibold text-coffee-900 mb-4 flex items-center">
            <MapPin size={18} className="mr-2" />
            Delivery Information
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Address:</strong><br />
              {deliveryData.address}<br />
              {deliveryData.district}, {deliveryData.island}
            </div>
            <div>
              <strong>Preferred Time:</strong> {getTimePreferenceLabel(deliveryData.timePreference)}
            </div>
            {deliveryData.deliveryNotes && (
              <div>
                <strong>Notes:</strong> {deliveryData.deliveryNotes}
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-cream-50 rounded-lg p-6">
          <h3 className="font-semibold text-coffee-900 mb-4 flex items-center">
            <Banknote size={18} className="mr-2" />
            Payment Method
          </h3>
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 bg-coffee-600 rounded-full flex items-center justify-center mr-3">
              <Banknote size={16} className="text-white" />
            </div>
            <div>
              <strong>Cash on Delivery</strong><br />
              <span className="text-coffee-600">Pay when you receive your order</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-cream-200 rounded-lg p-6">
          <h3 className="font-semibold text-coffee-900 mb-4 flex items-center">
            <Package size={18} className="mr-2" />
            Order Items
          </h3>
          <div className="space-y-3">
            {state.items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center py-2 border-b border-cream-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <div className="font-medium text-coffee-900">{item.product.name}</div>
                    <div className="text-sm text-coffee-600">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-coffee-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-coffee-600 text-white rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${state.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="border-t border-coffee-500 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
            <Clock size={16} className="mr-2" />
            Important Notes
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• We'll call you within 2 hours to confirm your order and delivery time</li>
            <li>• Please have exact change ready for cash on delivery</li>
            <li>• Orders are subject to product availability</li>
            <li>• Same-day delivery available for Mahé, 1-2 days for other islands</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isPlacingOrder}
            className="flex-1 border-2 border-coffee-600 text-coffee-600 py-3 px-6 rounded-full font-semibold hover:bg-coffee-600 hover:text-white transition-colors disabled:opacity-50"
          >
            Back to Payment
          </button>
          <button
            onClick={placeOrder}
            disabled={isPlacingOrder}
            className="flex-1 bg-coffee-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-coffee-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}