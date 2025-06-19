'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    orderType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          orderType: 'general'
        });
      } else {
        setSubmitStatus('error');
        console.error('Form submission error:', result.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="py-20 bg-coffee-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-cream-50 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-cream-200 max-w-3xl mx-auto leading-relaxed">
            Ready to order or have questions? We&apos;re here to help with all your premium coffee needs
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 coffee-shadow">
            <div className="flex items-center space-x-2 mb-6">
              <MessageCircle className="text-coffee-600" size={24} />
              <h2 className="text-2xl font-display font-bold text-coffee-900">
                Send us a Message
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-coffee-800 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-coffee-800 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                    placeholder="+248 XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-coffee-800 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="orderType" className="block text-sm font-medium text-coffee-800 mb-2">
                  Inquiry Type
                </label>
                <select
                  id="orderType"
                  name="orderType"
                  value={formData.orderType}
                  onChange={handleChange}
                  className="w-full p-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Product Order</option>
                  <option value="bulk">Bulk Pricing</option>
                  <option value="delivery">Delivery Information</option>
                  <option value="support">Customer Support</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-coffee-800 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 resize-vertical"
                  placeholder="Tell us about your inquiry, specific products you're interested in, or any questions you have..."
                />
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg">
                  <p className="font-semibold">Message sent successfully!</p>
                  <p className="text-sm">We&apos;ll get back to you within 24 hours.</p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
                  <p className="font-semibold">Error sending message</p>
                  <p className="text-sm">Please try again or contact us directly.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-coffee-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-coffee-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl p-8 coffee-shadow">
              <h2 className="text-2xl font-display font-bold text-coffee-900 mb-6">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-coffee-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-900 mb-1">Location</h3>
                    <p className="text-coffee-700">
                      Seychelles<br />
                      Serving all islands with delivery
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="text-coffee-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-900 mb-1">Phone</h3>
                    <p className="text-coffee-700">
                      +248 XXX XXXX<br />
                      <span className="text-sm text-coffee-600">Call for orders and inquiries</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-coffee-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-900 mb-1">Email</h3>
                    <p className="text-coffee-700">
                      info@equatorialimports.sc<br />
                      <span className="text-sm text-coffee-600">We respond within 24 hours</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-coffee-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-900 mb-1">Business Hours</h3>
                    <div className="text-coffee-700 text-sm">
                      <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                      <p>Saturday: 9:00 AM - 2:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-coffee-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-display font-bold mb-6">
                Ready to Order?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cream-200 rounded-full" />
                  <span>Cash on delivery available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cream-200 rounded-full" />
                  <span>Free delivery throughout Seychelles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cream-200 rounded-full" />
                  <span>Bulk pricing available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cream-200 rounded-full" />
                  <span>Same-day delivery in Victoria</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-coffee-700 rounded-lg">
                <h3 className="font-semibold mb-2">Minimum Order</h3>
                <p className="text-cream-200 text-sm">
                  No minimum order required. Order as little or as much as you need!
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-8 coffee-shadow">
              <h2 className="text-2xl font-display font-bold text-coffee-900 mb-6">
                Quick Answers
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-coffee-900 mb-2">
                    How do I place an order?
                  </h3>
                  <p className="text-coffee-700 text-sm">
                    Contact us via phone, email, or the form above with your product preferences. 
                    We&apos;ll confirm availability and arrange delivery.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-coffee-900 mb-2">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-coffee-700 text-sm">
                    Currently, we offer cash on delivery for all orders throughout Seychelles.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-coffee-900 mb-2">
                    How long does delivery take?
                  </h3>
                  <p className="text-coffee-700 text-sm">
                    Same-day delivery in Victoria, 1-2 days for other islands, depending on availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}