'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { 
  Search, 
  Filter, 
  Download, 
  FileText,
  Eye,
  Calendar,
  Users,
  ShoppingCart,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  Store
} from 'lucide-react';
import Link from 'next/link';

interface InvoiceItem {
  id: string;
  orderNumber?: string;
  transactionNumber?: string;
  type: 'order' | 'pos';
  customerName: string;
  customerEmail?: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  itemCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
  });

  // Fetch invoices (combining orders and POS transactions)
  const fetchInvoices = async (page = 1) => {
    try {
      setIsLoading(true);
      
      // Fetch orders and POS transactions in parallel
      const [ordersResponse, posResponse] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/pos/transactions?limit=1000') // Get all POS transactions
      ]);

      const ordersData = await ordersResponse.json();
      const posData = await posResponse.json();

      // Combine and format as invoices
      const orderInvoices: InvoiceItem[] = (ordersData.orders || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.id,
        type: 'order' as const,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.items?.length || 0,
      }));

      const posInvoices: InvoiceItem[] = (posData.transactions || []).map((transaction: any) => ({
        id: transaction.id,
        transactionNumber: transaction.transactionNumber,
        type: 'pos' as const,
        customerName: transaction.customer?.name || 'Walk-in Customer',
        customerEmail: transaction.customer?.email,
        total: transaction.totalAmount,
        paymentMethod: transaction.paymentMethod,
        paymentStatus: transaction.status === 'completed' ? 'paid' : 'pending',
        status: transaction.status,
        createdAt: transaction.createdAt,
        itemCount: transaction.itemCount,
      }));

      // Combine and sort by date
      let allInvoices = [...orderInvoices, ...posInvoices];
      allInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        allInvoices = allInvoices.filter(invoice =>
          invoice.customerName.toLowerCase().includes(searchLower) ||
          invoice.customerEmail?.toLowerCase().includes(searchLower) ||
          invoice.orderNumber?.toLowerCase().includes(searchLower) ||
          invoice.transactionNumber?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.type) {
        allInvoices = allInvoices.filter(invoice => invoice.type === filters.type);
      }

      if (filters.status) {
        allInvoices = allInvoices.filter(invoice => invoice.status === filters.status);
      }

      if (filters.paymentStatus) {
        allInvoices = allInvoices.filter(invoice => invoice.paymentStatus === filters.paymentStatus);
      }

      if (filters.dateFrom) {
        allInvoices = allInvoices.filter(invoice => 
          new Date(invoice.createdAt) >= new Date(filters.dateFrom)
        );
      }

      if (filters.dateTo) {
        allInvoices = allInvoices.filter(invoice => 
          new Date(invoice.createdAt) <= new Date(filters.dateTo + 'T23:59:59.999Z')
        );
      }

      // Paginate
      const totalCount = allInvoices.length;
      const totalPages = Math.ceil(totalCount / pagination.limit);
      const start = (page - 1) * pagination.limit;
      const paginatedInvoices = allInvoices.slice(start, start + pagination.limit);

      setInvoices(paginatedInvoices);
      setPagination({
        page,
        limit: pagination.limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      });

    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, [filters]);

  const formatCurrency = (amount: number) => `₨${amount.toFixed(2)}`;
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeIcon = (type: string) => {
    return type === 'order' ? <ShoppingCart className="h-4 w-4" /> : <Store className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
      case 'refunded':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchInvoices(newPage);
  };

  return (
    <AdminLayout title="Invoices">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-coffee-600">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-1 hover:text-coffee-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-coffee-900 font-medium">Invoices</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-coffee-900">Invoices</h1>
              <p className="text-coffee-600 mt-1">View and manage all invoices from orders and POS transactions</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700">
            <Download className="h-4 w-4" />
            Export All
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                <input
                  type="text"
                  placeholder="Search invoices, customers..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="order">Online Orders</option>
                <option value="pos">POS Transactions</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                Payment
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200">
          <div className="p-6 border-b border-cream-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-coffee-900">
                All Invoices ({pagination.totalCount})
              </h2>
              <div className="flex items-center text-sm text-coffee-600">
                <Clock className="h-4 w-4 mr-1" />
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                      <div className="w-10 h-10 bg-cream-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-cream-200 rounded w-3/4"></div>
                        <div className="h-3 bg-cream-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-cream-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-coffee-900 mb-2">No Invoices Found</h3>
                <p className="text-coffee-600">No invoices match your current filters.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-coffee-25 border-b border-cream-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Invoice</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Customer</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Type</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Amount</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Payment</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {invoices.map((invoice) => (
                    <tr key={`${invoice.type}-${invoice.id}`} className="hover:bg-coffee-25">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-coffee-900">
                            {invoice.type === 'order' ? `Order #${invoice.orderNumber}` : invoice.transactionNumber}
                          </div>
                          <div className="text-sm text-coffee-600">
                            {formatDateTime(invoice.createdAt)}
                          </div>
                          <div className="text-xs text-coffee-500">
                            {invoice.itemCount} item{invoice.itemCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-coffee-400" />
                          <div>
                            <div className="font-medium text-coffee-900">
                              {invoice.customerName}
                            </div>
                            {invoice.customerEmail && (
                              <div className="text-sm text-coffee-600">
                                {invoice.customerEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(invoice.type)}
                          <span className="capitalize font-medium text-coffee-900">
                            {invoice.type === 'order' ? 'Online Order' : 'POS Sale'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-coffee-900">
                          {formatCurrency(invoice.total)}
                        </div>
                        <div className="text-sm text-coffee-600 capitalize">
                          {invoice.paymentMethod.replace('-', ' ')}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          href={`/admin/invoice/${invoice.id}`}
                          className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="View Invoice"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-cream-200">
              <div className="text-sm text-coffee-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} invoices
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-coffee-900">
                  {pagination.page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}