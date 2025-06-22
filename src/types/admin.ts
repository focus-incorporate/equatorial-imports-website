import { z } from 'zod';

// Admin User Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'manager';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// POS Types
export interface POSProduct {
  id: string;
  name: string;
  brand: string;
  type: string;
  price: number;
  image: string;
  currentStock: number;
  barcode?: string;
  category: string;
  taxRate: number;
  inStock: boolean;
}

export interface POSCartItem {
  product: POSProduct;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discountAmount?: number;
}

export interface POSCart {
  items: POSCartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface POSTransaction {
  id: string;
  transactionNumber: string;
  customerId?: string;
  staffId: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mixed';
  cashReceived?: number;
  changeGiven?: number;
  cardAmount?: number;
  status: 'completed' | 'refunded' | 'cancelled';
  notes?: string;
  receiptPrinted: boolean;
  createdAt: Date;
  items: POSTransactionItem[];
  customer?: Customer;
  staff: AdminUser;
}

export interface POSTransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discountAmount: number;
  product: POSProduct;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  loyaltyPoints: number;
  creditLimit: number;
  customerGroup: string;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'sale' | 'order' | 'proforma' | 'credit_note';
  customerId?: string;
  orderId?: string;
  posTransactionId?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
}

// Inventory Types
export interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'damage';
  quantity: number;
  referenceId?: string;
  referenceType?: string;
  reason?: string;
  performedBy: string;
  cost?: number;
  createdAt: Date;
  product: POSProduct;
  user: AdminUser;
}

// Analytics Types
export interface SalesAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  topProducts: Array<{
    product: POSProduct;
    totalSold: number;
    revenue: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

// Dashboard Stats
export interface DashboardStats {
  todayRevenue: number;
  todayTransactions: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  lowStockItems: number;
  pendingOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
}

// Form Schemas using Zod
export const CustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  customerGroup: z.string().default('regular'),
});

export const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().min(1, 'Brand is required'),
  type: z.enum(['capsules', 'beans']),
  intensity: z.number().min(1).max(12),
  roast: z.enum(['light', 'medium', 'dark']),
  flavorNotes: z.array(z.string()).min(1, 'At least one flavor note is required'),
  price: z.number().min(0, 'Price must be positive'),
  description: z.string().min(1, 'Description is required'),
  weight: z.string().optional(),
  currentStock: z.number().min(0, 'Stock cannot be negative'),
  minStockLevel: z.number().min(0),
  maxStockLevel: z.number().min(0),
  costPrice: z.number().min(0).optional(),
  barcode: z.string().optional(),
  category: z.string().default('general'),
  taxRate: z.number().min(0).max(100),
});

export const POSTransactionSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    discountAmount: z.number().min(0).default(0),
  })).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'mixed']),
  cashReceived: z.number().min(0).optional(),
  cardAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const StockAdjustmentSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  reason: z.string().min(1, 'Reason is required'),
  type: z.enum(['adjustment', 'purchase', 'return', 'damage']),
  cost: z.number().min(0).optional(),
});

export type CustomerFormData = z.infer<typeof CustomerSchema>;
export type ProductFormData = z.infer<typeof ProductSchema>;
export type POSTransactionFormData = z.infer<typeof POSTransactionSchema>;
export type StockAdjustmentFormData = z.infer<typeof StockAdjustmentSchema>;