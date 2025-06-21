'use client';

import { useState } from 'react';
import { User, Mail, Phone, Key } from 'lucide-react';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  createAccount: boolean;
}

interface CustomerInfoProps {
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
  customerData: CustomerData;
  setCustomerData: (data: CustomerData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CustomerInfo({
  isGuest,
  setIsGuest,
  customerData,
  setCustomerData,
  onNext,
  onBack
}: CustomerInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!customerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!customerData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(customerData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const updateCustomerData = (field: keyof CustomerData, value: string | boolean) => {
    setCustomerData({
      ...customerData,
      [field]: value
    });
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-coffee-900 mb-6">Customer Information</h2>
      
      {/* Guest/Login Toggle */}
      <div className="bg-cream-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsGuest(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              isGuest
                ? 'bg-coffee-600 text-white'
                : 'bg-white text-coffee-600 border border-coffee-300'
            }`}
          >
            Guest Checkout
          </button>
          <button
            onClick={() => setIsGuest(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              !isGuest
                ? 'bg-coffee-600 text-white'
                : 'bg-white text-coffee-600 border border-coffee-300'
            }`}
          >
            Login / Register
          </button>
        </div>
      </div>

      {!isGuest ? (
        <div className="bg-cream-50 rounded-lg p-6 mb-6 text-center">
          <Key size={48} className="text-coffee-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-coffee-900 mb-2">Account Login</h3>
          <p className="text-coffee-600 mb-4">
            Sign in to your account to access your order history and saved preferences.
          </p>
          <button
            onClick={() => setIsGuest(true)}
            className="text-coffee-600 hover:text-coffee-800 underline"
          >
            Continue as guest instead
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-coffee-900 mb-2">
              <User size={16} className="inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={customerData.name}
              onChange={(e) => updateCustomerData('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-cream-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-coffee-900 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={customerData.email}
              onChange={(e) => updateCustomerData('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-cream-300'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-coffee-900 mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={customerData.phone}
              onChange={(e) => updateCustomerData('phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-cream-300'
              }`}
              placeholder="+248 xxx xxxx or xxx xxxx"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Create Account Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="createAccount"
              checked={customerData.createAccount}
              onChange={(e) => updateCustomerData('createAccount', e.target.checked)}
              className="w-4 h-4 text-coffee-600 border-cream-300 rounded focus:ring-coffee-600"
            />
            <label htmlFor="createAccount" className="ml-2 text-sm text-coffee-700">
              Create an account for faster checkout next time
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 border-2 border-coffee-600 text-coffee-600 py-3 px-6 rounded-full font-semibold hover:bg-coffee-600 hover:text-white transition-colors"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              className="flex-1 bg-coffee-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-coffee-700 transition-colors"
            >
              Continue to Delivery
            </button>
          </div>
        </form>
      )}
    </div>
  );
}