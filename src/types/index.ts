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

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: Date;
  paymentMethod: 'cash-on-delivery';
}