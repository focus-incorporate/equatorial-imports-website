import { MapPin, Coffee, Globe, Users, Award, Truck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-coffee-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-cream-50 mb-6">
            About Equatorial Imports
          </h1>
          <p className="text-xl text-cream-200 max-w-3xl mx-auto leading-relaxed">
            Your trusted partner for premium food and beverage imports in Seychelles
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-coffee-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-coffee-700">
                <p>
                  Equatorial Imports was founded with a simple yet ambitious mission: 
                  to bring the world&apos;s finest food and beverage products to the beautiful 
                  islands of Seychelles.
                </p>
                <p>
                  Starting with premium coffee imports, we carefully select products 
                  that meet our strict quality standards. Every item we import is chosen 
                  for its exceptional taste, quality, and authenticity.
                </p>
                <p>
                  We believe that great flavor knows no borders, and we&apos;re committed 
                  to making premium international products accessible to the Seychelles 
                  community with the convenience and trust you deserve.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-coffee-600 rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-display font-bold mb-4">
                  Our Mission
                </h3>
                <p className="text-cream-200 text-lg">
                  &quot;To source the finest food and drink products from around the world 
                  and deliver premium taste experiences to our local market.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-coffee-900 mb-4">
              What We Do
            </h2>
            <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
              From sourcing to delivery, we handle every step to bring you the best products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-coffee-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-3">Global Sourcing</h3>
              <p className="text-coffee-700">
                We travel the world to find exceptional products from trusted suppliers 
                who share our commitment to quality.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-coffee-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-3">Quality Assurance</h3>
              <p className="text-coffee-700">
                Every product undergoes rigorous quality checks to ensure it meets 
                our high standards before reaching you.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-coffee-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-3">Local Delivery</h3>
              <p className="text-coffee-700">
                We provide convenient delivery throughout Seychelles with our 
                reliable cash-on-delivery service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Products */}
      <section className="py-20 bg-coffee-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-cream-50 mb-4">
              Our Current Focus: Premium Coffee
            </h2>
            <p className="text-xl text-cream-200 max-w-2xl mx-auto">
              We&apos;re starting our journey with the finest coffee imports, featuring two exceptional brands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 text-center coffee-shadow">
              <div className="w-20 h-20 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coffee className="text-coffee-600" size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold text-coffee-900 mb-4">
                Daniel&apos;s Blend
              </h3>
              <p className="text-coffee-700 mb-4">
                Premium Nespresso-compatible capsules with intensity levels from 5 to 12. 
                Features aluminum pods that are 100% recyclable with no preservatives.
              </p>
              <div className="text-sm text-coffee-600">
                5 Unique Varieties • Intensities 5-12 • Starting from $9.99
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center coffee-shadow">
              <div className="w-20 h-20 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coffee className="text-coffee-600" size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold text-coffee-900 mb-4">
                Viaggio Espresso
              </h3>
              <p className="text-coffee-700 mb-4">
                Sustainably sourced premium coffee beans and multi-system compatible capsules. 
                Perfect for all brewing methods with exceptional flavor profiles.
              </p>
              <div className="text-sm text-coffee-600">
                5 Premium Options • Beans & Capsules • Starting from $11.99
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Details */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-coffee-900 mb-4">
              Company Information
            </h2>
            <p className="text-lg text-coffee-700">
              Transparency and trust are at the heart of our business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 text-center coffee-shadow">
              <MapPin className="text-coffee-600 mx-auto mb-4" size={32} />
              <h3 className="font-semibold text-coffee-900 mb-2">Location</h3>
              <p className="text-coffee-700 text-sm">Based in Seychelles</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center coffee-shadow">
              <Users className="text-coffee-600 mx-auto mb-4" size={32} />
              <h3 className="font-semibold text-coffee-900 mb-2">Service</h3>
              <p className="text-coffee-700 text-sm">Cash on Delivery Available</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center coffee-shadow">
              <Award className="text-coffee-600 mx-auto mb-4" size={32} />
              <h3 className="font-semibold text-coffee-900 mb-2">Quality</h3>
              <p className="text-coffee-700 text-sm">Premium Products Only</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center coffee-shadow">
              <Truck className="text-coffee-600 mx-auto mb-4" size={32} />
              <h3 className="font-semibold text-coffee-900 mb-2">Delivery</h3>
              <p className="text-coffee-700 text-sm">Throughout Seychelles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-coffee-900 mb-6">
            Looking Forward
          </h2>
          <p className="text-lg text-coffee-700 mb-8">
            While we&apos;re starting with premium coffee, our vision extends far beyond. 
            We plan to expand our product range to include other exceptional food and 
            beverage categories, always maintaining our commitment to quality and service.
          </p>
          <div className="bg-coffee-100 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-coffee-900 mb-4">
              Coming Soon: More Categories
            </h3>
            <p className="text-coffee-700">
              Stay tuned as we explore new product categories including fresh juices, 
              specialty foods, and other premium beverages to bring even more world-class 
              flavors to Seychelles.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}