'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';

interface LayoutWithCartProps {
  children: React.ReactNode;
}

export default function LayoutWithCart({ children }: LayoutWithCartProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <>
      <Navbar 
        isCartOpen={isCartOpen} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
      />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      
      {/* Cart Drawer - positioned at root level to avoid navbar constraints */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setIsCheckoutOpen(true)}
      />
      
      {/* Checkout Modal - temporarily disabled due to infinite loop */}
      {/* <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      /> */}
    </>
  );
}