'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { ShoppingCart, Search, Eye, Edit, Truck, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      on_the_way: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      partially_paid: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders
      fetchOrders();
      toast.success('Order status updated');
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order status');
    }
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-coffee-900">Orders</h1>
            <p className="text-coffee-600">Manage customer orders and delivery status</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700">
              <Truck className="h-4 w-4 mr-2" />
              Bulk Actions
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="on_the_way">On the Way</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select 
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border-b border-cream-100">
                    <div className="flex-1">
                      <div className="h-4 bg-cream-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-cream-200 rounded w-1/4"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-cream-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-cream-200 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-coffee-50 border-b border-cream-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Order ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Payment</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-coffee-900">Date</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-coffee-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-coffee-25">
                      <td className="px-6 py-4">
                        <div className="font-medium text-coffee-900">{order.id}</div>
                        <div className="text-sm text-coffee-600">{order.itemCount} items</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-coffee-900">{order.customerName}</div>
                        <div className="text-sm text-coffee-600">{order.customerEmail}</div>
                        <div className="text-sm text-coffee-600">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-coffee-900">₨{order.total.toFixed(2)}</span>
                        <div className="text-sm text-coffee-600 capitalize">{order.paymentMethod.replace('-', ' ')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-3 py-1 border focus:ring-2 focus:ring-coffee-600 ${getStatusBadge(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="on_the_way">On the Way</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-coffee-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-coffee-600">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            title="View Details"
                            className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            title="View Invoice"
                            onClick={() => window.open(`/admin/invoice/${order.id}`, '_blank')}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button 
                            title="Edit Order"
                            className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-coffee-900 mb-2">No orders found</h3>
              <p className="text-coffee-600">
                {searchTerm || statusFilter || paymentFilter 
                  ? 'Try adjusting your search criteria' 
                  : 'Orders will appear here when customers place them'}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!isLoading && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-coffee-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Total Orders</p>
                  <p className="text-xl font-semibold text-coffee-900">{orders.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Pending</p>
                  <p className="text-xl font-semibold text-coffee-900">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Delivered</p>
                  <p className="text-xl font-semibold text-coffee-900">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-200">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-coffee-600 mr-3" />
                <div>
                  <p className="text-sm text-coffee-600">Revenue</p>
                  <p className="text-xl font-semibold text-coffee-900">
                    ₨{orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}