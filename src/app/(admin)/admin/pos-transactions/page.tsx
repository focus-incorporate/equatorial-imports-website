'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  CreditCard,
  DollarSign,
  Receipt as ReceiptIcon,
  Users,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowLeft,
  Home
} from 'lucide-react';
import Receipt from '@/components/admin/pos/Receipt';
import RefundModal from '@/components/admin/pos/RefundModal';
import Link from 'next/link';

interface POSTransaction {
  id: string;
  transactionNumber: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  staff: {
    id: string;
    name: string;
    email: string;
  };
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  cashReceived: number | null;
  changeGiven: number | null;
  cardAmount: number | null;
  status: string;
  notes: string | null;
  receiptPrinted: boolean;
  itemCount: number;
  items: Array<{
    id: string;
    productName: string;
    productBrand: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function POSTransactionsPage() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransactionForRefund, setSelectedTransactionForRefund] = useState<POSTransaction | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
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
    status: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
  });

  // Fetch transactions
  const fetchTransactions = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/admin/pos/transactions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      
      // Apply client-side search filter if needed
      let filteredTransactions = data.transactions;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTransactions = data.transactions.filter((transaction: POSTransaction) =>
          transaction.transactionNumber.toLowerCase().includes(searchLower) ||
          transaction.customer?.name.toLowerCase().includes(searchLower) ||
          transaction.staff.name.toLowerCase().includes(searchLower) ||
          transaction.items.some(item => 
            item.productName.toLowerCase().includes(searchLower) ||
            item.productBrand.toLowerCase().includes(searchLower)
          )
        );
      }

      setTransactions(filteredTransactions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch POS transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [filters]);

  const formatCurrency = (amount: number) => `₨${amount.toFixed(2)}`;
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-SC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'refunded':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const handleViewReceipt = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setShowReceipt(true);
  };

  const handleRefund = (transaction: POSTransaction) => {
    setSelectedTransactionForRefund(transaction);
    setShowRefundModal(true);
  };

  const handleRefundProcessed = () => {
    // Refresh the transactions list
    fetchTransactions(pagination.page);
  };

  const handlePageChange = (newPage: number) => {
    fetchTransactions(newPage);
  };

  return (
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
        <span className="text-coffee-900 font-medium">POS Transactions</span>
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
            <h1 className="text-2xl font-bold text-coffee-900">POS Transactions</h1>
            <p className="text-coffee-600 mt-1">Manage and view point of sale transactions</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-coffee-900 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
              <input
                type="text"
                placeholder="Search transactions, customers, products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
              />
            </div>
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
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-coffee-900 mb-2">
              Payment
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Date Range */}
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

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200">
        <div className="p-6 border-b border-cream-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-coffee-900">
              Transactions ({pagination.totalCount})
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
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <ReceiptIcon className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-coffee-900 mb-2">No Transactions Found</h3>
              <p className="text-coffee-600">No POS transactions match your current filters.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-coffee-25 border-b border-cream-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Transaction</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Customer</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Items</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Payment</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Amount</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-coffee-25">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-coffee-900">
                          {transaction.transactionNumber}
                        </div>
                        <div className="text-sm text-coffee-600">
                          {formatDateTime(transaction.createdAt)}
                        </div>
                        <div className="text-xs text-coffee-500">
                          by {transaction.staff.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-coffee-400" />
                        <div>
                          <div className="font-medium text-coffee-900">
                            {transaction.customer?.name || 'Walk-in Customer'}
                          </div>
                          {transaction.customer?.phone && (
                            <div className="text-sm text-coffee-600">
                              {transaction.customer.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-coffee-900">
                          {transaction.itemCount} item{transaction.itemCount !== 1 ? 's' : ''}
                        </div>
                        <div className="text-coffee-600">
                          {transaction.items.slice(0, 2).map(item => item.productName).join(', ')}
                          {transaction.items.length > 2 && '...'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="capitalize font-medium text-coffee-900">
                          {transaction.paymentMethod}
                        </span>
                      </div>
                      {transaction.changeGiven && transaction.changeGiven > 0 && (
                        <div className="text-xs text-coffee-600">
                          Change: {formatCurrency(transaction.changeGiven)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-coffee-900">
                        {formatCurrency(transaction.totalAmount)}
                      </div>
                      <div className="text-sm text-coffee-600">
                        Tax: {formatCurrency(transaction.taxAmount)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                        {transaction.receiptPrinted && (
                          <CheckCircle className="h-4 w-4 text-green-600" title="Receipt Printed" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReceipt(transaction.id)}
                          className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <ReceiptIcon className="h-4 w-4" />
                        </button>
                        {transaction.status === 'completed' && (
                          <button
                            onClick={() => handleRefund(transaction)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                            title="Process Refund"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} transactions
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

      {/* Receipt Modal */}
      {showReceipt && selectedTransactionId && (
        <Receipt
          transactionId={selectedTransactionId}
          onClose={() => {
            setShowReceipt(false);
            setSelectedTransactionId(null);
          }}
        />
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTransactionForRefund && (
        <RefundModal
          transaction={selectedTransactionForRefund}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedTransactionForRefund(null);
          }}
          onRefundProcessed={handleRefundProcessed}
        />
      )}
    </div>
  );
}