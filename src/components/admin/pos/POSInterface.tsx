'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, CreditCard, DollarSign, Minus, Plus, X, User, AlertCircle, Receipt as ReceiptIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Receipt from './Receipt';

interface POSProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  taxRate: number;
  barcode?: string;
}

interface POSCartItem {
  product: POSProduct;
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyPoints: number;
}

export default function POSInterface() {
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/pos/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  // Add product to cart
  const addToCart = (product: POSProduct) => {
    if (product.stock <= 0) {
      toast.error('Product out of stock');
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Cannot add more items than available in stock');
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Update quantity in cart
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast.error('Cannot add more items than available in stock');
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setCashReceived('');
    setPaymentMethod('cash');
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const taxAmount = cart.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    const tax = (itemTotal * item.product.taxRate) / 100;
    return sum + tax;
  }, 0);
  const total = subtotal + taxAmount;

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived);
      if (isNaN(received) || received < total) {
        toast.error('Insufficient cash received');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const transactionData = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          lineTotal: item.product.price * item.quantity,
        })),
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount: total,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : undefined,
        cardAmount: paymentMethod === 'card' ? total : undefined,
        notes: '',
      };

      const response = await fetch('/api/admin/pos/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.error || 'Failed to process transaction';
        
        // Provide more user-friendly error messages
        if (errorMessage.includes('Insufficient stock')) {
          errorMessage = `⚠️ ${errorMessage}`;
        } else if (errorMessage.includes('Product not found')) {
          errorMessage = '❌ One or more products are no longer available';
        } else if (errorMessage.includes('Unauthorized')) {
          errorMessage = '🔒 Authentication required. Please log in again.';
        } else if (errorMessage.includes('payment method')) {
          errorMessage = '💳 Invalid payment method selected';
        } else if (response.status >= 500) {
          errorMessage = '🔧 Server error. Please try again or contact support.';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Store transaction ID for receipt
      setLastTransactionId(result.transaction.id);
      
      // Show success message with transaction details
      toast.success(`Transaction completed! Transaction #${result.transaction.transactionNumber}`);
      
      // Show change if cash payment
      if (paymentMethod === 'cash' && result.transaction.changeGiven > 0) {
        toast.success(`Change: ₨${result.transaction.changeGiven.toFixed(2)}`, {
          duration: 5000,
        });
      }

      // Update product stock in local state
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const cartItem = cart.find(item => item.product.id === product.id);
          if (cartItem) {
            return {
              ...product,
              stock: product.stock - cartItem.quantity,
            };
          }
          return product;
        })
      );

      // Clear cart and close modal
      clearCart();
      setShowPaymentModal(false);

      // Show receipt automatically
      setShowReceipt(true);

    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="h-screen bg-coffee-50 flex">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-cream-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-coffee-900">Point of Sale</h1>
            <div className="flex items-center space-x-4">
              <span className="text-coffee-600">Staff: Admin User</span>
              {lastTransactionId && (
                <button
                  onClick={() => setShowReceipt(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200"
                >
                  <ReceiptIcon className="h-4 w-4" />
                  Last Receipt
                </button>
              )}
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-coffee-600 text-white'
                    : 'bg-white text-coffee-600 border border-coffee-600'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize ${
                    selectedCategory === category
                      ? 'bg-coffee-600 text-white'
                      : 'bg-white text-coffee-600 border border-coffee-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto" data-testid="pos-product-grid">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-cream-200 animate-pulse">
                  <div className="w-full h-32 bg-cream-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-cream-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-cream-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={`bg-white rounded-xl p-4 border border-cream-200 hover:shadow-md transition-all duration-200 text-left ${
                    product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-coffee-300'
                  }`}
                  data-testid="pos-product-card"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-product.jpg';
                      }}
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Low Stock
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-coffee-900 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-coffee-600 capitalize mb-2">{product.brand.replace('-', ' ')}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-coffee-900">₨{product.price.toFixed(2)}</span>
                    <span className="text-sm text-coffee-600">Stock: {product.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-coffee-500">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white border-l border-cream-200 flex flex-col" data-testid="pos-cart">
        {/* Cart Header */}
        <div className="p-4 border-b border-cream-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-coffee-900">Current Order</h2>
            <ShoppingCart className="h-6 w-6 text-coffee-600" />
          </div>

          {/* Customer Selection */}
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-coffee-600" />
            {selectedCustomer ? (
              <div className="flex-1 bg-coffee-50 rounded-lg p-2">
                <p className="font-medium text-coffee-900">{selectedCustomer.name}</p>
                <p className="text-sm text-coffee-600">Points: {selectedCustomer.loyaltyPoints}</p>
              </div>
            ) : (
              <button className="flex-1 text-left text-coffee-600 hover:text-coffee-800">
                + Add Customer (Optional)
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-coffee-500">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p className="text-center">Cart is empty<br />Add products to start an order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="bg-coffee-50 rounded-lg p-3" data-testid="cart-item">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-coffee-900 flex-1">{item.product.name}</h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-cream-300 hover:bg-cream-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-cream-300 hover:bg-cream-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-semibold text-coffee-900">
                      ₨{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="border-t border-cream-200 p-4 space-y-3">
            <div className="flex justify-between text-coffee-700">
              <span>Subtotal:</span>
              <span>₨{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-coffee-700">
              <span>Tax (15%):</span>
              <span>₨{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-coffee-900 pt-2 border-t border-cream-200">
              <span>Total:</span>
              <span>₨{total.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
                className="w-full bg-coffee-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Payment
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-cream-200 text-coffee-700 py-2 px-4 rounded-lg font-medium hover:bg-cream-300"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-cream-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-coffee-900">Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-coffee-500 hover:text-coffee-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Order Summary */}
              <div className="bg-coffee-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>₨{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax:</span>
                  <span>₨{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₨{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                      paymentMethod === 'cash'
                        ? 'border-coffee-600 bg-coffee-50 text-coffee-900'
                        : 'border-cream-300 text-coffee-600'
                    }`}
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                      paymentMethod === 'card'
                        ? 'border-coffee-600 bg-coffee-50 text-coffee-900'
                        : 'border-cream-300 text-coffee-600'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Card
                  </button>
                </div>
              </div>

              {/* Cash Amount */}
              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Cash Received
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={total}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                    placeholder={`Minimum: ₨${total.toFixed(2)}`}
                  />
                  {cashReceived && parseFloat(cashReceived) >= total && (
                    <p className="text-sm text-green-600 mt-1">
                      Change: ₨{(parseFloat(cashReceived) - total).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* Process Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-50"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Complete Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTransactionId && (
        <Receipt
          transactionId={lastTransactionId}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}