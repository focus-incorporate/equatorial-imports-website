'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ShoppingCart, Coffee } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { state } = useCart();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/equatorial-imports-logo.png"
              alt="Equatorial Imports"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xl font-display font-semibold text-gradient">
              Equatorial Imports
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-coffee-800 hover:text-coffee-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="/coffee" 
              className="text-coffee-800 hover:text-coffee-600 transition-colors font-medium flex items-center space-x-1"
            >
              <Coffee size={18} />
              <span>Coffee</span>
            </Link>
            <Link 
              href="/about" 
              className="text-coffee-800 hover:text-coffee-600 transition-colors font-medium"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="text-coffee-800 hover:text-coffee-600 transition-colors font-medium"
            >
              Contact
            </Link>
            
            {/* Cart Button */}
            <button 
              onClick={toggleCart}
              className="relative p-2 text-coffee-800 hover:text-coffee-600 transition-colors"
              aria-label={`Shopping cart with ${state.itemCount} items`}
            >
              <ShoppingCart size={20} />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-coffee-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-coffee-800 hover:text-coffee-600 transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-cream-100 rounded-lg mt-2">
              <Link
                href="/"
                className="block px-3 py-2 text-coffee-800 hover:text-coffee-600 transition-colors font-medium"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                href="/coffee"
                className="block px-3 py-2 text-coffee-800 hover:text-coffee-600 transition-colors font-medium"
                onClick={toggleMenu}
              >
                Coffee
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-coffee-800 hover:text-coffee-600 transition-colors font-medium"
                onClick={toggleMenu}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-coffee-800 hover:text-coffee-600 transition-colors font-medium"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <div className="px-3 py-2">
                <button 
                  onClick={toggleCart}
                  className="flex items-center space-x-2 text-coffee-800 hover:text-coffee-600 transition-colors"
                >
                  <ShoppingCart size={18} />
                  <span>Cart ({state.itemCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}