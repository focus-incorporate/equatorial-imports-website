'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReceiptItem {
  id: string;
  productName: string;
  productBrand: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discountAmount: number;
  taxRate: number;
}

interface ReceiptData {
  transaction: {
    id: string;
    transactionNumber: string;
    createdAt: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: string;
    cashReceived: number | null;
    changeGiven: number | null;
    cardAmount: number | null;
    notes: string | null;
    receiptPrinted: boolean;
    status: string;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
    loyaltyPoints: number;
  } | null;
  staff: {
    name: string;
    email: string;
  };
  items: ReceiptItem[];
  store: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    vatNumber: string;
    receiptFooter: string;
    businessHours: string;
    currency: string;
    currencySymbol: string;
  };
}

interface ReceiptProps {
  transactionId: string;
  onClose: () => void;
}

export default function Receipt({ transactionId, onClose }: ReceiptProps) {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Fetch receipt data
  const fetchReceiptData = async () => {
    try {
      const response = await fetch(`/api/admin/pos/receipt/${transactionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch receipt data');
      }
      const data = await response.json();
      setReceiptData(data);
    } catch (error) {
      console.error('Failed to fetch receipt:', error);
      toast.error('Failed to load receipt');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark receipt as printed
  const markAsPrinted = async () => {
    try {
      const response = await fetch(`/api/admin/pos/receipt/${transactionId}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to mark as printed');
      }
      if (receiptData) {
        setReceiptData({
          ...receiptData,
          transaction: {
            ...receiptData.transaction,
            receiptPrinted: true,
          }
        });
      }
    } catch (error) {
      console.error('Failed to mark as printed:', error);
    }
  };

  // Print receipt
  const handlePrint = async () => {
    if (!receiptData) return;

    setIsPrinting(true);
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked');
      }

      const receiptHtml = generateReceiptHTML(receiptData);
      printWindow.document.write(receiptHtml);
      printWindow.document.close();

      // Print and close
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);

      // Mark as printed
      await markAsPrinted();
      toast.success('Receipt sent to printer');

    } catch (error) {
      console.error('Print failed:', error);
      toast.error('Failed to print receipt');
    } finally {
      setIsPrinting(false);
    }
  };

  // Download receipt as PDF (simplified version - just save as HTML)
  const handleDownload = () => {
    if (!receiptData) return;

    const receiptHtml = generateReceiptHTML(receiptData);
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.transaction.transactionNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  // Generate HTML for printing
  const generateReceiptHTML = (data: ReceiptData) => {
    const formatCurrency = (amount: number) => `${data.store.currencySymbol}${amount.toFixed(2)}`;
    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-SC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt ${data.transaction.transactionNumber}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
            background: white;
            color: black;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .store-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .receipt-info {
            margin: 10px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        .items {
            margin: 10px 0;
        }
        .item {
            margin-bottom: 5px;
        }
        .item-line {
            display: flex;
            justify-content: space-between;
        }
        .totals {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
        }
        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        .grand-total {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 5px 0;
            font-weight: bold;
            font-size: 14px;
        }
        .payment-info {
            margin: 10px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 10px;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="store-name">${data.store.name}</div>
        <div>${data.store.address}</div>
        <div>Tel: ${data.store.phone}</div>
        <div>Email: ${data.store.email}</div>
        ${data.store.vatNumber ? `<div>VAT: ${data.store.vatNumber}</div>` : ''}
    </div>

    <div class="receipt-info">
        <div><strong>Receipt #${data.transaction.transactionNumber}</strong></div>
        <div>Date: ${formatDateTime(data.transaction.createdAt)}</div>
        <div>Cashier: ${data.staff.name}</div>
        ${data.customer ? `<div>Customer: ${data.customer.name}</div>` : '<div>Customer: Walk-in</div>'}
        ${data.customer?.phone ? `<div>Phone: ${data.customer.phone}</div>` : ''}
    </div>

    <div class="items">
        ${data.items.map(item => `
            <div class="item">
                <div>${item.productName}</div>
                <div class="item-line">
                    <span>${item.quantity} x ${formatCurrency(item.unitPrice)}</span>
                    <span>${formatCurrency(item.lineTotal)}</span>
                </div>
                ${item.discountAmount > 0 ? `<div class="item-line"><span>Discount</span><span>-${formatCurrency(item.discountAmount)}</span></div>` : ''}
            </div>
        `).join('')}
    </div>

    <div class="totals">
        <div class="total-line">
            <span>Subtotal:</span>
            <span>${formatCurrency(data.transaction.subtotal)}</span>
        </div>
        ${data.transaction.discountAmount > 0 ? `
            <div class="total-line">
                <span>Discount:</span>
                <span>-${formatCurrency(data.transaction.discountAmount)}</span>
            </div>
        ` : ''}
        <div class="total-line">
            <span>Tax (15%):</span>
            <span>${formatCurrency(data.transaction.taxAmount)}</span>
        </div>
        <div class="total-line grand-total">
            <span>TOTAL:</span>
            <span>${formatCurrency(data.transaction.totalAmount)}</span>
        </div>
    </div>

    <div class="payment-info">
        <div><strong>Payment Method: ${data.transaction.paymentMethod.toUpperCase()}</strong></div>
        ${data.transaction.cashReceived ? `<div>Cash Received: ${formatCurrency(data.transaction.cashReceived)}</div>` : ''}
        ${data.transaction.changeGiven ? `<div>Change Given: ${formatCurrency(data.transaction.changeGiven)}</div>` : ''}
        ${data.transaction.cardAmount ? `<div>Card Amount: ${formatCurrency(data.transaction.cardAmount)}</div>` : ''}
    </div>

    ${data.customer ? `
        <div style="border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
            <div><strong>Loyalty Points</strong></div>
            <div>Points Earned: ${Math.floor(data.transaction.totalAmount)}</div>
            <div>Total Points: ${data.customer.loyaltyPoints + Math.floor(data.transaction.totalAmount)}</div>
        </div>
    ` : ''}

    <div class="footer">
        <div>${data.store.receiptFooter}</div>
        <div style="margin-top: 10px;">${data.store.businessHours}</div>
        <div>${data.store.website}</div>
        <div style="margin-top: 10px;">Transaction ID: ${data.transaction.id}</div>
    </div>
</body>
</html>`;
  };

  // Fetch data on mount
  useEffect(() => {
    fetchReceiptData();
  }, [transactionId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600 mx-auto"></div>
          <p className="text-center mt-4 text-coffee-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-coffee-900">Receipt</h2>
            <button onClick={onClose} className="text-coffee-500 hover:text-coffee-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-center text-coffee-600">Receipt not found</p>
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `${receiptData.store.currencySymbol}${amount.toFixed(2)}`;
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-SC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-coffee-900">Receipt</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg"
              title="Download Receipt"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg disabled:opacity-50"
              title="Print Receipt"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="text-coffee-500 hover:text-coffee-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div ref={receiptRef} className="p-6 font-mono text-sm bg-white">
            {/* Store Header */}
            <div className="text-center border-b-2 border-coffee-900 pb-4 mb-4">
              <h1 className="text-lg font-bold text-coffee-900">{receiptData.store.name}</h1>
              <p className="text-coffee-700">{receiptData.store.address}</p>
              <p className="text-coffee-700">Tel: {receiptData.store.phone}</p>
              <p className="text-coffee-700">Email: {receiptData.store.email}</p>
              {receiptData.store.vatNumber && (
                <p className="text-coffee-700">VAT: {receiptData.store.vatNumber}</p>
              )}
            </div>

            {/* Transaction Info */}
            <div className="border-b border-dashed border-coffee-400 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="font-bold">Receipt #</span>
                <span>{receiptData.transaction.transactionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDateTime(receiptData.transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{receiptData.staff.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{receiptData.customer?.name || 'Walk-in'}</span>
              </div>
              {receiptData.customer?.phone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{receiptData.customer.phone}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-coffee-400 pb-4 mb-4">
              {receiptData.items.map((item) => (
                <div key={item.id} className="mb-3">
                  <div className="font-medium text-coffee-900">{item.productName}</div>
                  <div className="flex justify-between">
                    <span>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                    <span>{formatCurrency(item.lineTotal)}</span>
                  </div>
                  {item.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(item.discountAmount)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-b border-dashed border-coffee-400 pb-4 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(receiptData.transaction.subtotal)}</span>
              </div>
              {receiptData.transaction.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(receiptData.transaction.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (15%):</span>
                <span>{formatCurrency(receiptData.transaction.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-coffee-900 pt-2 mt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(receiptData.transaction.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-b border-dashed border-coffee-400 pb-4 mb-4">
              <div className="font-bold">Payment Method: {receiptData.transaction.paymentMethod.toUpperCase()}</div>
              {receiptData.transaction.cashReceived && (
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span>{formatCurrency(receiptData.transaction.cashReceived)}</span>
                </div>
              )}
              {receiptData.transaction.changeGiven && (
                <div className="flex justify-between">
                  <span>Change Given:</span>
                  <span>{formatCurrency(receiptData.transaction.changeGiven)}</span>
                </div>
              )}
              {receiptData.transaction.cardAmount && (
                <div className="flex justify-between">
                  <span>Card Amount:</span>
                  <span>{formatCurrency(receiptData.transaction.cardAmount)}</span>
                </div>
              )}
            </div>

            {/* Loyalty Points */}
            {receiptData.customer && (
              <div className="border-b border-dashed border-coffee-400 pb-4 mb-4">
                <div className="font-bold">Loyalty Points</div>
                <div className="flex justify-between">
                  <span>Points Earned:</span>
                  <span>{Math.floor(receiptData.transaction.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Points:</span>
                  <span>{receiptData.customer.loyaltyPoints + Math.floor(receiptData.transaction.totalAmount)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-coffee-600">
              <p className="font-medium">{receiptData.store.receiptFooter}</p>
              <p className="mt-2 text-xs">{receiptData.store.businessHours}</p>
              <p className="text-xs">{receiptData.store.website}</p>
              <p className="mt-2 text-xs">Transaction ID: {receiptData.transaction.id}</p>
              {receiptData.transaction.receiptPrinted && (
                <p className="mt-1 text-xs text-green-600">✓ Receipt Printed</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cream-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-50"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? 'Printing...' : 'Print'}
          </button>
        </div>
      </div>
    </div>
  );
}