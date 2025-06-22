'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Download, Printer, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface InvoiceData {
  id: string;
  orderNumber: string;
  transactionNumber?: string;
  type: 'order' | 'pos';
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  deliveryFee?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoice data
  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/invoice/${invoiceId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Invoice not found');
          return;
        }
        throw new Error('Failed to fetch invoice');
      }

      const data = await response.json();
      setInvoice(data.invoice);
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF (basic implementation)
  const handleDownload = () => {
    handlePrint(); // Browser will show print dialog with PDF option
    toast.success('Use your browser\'s print dialog to save as PDF');
  };

  if (isLoading) {
    return (
      <AdminLayout title="Invoice">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
            <p className="text-coffee-600">Loading invoice...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AdminLayout title="Invoice">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-coffee-900 mb-2">
              {error || 'Invoice Not Found'}
            </h2>
            <p className="text-coffee-600 mb-6">
              The invoice you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Invoice ${invoice.id}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href="/admin/orders"
            className="flex items-center text-coffee-600 hover:text-coffee-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-cream-200 text-coffee-900 rounded-lg hover:bg-cream-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-cream-200 print:shadow-none print:border-none">
          {/* Company Header */}
          <div className="border-b border-cream-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-coffee-900 mb-2">Equatorial Imports</h1>
                <p className="text-coffee-600">Premium Coffee & Beverages</p>
                <p className="text-sm text-coffee-600">Seychelles</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold text-coffee-900">INVOICE</h2>
                <p className="text-coffee-600">#{invoice.id}</p>
                {invoice.type === 'order' && (
                  <p className="text-sm text-coffee-600">Order: {invoice.orderNumber}</p>
                )}
                {invoice.type === 'pos' && invoice.transactionNumber && (
                  <p className="text-sm text-coffee-600">Transaction: {invoice.transactionNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-coffee-900 mb-3">Bill To:</h3>
              <div className="text-coffee-700">
                <p className="font-medium">{invoice.customerName}</p>
                {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
                {invoice.deliveryAddress && <p className="mt-2">{invoice.deliveryAddress}</p>}
              </div>
            </div>

            {/* Invoice Info */}
            <div>
              <h3 className="font-semibold text-coffee-900 mb-3">Invoice Details:</h3>
              <div className="text-coffee-700 space-y-1">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="capitalize">{invoice.paymentMethod.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${{
                    pending: 'bg-yellow-100 text-yellow-800',
                    confirmed: 'bg-blue-100 text-blue-800',
                    completed: 'bg-green-100 text-green-800',
                    delivered: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800',
                  }[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold text-coffee-900 mb-3">Items:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-cream-200">
                <thead className="bg-cream-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-coffee-900">Item</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-coffee-900">Qty</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-coffee-900">Unit Price</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-coffee-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-coffee-900">{item.productName}</td>
                      <td className="px-4 py-3 text-center text-coffee-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-coffee-700">₨{item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-coffee-900 font-medium">₨{item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-coffee-700">Subtotal:</span>
                  <span className="text-coffee-900">₨{invoice.subtotal.toFixed(2)}</span>
                </div>
                
                {invoice.deliveryFee && invoice.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-coffee-700">Delivery Fee:</span>
                    <span className="text-coffee-900">₨{invoice.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-coffee-700">Tax (15%):</span>
                    <span className="text-coffee-900">₨{invoice.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {invoice.discountAmount && invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₨{invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-cream-200 pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-coffee-900">Total:</span>
                    <span className="text-coffee-900">₨{invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-cream-200 text-center text-sm text-coffee-600">
            <p>Thank you for your business!</p>
            <p className="mt-2">For any questions about this invoice, please contact us.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1in;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border-none {
            border: none !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </AdminLayout>
  );
}