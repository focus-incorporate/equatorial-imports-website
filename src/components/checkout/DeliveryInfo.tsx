'use client';

import { useState } from 'react';
import { MapPin, Clock, MessageSquare } from 'lucide-react';

interface DeliveryData {
  address: string;
  district: string;
  island: 'mahe' | 'praslin' | 'la-digue' | 'other';
  deliveryNotes: string;
  timePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

interface DeliveryInfoProps {
  deliveryData: DeliveryData;
  setDeliveryData: (data: DeliveryData) => void;
  onNext: () => void;
  onBack: () => void;
}

const SEYCHELLES_DISTRICTS = {
  mahe: [
    'Victoria', 'Beau Vallon', 'Glacis', 'Mont Fleuri', 'Roche Caiman',
    'St. Louis', 'Anse Royale', 'Takamaka', 'Baie Lazare', 'Anse Boileau',
    'Cascade', 'Grand Anse Mahe', 'Port Glaud', 'Pointe La Rue'
  ],
  praslin: [
    'Baie Sainte Anne', 'Grand Anse Praslin', 'Anse Volbert', 'Anse Lazio',
    'Fond de l\'Anse'
  ],
  'la-digue': [
    'La Passe', 'La Reunion', 'L\'Union'
  ],
  other: ['Other Island']
};

export default function DeliveryInfo({
  deliveryData,
  setDeliveryData,
  onNext,
  onBack
}: DeliveryInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!deliveryData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    if (!deliveryData.district) {
      newErrors.district = 'Please select a district';
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

  const updateDeliveryData = (field: keyof DeliveryData, value: string) => {
    setDeliveryData({
      ...deliveryData,
      [field]: value
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getDeliveryFee = () => {
    if (deliveryData.island === 'mahe' && ['Victoria', 'Mont Fleuri', 'Roche Caiman', 'St. Louis'].includes(deliveryData.district)) {
      return 'Free';
    }
    return 'SCR 25';
  };

  const getDeliveryTime = () => {
    if (deliveryData.island === 'mahe') {
      return 'Same day delivery available';
    }
    return '1-2 days delivery';
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-coffee-900 mb-6">Delivery Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Island Selection */}
        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            <MapPin size={16} className="inline mr-2" />
            Island
          </label>
          <select
            value={deliveryData.island}
            onChange={(e) => {
              updateDeliveryData('island', e.target.value);
              updateDeliveryData('district', ''); // Reset district when island changes
            }}
            className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
          >
            <option value="mahe">Mahé</option>
            <option value="praslin">Praslin</option>
            <option value="la-digue">La Digue</option>
            <option value="other">Other Island</option>
          </select>
        </div>

        {/* District Selection */}
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-coffee-900 mb-2">
            District / Area
          </label>
          <select
            id="district"
            value={deliveryData.district}
            onChange={(e) => updateDeliveryData('district', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent ${
              errors.district ? 'border-red-500' : 'border-cream-300'
            }`}
          >
            <option value="">Select a district</option>
            {SEYCHELLES_DISTRICTS[deliveryData.island].map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
        </div>

        {/* Address Field */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-coffee-900 mb-2">
            Street Address
          </label>
          <textarea
            id="address"
            value={deliveryData.address}
            onChange={(e) => updateDeliveryData('address', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent ${
              errors.address ? 'border-red-500' : 'border-cream-300'
            }`}
            placeholder="Enter your complete address, including landmarks if helpful"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        {/* Time Preference */}
        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            <Clock size={16} className="inline mr-2" />
            Preferred Delivery Time
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'morning', label: 'Morning (8AM - 12PM)' },
              { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
              { value: 'evening', label: 'Evening (5PM - 8PM)' },
              { value: 'anytime', label: 'Anytime' }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="timePreference"
                  value={option.value}
                  checked={deliveryData.timePreference === option.value}
                  onChange={(e) => updateDeliveryData('timePreference', e.target.value)}
                  className="w-4 h-4 text-coffee-600 border-cream-300 focus:ring-coffee-600"
                />
                <span className="ml-2 text-sm text-coffee-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Notes */}
        <div>
          <label htmlFor="deliveryNotes" className="block text-sm font-medium text-coffee-900 mb-2">
            <MessageSquare size={16} className="inline mr-2" />
            Delivery Notes (Optional)
          </label>
          <textarea
            id="deliveryNotes"
            value={deliveryData.deliveryNotes}
            onChange={(e) => updateDeliveryData('deliveryNotes', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
            placeholder="Any special instructions for delivery..."
          />
        </div>

        {/* Delivery Info Summary */}
        <div className="bg-cream-50 rounded-lg p-4">
          <h3 className="font-semibold text-coffee-900 mb-2">Delivery Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-medium">{getDeliveryFee()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Time:</span>
              <span className="font-medium">{getDeliveryTime()}</span>
            </div>
            <div className="text-coffee-600 text-xs mt-2">
              * Cash on delivery payment only. We'll contact you to confirm delivery time.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border-2 border-coffee-600 text-coffee-600 py-3 px-6 rounded-full font-semibold hover:bg-coffee-600 hover:text-white transition-colors"
          >
            Back to Customer Info
          </button>
          <button
            type="submit"
            className="flex-1 bg-coffee-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-coffee-700 transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
}