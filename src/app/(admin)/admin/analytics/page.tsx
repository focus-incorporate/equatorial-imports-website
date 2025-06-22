'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
    daily: Array<{ date: string; amount: number }>;
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down';
    byStatus: Array<{ status: string; count: number }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    topCustomers: Array<{ name: string; orders: number; spent: number }>;
  };
  products: {
    topSelling: Array<{ name: string; sold: number; revenue: number }>;
    lowStock: number;
    outOfStock: number;
    categories: Array<{ category: string; revenue: number; percentage: number }>;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = async (showRefreshToast = false) => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
      
      if (showRefreshToast) {
        toast.success('Analytics updated');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, fetchAnalytics]);

  // Manual refresh
  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  // Export data
  const exportData = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?range=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Analytics exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  };

  // Loading skeleton
  const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-cream-200 rounded w-24"></div>
        <div className="h-4 bg-cream-200 rounded w-12"></div>
      </div>
      <div className="h-8 bg-cream-200 rounded w-32 mb-2"></div>
      <div className="h-3 bg-cream-200 rounded w-20"></div>
    </div>
  );

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-coffee-900">Analytics & Reports</h1>
            <p className="text-coffee-600">Business insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 border border-coffee-600 text-coffee-600 rounded-lg hover:bg-coffee-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : analytics ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-coffee-600">Total Revenue</h3>
                  <DollarSign className="h-5 w-5 text-coffee-600" />
                </div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-coffee-900">₨{analytics.revenue.total.toFixed(2)}</p>
                  <div className={`ml-2 flex items-center text-sm ${
                    analytics.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analytics.revenue.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(analytics.revenue.change).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-coffee-600">Total Orders</h3>
                  <ShoppingCart className="h-5 w-5 text-coffee-600" />
                </div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-coffee-900">{analytics.orders.total}</p>
                  <div className={`ml-2 flex items-center text-sm ${
                    analytics.orders.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analytics.orders.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(analytics.orders.change).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-coffee-600">Total Customers</h3>
                  <Users className="h-5 w-5 text-coffee-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-coffee-900">{analytics.customers.total}</p>
                  <p className="text-sm text-coffee-600">
                    {analytics.customers.new} new, {analytics.customers.returning} returning
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-coffee-600">Inventory Alerts</h3>
                  <Package className="h-5 w-5 text-coffee-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-coffee-900">
                    {analytics.products.lowStock + analytics.products.outOfStock}
                  </p>
                  <p className="text-sm text-coffee-600">
                    {analytics.products.lowStock} low, {analytics.products.outOfStock} out
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-coffee-900">Revenue Trend</h3>
              <BarChart3 className="h-5 w-5 text-coffee-600" />
            </div>
            {isLoading ? (
              <div className="h-64 bg-cream-100 rounded-lg animate-pulse"></div>
            ) : analytics ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics.revenue.daily.slice(-7).map((day, index) => {
                  const maxAmount = Math.max(...analytics.revenue.daily.map(d => d.amount));
                  const height = (day.amount / maxAmount) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-coffee-600 rounded-t-sm transition-all duration-300 hover:bg-coffee-700"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`₨${day.amount.toFixed(2)}`}
                      ></div>
                      <p className="text-xs text-coffee-600 mt-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-coffee-900">Order Status</h3>
              <ShoppingCart className="h-5 w-5 text-coffee-600" />
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-cream-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-cream-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : analytics ? (
              <div className="space-y-4">
                {analytics.orders.byStatus.map((status, index) => {
                  const percentage = (status.count / analytics.orders.total) * 100;
                  const statusColors = {
                    pending: 'bg-yellow-500',
                    confirmed: 'bg-blue-500',
                    delivered: 'bg-green-500',
                    cancelled: 'bg-red-500',
                  };
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-coffee-900 capitalize">{status.status}</span>
                        <span className="text-coffee-600">{status.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-cream-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusColors[status.status as keyof typeof statusColors] || 'bg-gray-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <h3 className="text-lg font-semibold text-coffee-900 mb-6">Top Selling Products</h3>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex justify-between py-3">
                    <div className="h-4 bg-cream-200 rounded w-32"></div>
                    <div className="h-4 bg-cream-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : analytics ? (
              <div className="space-y-4">
                {analytics.products.topSelling.map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-cream-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-coffee-900">{product.name}</p>
                      <p className="text-sm text-coffee-600">{product.sold} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-coffee-900">₨{product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Top Customers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <h3 className="text-lg font-semibold text-coffee-900 mb-6">Top Customers</h3>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex justify-between py-3">
                    <div className="h-4 bg-cream-200 rounded w-32"></div>
                    <div className="h-4 bg-cream-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : analytics ? (
              <div className="space-y-4">
                {analytics.customers.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-cream-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-coffee-900">{customer.name}</p>
                      <p className="text-sm text-coffee-600">{customer.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-coffee-900">₨{customer.spent.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Category Performance */}
        {analytics && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <h3 className="text-lg font-semibold text-coffee-900 mb-6">Category Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.products.categories.map((category, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-coffee-100 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-coffee-600" />
                  </div>
                  <h4 className="font-medium text-coffee-900 capitalize">{category.category}</h4>
                  <p className="text-2xl font-semibold text-coffee-900">₨{category.revenue.toFixed(2)}</p>
                  <p className="text-sm text-coffee-600">{category.percentage.toFixed(1)}% of total</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}