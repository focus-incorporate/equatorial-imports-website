import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, Globe, Shield } from "lucide-react";
import { Metadata } from "next";
import FallingBeans from '../components/3d/FallingBeansClient';

export const metadata: Metadata = {
  title: "Equatorial Imports - Premium Coffee & Beverages from Around the World",
  description: "Discover premium coffee imports in Seychelles. Daniel's Blend and Viaggio Espresso capsules and beans. Free delivery, cash on delivery. Quality guaranteed.",
  keywords: ["coffee Seychelles", "premium coffee", "Nespresso compatible", "Daniel's Blend", "Viaggio Espresso", "coffee delivery Seychelles", "imported coffee"],
  openGraph: {
    title: "Equatorial Imports - Premium Coffee & Beverages",
    description: "Discover premium coffee imports in Seychelles. Daniel's Blend and Viaggio Espresso capsules and beans.",
    type: "website",
    locale: "en_US",
    siteName: "Equatorial Imports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Equatorial Imports - Premium Coffee & Beverages",
    description: "Discover premium coffee imports in Seychelles. Daniel's Blend and Viaggio Espresso capsules and beans.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-hero-gradient overflow-hidden">
        {/* 3D Falling Coffee Beans */}
        <FallingBeans />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/single coffe bean.png')] bg-repeat bg-[length:50px_50px] animate-float"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/images/equatorial-imports-logo.png"
                alt="Equatorial Imports"
                width={120}
                height={120}
                className="h-24 w-auto sm:h-32"
                priority
              />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-cream-50 leading-tight">
              Chasing the World&apos;s
              <span className="block text-cream-200">Finest Flavors</span>
              <span className="block text-cream-300">to Seychelles</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-cream-200 max-w-3xl mx-auto leading-relaxed">
              Premium food & beverage imports bringing exceptional taste experiences 
              from around the globe to your doorstep
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href="/coffee"
                className="bg-cream-200 text-coffee-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-cream-100 transition-all duration-300 hover-lift flex items-center space-x-2 group"
              >
                <Coffee size={20} />
                <span>Explore Our Coffee</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/about"
                className="border-2 border-cream-200 text-cream-100 px-8 py-4 rounded-full font-semibold text-lg hover:bg-cream-200 hover:text-coffee-900 transition-all duration-300"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cream-200 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cream-200 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-coffee-900 mb-4">
              Why Choose Equatorial Imports?
            </h2>
            <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
              We&apos;re more than just importers - we&apos;re your gateway to world-class flavors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quality Assurance */}
            <div className="text-center p-8 bg-white rounded-2xl coffee-shadow hover-lift">
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-coffee-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-4">Premium Quality</h3>
              <p className="text-coffee-700">
                We source only the finest products from trusted suppliers worldwide, 
                ensuring every item meets our strict quality standards.
              </p>
            </div>

            {/* Global Sourcing */}
            <div className="text-center p-8 bg-white rounded-2xl coffee-shadow hover-lift">
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="text-coffee-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-4">Global Sourcing</h3>
              <p className="text-coffee-700">
                From Italian espresso to exotic flavors, we bring you the best 
                taste experiences from every corner of the world.
              </p>
            </div>

            {/* Local Trust */}
            <div className="text-center p-8 bg-white rounded-2xl coffee-shadow hover-lift">
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coffee className="text-coffee-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-4">Seychelles Trusted</h3>
              <p className="text-coffee-700">
                Based in Seychelles, we understand local tastes and deliver 
                with the convenience of cash-on-delivery service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coffee Preview Section */}
      <section className="py-20 bg-coffee-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-cream-50 mb-8">
            Our Coffee Collection
          </h2>
          <p className="text-xl text-cream-200 mb-12 max-w-2xl mx-auto">
            Start your journey with our premium coffee imports from Daniel&apos;s Blend and Viaggio Espresso
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Daniel's Blend Preview */}
            <div className="bg-cream-50 rounded-2xl p-8 coffee-shadow hover-lift">
              <h3 className="text-2xl font-display font-bold text-coffee-900 mb-4">Daniel&apos;s Blend</h3>
              <p className="text-coffee-700 mb-6">
                Premium Nespresso-compatible capsules featuring intense, aromatic, and flavored varieties
              </p>
              <div className="text-sm text-coffee-600 mb-6">
                5 Unique Blends • Intensities 5-12 • From $9.99
              </div>
            </div>

            {/* Viaggio Espresso Preview */}
            <div className="bg-cream-50 rounded-2xl p-8 coffee-shadow hover-lift">
              <h3 className="text-2xl font-display font-bold text-coffee-900 mb-4">Viaggio Espresso</h3>
              <p className="text-coffee-700 mb-6">
                Premium coffee beans and capsules for all brewing methods, sustainably sourced
              </p>
              <div className="text-sm text-coffee-600 mb-6">
                5 Premium Options • Beans & Capsules • From $11.99
              </div>
            </div>
          </div>

          <Link
            href="/coffee"
            className="inline-flex items-center space-x-2 bg-cream-200 text-coffee-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-cream-100 transition-all duration-300 hover-lift group"
          >
            <span>Discover All Coffees</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
