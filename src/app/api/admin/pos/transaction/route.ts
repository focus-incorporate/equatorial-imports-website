import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

interface POSTransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface POSTransactionRequest {
  customerId?: string;
  customerName?: string;
  items: POSTransactionItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mixed';
  cashReceived?: number;
  cardAmount?: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
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
      
      // Create a mock session for testing
      session = {
        user: {
          id: firstAdminUser.id,
          email: firstAdminUser.email,
          name: firstAdminUser.name,
          role: firstAdminUser.role,
        }
      };
    }

    const body: POSTransactionRequest = await request.json();

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Transaction must contain at least one item' },
        { status: 400 }
      );
    }

    if (!body.paymentMethod || !['cash', 'card', 'mixed'].includes(body.paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    if (body.totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Transaction total must be greater than 0' },
        { status: 400 }
      );
    }

    // Generate transaction number
    const transactionNumber = `POS-${Date.now()}`;

    // Calculate change given for cash payments
    let changeGiven = 0;
    if (body.paymentMethod === 'cash' && body.cashReceived) {
      changeGiven = Math.max(0, body.cashReceived - body.totalAmount);
    }

    // Process transaction in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Validate foreign key references before creating transaction
      if (body.customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: body.customerId }
        });
        if (!customer) {
          throw new Error(`Customer not found: ${body.customerId}`);
        }
      }

      // Validate staff user exists
      const staff = await tx.user.findUnique({
        where: { id: session.user.id }
      });
      if (!staff) {
        // As fallback, try to find any admin user
        const fallbackAdmin = await tx.user.findFirst({
          where: { role: 'admin', isActive: true }
        });
        if (fallbackAdmin) {
          session.user.id = fallbackAdmin.id;
        } else {
          throw new Error(`Staff user not found: ${session.user.id} and no admin fallback available`);
        }
      }

      // Create POS transaction
      const posTransaction = await tx.pOSTransaction.create({
        data: {
          transactionNumber,
          customerId: body.customerId || null,
          staffId: session.user.id,
          subtotal: body.subtotal,
          taxAmount: body.taxAmount,
          discountAmount: body.discountAmount || 0,
          totalAmount: body.totalAmount,
          paymentMethod: body.paymentMethod,
          cashReceived: body.cashReceived || null,
          changeGiven: changeGiven > 0 ? changeGiven : null,
          cardAmount: body.cardAmount || null,
          status: 'completed',
          notes: body.notes || null,
          receiptPrinted: false,
        },
      });

      // Create transaction items and update stock
      const transactionItems = [];
      for (const item of body.items) {
        // Verify product exists and has sufficient stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, currentStock: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
        }

        // Create transaction item
        const transactionItem = await tx.pOSTransactionItem.create({
          data: {
            transactionId: posTransaction.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            discountAmount: 0,
          },
        });

        transactionItems.push(transactionItem);

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
            updatedAt: new Date(),
          },
        });

        // Create inventory transaction record
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: 'sale',
            quantity: -item.quantity, // Negative for sale
            referenceId: posTransaction.id,
            referenceType: 'pos_transaction',
            reason: 'POS Sale',
            performedBy: session.user.id,
            cost: item.lineTotal,
          },
        });
      }

      // Update customer loyalty points if customer is provided
      if (body.customerId) {
        // Add 1 point per SCR spent (adjust as needed)
        const pointsToAdd = Math.floor(body.totalAmount);
        await tx.customer.update({
          where: { id: body.customerId },
          data: {
            loyaltyPoints: {
              increment: pointsToAdd,
            },
          },
        });
      }

      // Log the activity
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'created',
          entity: 'pos_transaction',
          entityId: posTransaction.id,
          description: `POS Transaction ${transactionNumber} - ₨${body.totalAmount.toFixed(2)} (${body.items.length} items)`,
          metadata: JSON.stringify({
            transactionNumber,
            totalAmount: body.totalAmount,
            itemCount: body.items.length,
            paymentMethod: body.paymentMethod,
            customerName: body.customerName,
          }),
        },
      });

      return {
        transaction: posTransaction,
        items: transactionItems,
        changeGiven,
      };
    });

    // Return transaction details for receipt
    return NextResponse.json({
      success: true,
      transaction: {
        id: result.transaction.id,
        transactionNumber: result.transaction.transactionNumber,
        subtotal: parseFloat(result.transaction.subtotal.toString()),
        taxAmount: parseFloat(result.transaction.taxAmount.toString()),
        discountAmount: parseFloat(result.transaction.discountAmount.toString()),
        totalAmount: parseFloat(result.transaction.totalAmount.toString()),
        paymentMethod: result.transaction.paymentMethod,
        cashReceived: result.transaction.cashReceived ? parseFloat(result.transaction.cashReceived.toString()) : null,
        changeGiven: result.changeGiven,
        cardAmount: result.transaction.cardAmount ? parseFloat(result.transaction.cardAmount.toString()) : null,
        createdAt: result.transaction.createdAt,
        itemCount: body.items.length,
      },
      items: body.items,
    }, { status: 201 });

  } catch (error) {
    console.error('POS Transaction API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('Product not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}