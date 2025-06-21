'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CartReview from '@/components/checkout/CartReview';
import CustomerInfo from '@/components/checkout/CustomerInfo';
import DeliveryInfo from '@/components/checkout/DeliveryInfo';
import PaymentMethod from '@/components/checkout/PaymentMethod';
import OrderReview from '@/components/checkout/OrderReview';

type CheckoutStep = 'cart' | 'customer' | 'delivery' | 'payment' | 'review';

export default function CheckoutPage() {
  const { state } = useCart();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [isGuest, setIsGuest] = useState(true);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    createAccount: false
  });
  const [deliveryData, setDeliveryData] = useState({
    address: '',
    district: '',
    island: 'mahe',
    deliveryNotes: '',
    timePreference: 'anytime'
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (state.items.length === 0) {
      router.push('/coffee');
    }
  }, [state.items.length, router]);

  const steps: { key: CheckoutStep; title: string; completed: boolean }[] = [
    { key: 'cart', title: 'Cart Review', completed: currentStep !== 'cart' },
    { key: 'customer', title: 'Customer Info', completed: ['delivery', 'payment', 'review'].includes(currentStep) },
    { key: 'delivery', title: 'Delivery', completed: ['payment', 'review'].includes(currentStep) },
    { key: 'payment', title: 'Payment', completed: currentStep === 'review' },
    { key: 'review', title: 'Review Order', completed: false }
  ];

  const nextStep = () => {
    const stepOrder: CheckoutStep[] = ['cart', 'customer', 'delivery', 'payment', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: CheckoutStep[] = ['cart', 'customer', 'delivery', 'payment', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  if (state.items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-coffee-900 mb-2">
            Checkout
          </h1>
          <p className="text-coffee-600">
            Complete your order for premium coffee delivery to Seychelles
          </p>
        </div>

        {/* Progress Steps */}
        <CheckoutSteps steps={steps} currentStep={currentStep} />

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {currentStep === 'cart' && (
            <CartReview
              onNext={nextStep}
              onContinueShopping={() => router.push('/coffee')}
            />
          )}

          {currentStep === 'customer' && (
            <CustomerInfo
              isGuest={isGuest}
              setIsGuest={setIsGuest}
              customerData={customerData}
              setCustomerData={setCustomerData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 'delivery' && (
            <DeliveryInfo
              deliveryData={deliveryData}
              setDeliveryData={setDeliveryData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentMethod
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 'review' && (
            <OrderReview
              customerData={customerData}
              deliveryData={deliveryData}
              onBack={prevStep}
            />
          )}
        </div>
      </div>
    </div>
  );
}