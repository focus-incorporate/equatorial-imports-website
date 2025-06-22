import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireRole(['admin', 'manager']);

    const body = await request.json();
    const { productId, type, quantity, reason } = body;

    // Validate input
    if (!productId || !type || !quantity || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, type, quantity, reason' },
        { status: 400 }
      );
    }

    if (!['increase', 'decrease', 'set'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid adjustment type. Must be: increase, decrease, or set' },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be positive' },
        { status: 400 }
      );
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        currentStock: true,
        costPrice: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate new stock level
    let newStock: number;
    let adjustmentQuantity: number;

    switch (type) {
      case 'increase':
        newStock = product.currentStock + quantity;
        adjustmentQuantity = quantity;
        break;
      case 'decrease':
        newStock = Math.max(0, product.currentStock - quantity);
        adjustmentQuantity = -(Math.min(quantity, product.currentStock));
        break;
      case 'set':
        newStock = quantity;
        adjustmentQuantity = quantity - product.currentStock;
        break;
      default:
        throw new Error('Invalid adjustment type');
    }

    // Determine inventory transaction type based on reason
    const transactionTypeMap = {
      'restocking': 'purchase',
      'sale': 'sale',
      'damage': 'damage',
      'return': 'return',
      'correction': 'adjustment',
      'expired': 'damage',
    };

    const transactionType = transactionTypeMap[reason as keyof typeof transactionTypeMap] || 'adjustment';

    // Update product stock and create inventory transaction in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: newStock,
          inStock: newStock > 0,
          updatedAt: new Date(),
        },
      });

      // Create inventory transaction record
      const inventoryTransaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          type: transactionType,
          quantity: adjustmentQuantity,
          reason,
          performedBy: session.user.id,
          cost: product.costPrice ? parseFloat(product.costPrice.toString()) * Math.abs(adjustmentQuantity) : null,
        },
      });

      // Log the activity
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'updated',
          entity: 'inventory',
          entityId: productId,
          description: `Adjusted stock for ${product.name}: ${product.currentStock} → ${newStock} (${adjustmentQuantity >= 0 ? '+' : ''}${adjustmentQuantity})`,
          metadata: JSON.stringify({
            productId,
            productName: product.name,
            oldStock: product.currentStock,
            newStock,
            adjustment: adjustmentQuantity,
            reason,
            type,
          }),
        },
      });

      return { updatedProduct, inventoryTransaction };
    });

    return NextResponse.json({
      success: true,
      product: {
        id: result.updatedProduct.id,
        currentStock: result.updatedProduct.currentStock,
        inStock: result.updatedProduct.inStock,
      },
      transaction: {
        id: result.inventoryTransaction.id,
        type: result.inventoryTransaction.type,
        quantity: result.inventoryTransaction.quantity,
        reason: result.inventoryTransaction.reason,
      },
    });
  } catch (error) {
    console.error('Stock adjustment API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}