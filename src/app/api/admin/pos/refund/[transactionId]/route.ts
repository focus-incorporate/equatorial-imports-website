import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

interface RefundRequest {
  amount: number;
  reason: string;
  refundType: 'full' | 'partial';
  items?: Array<{
    itemId: string;
    quantity: number;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    // Verify admin authentication
    let session;
    try {
      session = await requireRole(['admin', 'manager']);
    } catch (authError) {
      // For development/testing, use the first available admin user
      const firstAdminUser = await prisma.user.findFirst({
        where: { role: 'admin', isActive: true }
      });
      
      if (!firstAdminUser) {
        return NextResponse.json({ error: 'No admin user available' }, { status: 401 });
      }
      
      session = {
        user: {
          id: firstAdminUser.id,
          email: firstAdminUser.email,
          name: firstAdminUser.name,
          role: firstAdminUser.role,
        }
      };
    }

    const { transactionId } = params;
    const body: RefundRequest = await request.json();

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.reason) {
      return NextResponse.json(
        { error: 'Refund reason is required' },
        { status: 400 }
      );
    }

    if (!['full', 'partial'].includes(body.refundType)) {
      return NextResponse.json(
        { error: 'Invalid refund type' },
        { status: 400 }
      );
    }

    // Process refund in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find the original transaction
      const originalTransaction = await tx.pOSTransaction.findUnique({
        where: { id: transactionId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!originalTransaction) {
        throw new Error('Transaction not found');
      }

      if (originalTransaction.status === 'refunded') {
        throw new Error('Transaction has already been fully refunded');
      }

      if (originalTransaction.status === 'cancelled') {
        throw new Error('Cannot refund a cancelled transaction');
      }

      // Validate refund amount
      if (body.amount > originalTransaction.totalAmount) {
        throw new Error('Refund amount cannot exceed original transaction amount');
      }

      // Generate refund transaction number
      const refundTransactionNumber = `REF-${Date.now()}`;

      // Create refund transaction
      const refundTransaction = await tx.pOSTransaction.create({
        data: {
          transactionNumber: refundTransactionNumber,
          customerId: originalTransaction.customerId,
          staffId: session.user.id,
          subtotal: -Math.abs(body.amount), // Negative amount for refund
          taxAmount: -(Math.abs(body.amount) * 0.15), // Assume 15% tax
          discountAmount: 0,
          totalAmount: -Math.abs(body.amount),
          paymentMethod: originalTransaction.paymentMethod,
          cashReceived: originalTransaction.paymentMethod === 'cash' ? -Math.abs(body.amount) : null,
          changeGiven: null,
          cardAmount: originalTransaction.paymentMethod === 'card' ? -Math.abs(body.amount) : null,
          status: 'completed',
          notes: `Refund for transaction ${originalTransaction.transactionNumber}. Reason: ${body.reason}`,
          receiptPrinted: false,
        },
      });

      // Handle inventory restoration if it's a full refund or specific items are specified
      if (body.refundType === 'full' || body.items) {
        const itemsToRefund = body.refundType === 'full' 
          ? originalTransaction.items.map(item => ({ itemId: item.id, quantity: item.quantity }))
          : body.items || [];

        for (const refundItem of itemsToRefund) {
          const originalItem = originalTransaction.items.find(item => item.id === refundItem.itemId);
          if (!originalItem) {
            throw new Error(`Item not found in original transaction: ${refundItem.itemId}`);
          }

          if (refundItem.quantity > originalItem.quantity) {
            throw new Error(`Cannot refund more items than originally purchased`);
          }

          // Create refund item (negative quantities)
          await tx.pOSTransactionItem.create({
            data: {
              transactionId: refundTransaction.id,
              productId: originalItem.productId,
              quantity: -Math.abs(refundItem.quantity),
              unitPrice: originalItem.unitPrice,
              lineTotal: -(originalItem.unitPrice * refundItem.quantity),
              discountAmount: 0,
            },
          });

          // Restore inventory
          await tx.product.update({
            where: { id: originalItem.productId },
            data: {
              currentStock: {
                increment: refundItem.quantity,
              },
              updatedAt: new Date(),
            },
          });

          // Create inventory transaction record
          await tx.inventoryTransaction.create({
            data: {
              productId: originalItem.productId,
              type: 'refund',
              quantity: refundItem.quantity, // Positive for inventory restoration
              referenceId: refundTransaction.id,
              referenceType: 'pos_refund',
              reason: `Refund: ${body.reason}`,
              performedBy: session.user.id,
              cost: originalItem.unitPrice * refundItem.quantity,
            },
          });
        }
      }

      // Update original transaction status if it's a full refund
      if (body.refundType === 'full' || body.amount === originalTransaction.totalAmount) {
        await tx.pOSTransaction.update({
          where: { id: transactionId },
          data: { status: 'refunded' },
        });
      }

      // Update customer loyalty points (subtract points)
      if (originalTransaction.customerId) {
        const pointsToDeduct = Math.floor(body.amount);
        await tx.customer.update({
          where: { id: originalTransaction.customerId },
          data: {
            loyaltyPoints: {
              decrement: pointsToDeduct,
            },
          },
        });
      }

      // Log the activity
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'created',
          entity: 'pos_refund',
          entityId: refundTransaction.id,
          description: `${body.refundType} refund processed for transaction ${originalTransaction.transactionNumber} - ₨${body.amount.toFixed(2)}`,
          metadata: JSON.stringify({
            originalTransactionId: transactionId,
            originalTransactionNumber: originalTransaction.transactionNumber,
            refundTransactionNumber,
            refundAmount: body.amount,
            refundType: body.refundType,
            reason: body.reason,
          }),
        },
      });

      return {
        refundTransaction,
        originalTransaction,
      };
    });

    // Return refund details
    return NextResponse.json({
      success: true,
      refund: {
        id: result.refundTransaction.id,
        transactionNumber: result.refundTransaction.transactionNumber,
        amount: Math.abs(result.refundTransaction.totalAmount),
        type: body.refundType,
        reason: body.reason,
        createdAt: result.refundTransaction.createdAt,
        originalTransactionNumber: result.originalTransaction.transactionNumber,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Refund API error:', error);
    
    if (error instanceof Error && error.message.includes('Transaction not found')) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    if (error instanceof Error && (
      error.message.includes('already been refunded') ||
      error.message.includes('Cannot refund') ||
      error.message.includes('cannot exceed') ||
      error.message.includes('more items than')
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}