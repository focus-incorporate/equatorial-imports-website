'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Warehouse,
  FileText,
  Settings,
  Home,
  LogOut,
  Store,
  Receipt
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'POS System', href: '/admin/pos', icon: Store },
  { name: 'POS Transactions', href: '/admin/pos-transactions', icon: Receipt },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-coffee-900 text-white h-screen">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 bg-coffee-800">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-coffee-200" />
          <span className="ml-2 text-lg font-semibold">Equatorial Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-coffee-700 text-white'
                  : 'text-coffee-200 hover:bg-coffee-800 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-4 py-4 border-t border-coffee-700">
        <div className="flex items-center px-3 py-2">
          <div className="w-8 h-8 bg-coffee-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-coffee-300">admin@equatorial.sc</p>
          </div>
        </div>
        <button className="flex items-center w-full px-3 py-2 mt-2 text-sm text-coffee-200 hover:bg-coffee-800 hover:text-white rounded-lg transition-colors">
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}