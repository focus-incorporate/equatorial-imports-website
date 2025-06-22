export interface Product {
  id: string;
  name: string;
  brand: 'daniels-blend' | 'viaggio-espresso';
  type: 'capsules' | 'beans';
  intensity: number;
  roast: 'light' | 'medium' | 'dark';
  flavorNotes: string[];
  price: number;
  image: string;
  description: string;
  compatibility?: string[];
  weight?: string;
  inStock: boolean;
  currentStock?: number; // Optional for backward compatibility
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  deliveryNotes?: string;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  createAccount: boolean;
}

export interface DeliveryData {
  address: string;
  district: string;
  island: 'mahe' | 'praslin' | 'la-digue' | 'other';
  deliveryNotes: string;
  timePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
  paymentMethod: 'cash-on-delivery';
  timePreference?: string;
}