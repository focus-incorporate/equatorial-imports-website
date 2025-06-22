'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { BarChart3, ShoppingCart, Users, Package, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import POSTransactions from '@/components/admin/dashboard/POSTransactions';

// Types for API responses
interface DashboardStats {
  todayRevenue: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
  };
  totalOrders: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
  };
  activeCustomers: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
  };
  lowStockItems: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
  };
}

interface RecentOrder {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  paymentStatus: string;
  timeAgo: string;
}

interface TopProduct {
  id: string;
  name: string;
  brand: string;
  sales: number;
  revenue: number;
  progressPercent: number;
}

// Loading skeleton component
function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200 animate-pulse">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-coffee-100 rounded-lg"></div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-cream-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-cream-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat, icon: Icon }: { 
  stat: { name: string; value: string; change: string; changeType: 'positive' | 'negative' };
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200" data-testid="stats-card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-coffee-600" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-coffee-600">{stat.name}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-coffee-900">{stat.value}</p>
            <p className={`ml-2 text-sm font-medium ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      setIsRefreshing(true);
      
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/recent-orders'),
        fetch('/api/admin/dashboard/top-products'),
      ]);

      if (!statsRes.ok || !ordersRes.ok || !productsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, ordersData, productsData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        productsRes.json(),
      ]);

      setStats(statsData);
      setRecentOrders(ordersData.orders || []);
      setTopProducts(productsData.products || []);
      
      if (showRefreshToast) {
        toast.success('Dashboard updated');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const statsConfig = [
    { name: "Today's Revenue", key: 'todayRevenue', icon: DollarSign },
    { name: 'Total Orders', key: 'totalOrders', icon: ShoppingCart },
    { name: 'Active Customers', key: 'activeCustomers', icon: Users },
    { name: 'Low Stock Items', key: 'lowStockItems', icon: Package },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-900">Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((config, index) => (
            <div key={index}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : stats ? (
                <StatCard 
                  stat={{
                    name: config.name,
                    value: stats[config.key as keyof DashboardStats].value,
                    change: stats[config.key as keyof DashboardStats].change,
                    changeType: stats[config.key as keyof DashboardStats].changeType,
                  }}
                  icon={config.icon}
                />
              ) : null}
            </div>
          ))}
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-coffee-900">Recent Orders</h3>
              <button className="text-coffee-600 hover:text-coffee-800 text-sm font-medium">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse flex justify-between py-3">
                      <div>
                        <div className="h-4 bg-cream-200 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-cream-200 rounded w-24"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-cream-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-cream-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-cream-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-coffee-900">{order.id}</p>
                      <p className="text-sm text-coffee-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-coffee-900">₨{order.total.toFixed(2)}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-coffee-500">{order.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-coffee-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-coffee-900">Top Products</h3>
              <TrendingUp className="h-5 w-5 text-coffee-600" />
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse flex justify-between">
                      <div>
                        <div className="h-4 bg-cream-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-cream-200 rounded w-20"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-cream-200 rounded w-20 mb-2"></div>
                        <div className="w-20 bg-cream-200 rounded-full h-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-coffee-900">{product.name}</p>
                      <p className="text-sm text-coffee-600">{product.sales} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-coffee-900">₨{product.revenue.toFixed(2)}</p>
                      <div className="w-20 bg-cream-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-coffee-600 h-2 rounded-full" 
                          style={{ width: `${product.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-coffee-500 text-center py-4">No product data available</p>
              )}
            </div>
          </div>
        </div>

        {/* POS Transactions */}
        <POSTransactions limit={5} showTitle={true} />

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
          <h3 className="text-lg font-semibold text-coffee-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/pos'}
              className="flex items-center p-4 bg-coffee-50 rounded-lg hover:bg-coffee-100 transition-colors"
            >
              <ShoppingCart className="h-8 w-8 text-coffee-600 mr-3" />
              <span className="font-medium text-coffee-900">New POS Sale</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/products'}
              className="flex items-center p-4 bg-coffee-50 rounded-lg hover:bg-coffee-100 transition-colors"
            >
              <Package className="h-8 w-8 text-coffee-600 mr-3" />
              <span className="font-medium text-coffee-900">Add Product</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/customers'}
              className="flex items-center p-4 bg-coffee-50 rounded-lg hover:bg-coffee-100 transition-colors"
            >
              <Users className="h-8 w-8 text-coffee-600 mr-3" />
              <span className="font-medium text-coffee-900">Add Customer</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/analytics'}
              className="flex items-center p-4 bg-coffee-50 rounded-lg hover:bg-coffee-100 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-coffee-600 mr-3" />
              <span className="font-medium text-coffee-900">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}