'use client';

import React, { useState } from 'react';
import { X, DollarSign, AlertTriangle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface RefundModalProps {
  transaction: {
    id: string;
    transactionNumber: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    items: Array<{
      id: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  };
  onClose: () => void;
  onRefundProcessed: () => void;
}

export default function RefundModal({ transaction, onClose, onRefundProcessed }: RefundModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState<string>(transaction.totalAmount.toString());
  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ itemId: string; quantity: number }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount: number) => `₨${amount.toFixed(2)}`;

  const handleRefundTypeChange = (type: 'full' | 'partial') => {
    setRefundType(type);
    if (type === 'full') {
      setRefundAmount(transaction.totalAmount.toString());
      setSelectedItems(transaction.items.map(item => ({ 
        itemId: item.id, 
        quantity: item.quantity 
      })));
    } else {
      setRefundAmount('');
      setSelectedItems([]);
    }
  };

  const handleItemSelection = (itemId: string, quantity: number) => {
    const item = transaction.items.find(i => i.id === itemId);
    if (!item) return;

    setSelectedItems(prev => {
      const existing = prev.find(si => si.itemId === itemId);
      if (existing) {
        if (quantity === 0) {
          return prev.filter(si => si.itemId !== itemId);
        }
        return prev.map(si => si.itemId === itemId ? { ...si, quantity } : si);
      } else if (quantity > 0) {
        return [...prev, { itemId, quantity }];
      }
      return prev;
    });

    // Calculate partial refund amount
    if (refundType === 'partial') {
      const newSelectedItems = selectedItems.map(si => 
        si.itemId === itemId ? { ...si, quantity } : si
      ).filter(si => si.quantity > 0);
      
      if (quantity > 0 && !selectedItems.find(si => si.itemId === itemId)) {
        newSelectedItems.push({ itemId, quantity });
      }

      const totalRefundAmount = newSelectedItems.reduce((sum, si) => {
        const item = transaction.items.find(i => i.id === si.itemId);
        return sum + (item ? item.unitPrice * si.quantity : 0);
      }, 0);

      setRefundAmount(totalRefundAmount.toFixed(2));
    }
  };

  const processRefund = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (amount > transaction.totalAmount) {
      toast.error('Refund amount cannot exceed original transaction amount');
      return;
    }

    if (refundType === 'partial' && selectedItems.length === 0) {
      toast.error('Please select items to refund for partial refund');
      return;
    }

    setIsProcessing(true);

    try {
      const refundData = {
        amount,
        reason: reason.trim(),
        refundType,
        ...(refundType === 'partial' && { items: selectedItems }),
      };

      const response = await fetch(`/api/admin/pos/refund/${transaction.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }

      const result = await response.json();
      
      toast.success(`Refund processed successfully! Refund #${result.refund.transactionNumber}`);
      onRefundProcessed();
      onClose();

    } catch (error) {
      console.error('Refund failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  if (transaction.status === 'refunded') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-coffee-900 mb-2">Already Refunded</h2>
            <p className="text-coffee-600 mb-4">
              This transaction has already been fully refunded.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-cream-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-6 w-6 text-coffee-600" />
              <div>
                <h2 className="text-xl font-semibold text-coffee-900">Process Refund</h2>
                <p className="text-coffee-600">Transaction #{transaction.transactionNumber}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-coffee-500 hover:text-coffee-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="p-6 space-y-6">
            {/* Transaction Info */}
            <div className="bg-coffee-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-coffee-900">Original Amount:</span>
                <span className="text-lg font-bold text-coffee-900">
                  {formatCurrency(transaction.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-coffee-600">Payment Method:</span>
                <span className="capitalize text-coffee-900">{transaction.paymentMethod}</span>
              </div>
            </div>

            {/* Refund Type */}
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-3">
                Refund Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRefundTypeChange('full')}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    refundType === 'full'
                      ? 'border-coffee-600 bg-coffee-50 text-coffee-900'
                      : 'border-cream-300 text-coffee-600 hover:border-coffee-300'
                  }`}
                >
                  <div className="font-medium">Full Refund</div>
                  <div className="text-sm opacity-75">Return all items</div>
                </button>
                <button
                  onClick={() => handleRefundTypeChange('partial')}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    refundType === 'partial'
                      ? 'border-coffee-600 bg-coffee-50 text-coffee-900'
                      : 'border-cream-300 text-coffee-600 hover:border-coffee-300'
                  }`}
                >
                  <div className="font-medium">Partial Refund</div>
                  <div className="text-sm opacity-75">Select specific items</div>
                </button>
              </div>
            </div>

            {/* Items Selection (for partial refund) */}
            {refundType === 'partial' && (
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-3">
                  Select Items to Refund
                </label>
                <div className="space-y-3">
                  {transaction.items.map((item) => {
                    const selectedItem = selectedItems.find(si => si.itemId === item.id);
                    const selectedQuantity = selectedItem?.quantity || 0;

                    return (
                      <div key={item.id} className="border border-cream-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-coffee-900">{item.productName}</div>
                            <div className="text-sm text-coffee-600">
                              {formatCurrency(item.unitPrice)} each × {item.quantity} = {formatCurrency(item.lineTotal)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-coffee-600">Quantity to refund:</label>
                          <select
                            value={selectedQuantity}
                            onChange={(e) => handleItemSelection(item.id, parseInt(e.target.value))}
                            className="px-3 py-1 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                          >
                            {[...Array(item.quantity + 1)].map((_, i) => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                          {selectedQuantity > 0 && (
                            <span className="text-sm text-coffee-600">
                              = {formatCurrency(item.unitPrice * selectedQuantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Refund Amount */}
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                Refund Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={transaction.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  disabled={refundType === 'full'}
                  className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent disabled:bg-gray-50"
                  placeholder="0.00"
                />
              </div>
              <div className="text-xs text-coffee-500 mt-1">
                Maximum: {formatCurrency(transaction.totalAmount)}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                Reason for Refund *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-600 focus:border-transparent"
                placeholder="Please provide a reason for the refund..."
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">Important Notice</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    • This action cannot be undone
                    • Inventory will be restored for refunded items
                    • Customer loyalty points will be deducted
                    • A refund receipt will be generated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-cream-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-50"
          >
            Cancel
          </button>
          <button
            onClick={processRefund}
            disabled={isProcessing || !reason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Process Refund'}
          </button>
        </div>
      </div>
    </div>
  );
}