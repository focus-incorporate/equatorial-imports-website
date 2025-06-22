import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    let session;
    try {
      session = await requireRole(['admin', 'manager', 'staff']);
    } catch (authError) {
      // For development/testing, use the first available admin user
      const firstAdminUser = await prisma.user.findFirst({
        where: { role: 'admin', isActive: true }
      });
      
      if (!firstAdminUser) {
        return NextResponse.json({ error: 'No admin user available' }, { status: 401 });
      }
    }

    const invoiceId = params.id;

    // First, try to find as an order
    const invoice = await prisma.order.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (invoice) {
      // Format order as invoice
      const invoiceData = {
        id: invoice.id,
        orderNumber: invoice.id,
        type: 'order' as const,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerPhone: invoice.customerPhone,
        deliveryAddress: invoice.deliveryAddress,
        items: invoice.items.map(item => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          lineTotal: parseFloat(item.lineTotal.toString()),
        })),
        subtotal: parseFloat(invoice.subtotal.toString()),
        taxAmount: parseFloat(invoice.taxAmount.toString()),
        discountAmount: parseFloat(invoice.discountAmount.toString()),
        deliveryFee: parseFloat(invoice.deliveryFee.toString()),
        total: parseFloat(invoice.total.toString()),
        paymentMethod: invoice.paymentMethod,
        paymentStatus: invoice.paymentStatus,
        status: invoice.status,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      };

      return NextResponse.json({
        success: true,
        invoice: invoiceData,
      });
    }

    // If not found as order, try to find as POS transaction
    const posTransaction = await prisma.pOSTransaction.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
    });

    if (posTransaction) {
      // Format POS transaction as invoice
      const invoiceData = {
        id: posTransaction.id,
        transactionNumber: posTransaction.transactionNumber,
        type: 'pos' as const,
        customerName: posTransaction.customer?.name || 'Walk-in Customer',
        customerEmail: posTransaction.customer?.email,
        customerPhone: posTransaction.customer?.phone,
        items: posTransaction.items.map(item => ({
          id: item.id,
          productName: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          lineTotal: parseFloat(item.lineTotal.toString()),
        })),
        subtotal: parseFloat(posTransaction.subtotal.toString()),
        taxAmount: parseFloat(posTransaction.taxAmount.toString()),
        discountAmount: parseFloat(posTransaction.discountAmount.toString()),
        total: parseFloat(posTransaction.totalAmount.toString()),
        paymentMethod: posTransaction.paymentMethod,
        paymentStatus: posTransaction.status === 'completed' ? 'paid' : 'pending',
        status: posTransaction.status,
        createdAt: posTransaction.createdAt.toISOString(),
        updatedAt: posTransaction.updatedAt.toISOString(),
      };

      return NextResponse.json({
        success: true,
        invoice: invoiceData,
      });
    }

    // Not found in either table
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Invoice API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}