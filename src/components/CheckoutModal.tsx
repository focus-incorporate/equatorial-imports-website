'use client';

import { useState } from 'react';
import { X, MapPin, Phone, Mail, User, MessageSquare, CheckCircle } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { CustomerInfo, Order } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { state, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'confirmation' | 'success'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryNotes: ''
  });
  const [orderId, setOrderId] = useState<string>('');
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof CustomerInfo]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<CustomerInfo> = {};
    
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{8,}$/.test(customerInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('confirmation');
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    
    // Generate order ID
    const newOrderId = `EI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create order object
    const order: Order = {
      id: newOrderId,
      customer: customerInfo,
      items: state.items,
      total: state.total,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod: 'cash-on-delivery'
    };

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you'd send this to your backend
      console.log('Order submitted:', order);
      
      // Store order in localStorage for now
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      setOrderId(newOrderId);
      setStep('success');
      clearCart();
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep('info');
    setCustomerInfo({
      name: '',
      email: '',
      phone: '',
      address: '',
      deliveryNotes: ''
    });
    setErrors({});
    setOrderId('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-cream-200 p-6 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-display font-bold text-coffee-900">
              {step === 'info' && 'Delivery Information'}
              {step === 'confirmation' && 'Confirm Your Order'}
              {step === 'success' && 'Order Confirmed!'}
            </h2>
            <button
              onClick={step === 'success' ? resetModal : onClose}
              className="p-2 hover:bg-coffee-100 rounded-full transition-colors"
            >
              <X className="text-coffee-600" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'info' && (
              <form onSubmit={handleSubmitInfo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-coffee-800 mb-2">
                      <User size={16} className="inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 ${
                        errors.name ? 'border-red-500' : 'border-coffee-300'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-coffee-800 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 ${
                        errors.phone ? 'border-red-500' : 'border-coffee-300'
                      }`}
                      placeholder="+248 XXX XXXX"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-coffee-800 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 ${
                      errors.email ? 'border-red-500' : 'border-coffee-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-coffee-800 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 ${
                      errors.address ? 'border-red-500' : 'border-coffee-300'
                    }`}
                    placeholder="Street address, district, island"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="deliveryNotes" className="block text-sm font-medium text-coffee-800 mb-2">
                    <MessageSquare size={16} className="inline mr-1" />
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    id="deliveryNotes"
                    name="deliveryNotes"
                    rows={3}
                    value={customerInfo.deliveryNotes}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 resize-vertical"
                    placeholder="Any special delivery instructions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!validateForm()}
                  className="w-full bg-coffee-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-coffee-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Order Review
                </button>
              </form>
            )}

            {step === 'confirmation' && (
              <div className="space-y-6">
                {/* Customer Info Summary */}
                <div className="bg-cream-50 rounded-lg p-4">
                  <h3 className="font-semibold text-coffee-900 mb-3">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {customerInfo.name}</p>
                    <p><strong>Phone:</strong> {customerInfo.phone}</p>
                    <p><strong>Email:</strong> {customerInfo.email}</p>
                    <p><strong>Address:</strong> {customerInfo.address}</p>
                    {customerInfo.deliveryNotes && (
                      <p><strong>Notes:</strong> {customerInfo.deliveryNotes}</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-cream-50 rounded-lg p-4">
                  <h3 className="font-semibold text-coffee-900 mb-3">Order Summary</h3>
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-coffee-600">
                            {item.product.brand === 'daniels-blend' ? "Daniel's Blend" : 'Viaggio Espresso'} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="border-t border-coffee-200 pt-3 flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span>${state.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-coffee-600 text-white rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Payment Method</h3>
                  <p className="text-sm">Cash on Delivery - Pay when your order arrives</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('info')}
                    className="flex-1 bg-cream-200 text-coffee-800 py-3 rounded-lg font-semibold hover:bg-cream-300 transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="flex-1 bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Order'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-coffee-900 mb-2">
                    Order Confirmed!
                  </h3>
                  <p className="text-coffee-600">
                    Your order has been received and will be processed soon.
                  </p>
                </div>

                <div className="bg-cream-50 rounded-lg p-4">
                  <p className="font-semibold text-coffee-900 mb-2">Order ID</p>
                  <p className="text-2xl font-mono font-bold text-coffee-600">{orderId}</p>
                </div>

                <div className="space-y-3 text-sm text-coffee-700">
                  <p>✓ We&apos;ll contact you within 24 hours to confirm delivery details</p>
                  <p>✓ Same-day delivery available in Victoria</p>
                  <p>✓ 1-2 days delivery to other islands</p>
                  <p>✓ Payment due on delivery (cash only)</p>
                </div>

                <button
                  onClick={resetModal}
                  className="w-full bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}