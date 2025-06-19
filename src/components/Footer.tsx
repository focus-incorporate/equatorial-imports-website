import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-coffee-gradient text-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/equatorial-imports-logo.png"
                alt="Equatorial Imports"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-display font-semibold">
                Equatorial Imports
              </span>
            </div>
            <p className="text-cream-200 text-sm">
              Sourcing the finest food and beverages from around the world, 
              delivering premium taste experiences to Seychelles.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cream-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-cream-200 hover:text-cream-100 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/coffee" className="text-cream-200 hover:text-cream-100 text-sm transition-colors">
                  Coffee Collection
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-cream-200 hover:text-cream-100 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-cream-200 hover:text-cream-100 text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cream-100">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-cream-200 text-sm">
                <MapPin size={16} />
                <span>Seychelles</span>
              </li>
              <li className="flex items-center space-x-2 text-cream-200 text-sm">
                <Phone size={16} />
                <span>+248 XXX XXXX</span>
              </li>
              <li className="flex items-center space-x-2 text-cream-200 text-sm">
                <Mail size={16} />
                <span>info@equatorialimports.sc</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cream-100">Business Hours</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-cream-200 text-sm">
                <Clock size={16} />
                <span>Mon - Fri: 8:00 AM - 5:00 PM</span>
              </li>
              <li className="text-cream-200 text-sm ml-6">
                Sat: 9:00 AM - 2:00 PM
              </li>
              <li className="text-cream-200 text-sm ml-6">
                Sun: Closed
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-cream-300 text-xs">
                <strong>Payment:</strong> Cash on Delivery Available
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-coffee-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-cream-300 text-sm">
            © 2024 Equatorial Imports. All rights reserved.
          </p>
          <p className="text-cream-300 text-sm mt-2 md:mt-0">
            Chasing the world&apos;s finest flavors to Seychelles
          </p>
        </div>
      </div>
    </footer>
  );
}