'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Receipt as ReceiptIcon, Clock, CheckCircle, Users, RotateCcw } from 'lucide-react';
import Receipt from '../pos/Receipt';
import RefundModal from '../pos/RefundModal';

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
  totalAmount: number;
  paymentMethod: string;
  status: string;
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

interface POSTransactionsProps {
  limit?: number;
  showTitle?: boolean;
}

export default function POSTransactions({ limit = 5, showTitle = true }: POSTransactionsProps) {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransactionForRefund, setSelectedTransactionForRefund] = useState<POSTransaction | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Fetch POS transactions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/pos/transactions?limit=${limit}&page=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch POS transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  const formatCurrency = (amount: number) => `₨${amount.toFixed(2)}`;
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-SC', {
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
        return 'text-green-600 bg-green-50';
      case 'refunded':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
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
    fetchTransactions();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-cream-200">
        {showTitle && (
          <div className="p-6 border-b border-cream-200">
            <h2 className="text-lg font-semibold text-coffee-900">Recent POS Transactions</h2>
          </div>
        )}
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cream-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-cream-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-cream-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-cream-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-cream-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-cream-200">
        {showTitle && (
          <div className="p-6 border-b border-cream-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-coffee-900">Recent POS Transactions</h2>
              <div className="flex items-center text-sm text-coffee-600">
                <Clock className="h-4 w-4 mr-1" />
                Last {limit} transactions
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <ReceiptIcon className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-coffee-900 mb-2">No POS Transactions</h3>
              <p className="text-coffee-600">POS transactions will appear here once sales are made.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-cream-200 rounded-lg hover:bg-coffee-25 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Payment Method Icon */}
                    <div className="w-10 h-10 bg-coffee-100 rounded-lg flex items-center justify-center text-coffee-600">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-coffee-900">
                          {transaction.transactionNumber}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                        {transaction.receiptPrinted && (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-coffee-600">
                        <span>{formatDateTime(transaction.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {transaction.customer?.name || 'Walk-in'}
                        </span>
                        <span>{transaction.itemCount} item{transaction.itemCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="text-right">
                      <div className="font-bold text-coffee-900 text-lg">
                        {formatCurrency(transaction.totalAmount)}
                      </div>
                      <div className="text-sm text-coffee-600 capitalize">
                        {transaction.paymentMethod}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
    </>
  );
}