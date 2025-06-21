'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Clock, MapPin, Mail } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      router.push('/');
      return;
    }

    // Get order details from localStorage
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const order = orders.find((o: any) => o.id === orderId);
      if (order) {
        setOrderDetails(order);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      router.push('/');
    }
  }, [searchParams, router]);

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-3xl font-display font-bold text-coffee-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-coffee-600 mb-2">
            Thank you for your order. We&apos;ll contact you shortly to confirm delivery details.
          </p>
          <p className="text-sm text-coffee-500">
            📧 Order confirmation email sent to {orderDetails.customer.email}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="border-b border-cream-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold text-coffee-900 mb-2">Order Details</h2>
            <div className="flex items-center justify-between">
              <span className="text-coffee-600">Order Number:</span>
              <span className="font-mono font-bold text-coffee-900">{orderDetails.id}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-coffee-600">Order Date:</span>
              <span className="text-coffee-900">
                {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-coffee-900 mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {orderDetails.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div>
                    <span className="font-medium text-coffee-900">{item.product.name}</span>
                    <span className="text-coffee-600 ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-coffee-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-200 pt-3 mt-3">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-coffee-900 mb-3 flex items-center">
                <Mail size={18} className="mr-2" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {orderDetails.customer.name}</div>
                <div><strong>Email:</strong> {orderDetails.customer.email}</div>
                <div><strong>Phone:</strong> {orderDetails.customer.phone}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-coffee-900 mb-3 flex items-center">
                <MapPin size={18} className="mr-2" />
                Delivery Address
              </h3>
              <div className="space-y-2 text-sm">
                <div>{orderDetails.customer.address}</div>
                {orderDetails.customer.deliveryNotes && (
                  <div><strong>Notes:</strong> {orderDetails.customer.deliveryNotes}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-coffee-600 text-white rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Clock size={20} className="mr-2" />
            What happens next?
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-coffee-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
              <div>
                <strong>Order Confirmation</strong><br />
                We&apos;ll contact you within 2 hours to confirm your order and delivery details.
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-coffee-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
              <div>
                <strong>Preparation</strong><br />
                Your coffee will be carefully prepared and packaged for delivery.
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-coffee-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
              <div>
                <strong>Delivery</strong><br />
                Same-day delivery in Victoria, 1-2 days to other islands. Payment on delivery.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/coffee"
            className="bg-coffee-600 text-white px-8 py-3 rounded-full font-semibold text-center hover:bg-coffee-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="border-2 border-coffee-600 text-coffee-600 px-8 py-3 rounded-full font-semibold text-center hover:bg-coffee-600 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}