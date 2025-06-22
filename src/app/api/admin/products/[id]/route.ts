import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    const { id } = params;

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        brand: true,
        type: true,
        price: true,
        image: true,
        description: true,
        currentStock: true,
        minStockLevel: true,
        maxStockLevel: true,
        inStock: true,
        category: true,
        costPrice: true,
        taxRate: true,
        barcode: true,
        intensity: true,
        roast: true,
        weight: true,
        flavorNotes: true,
        compatibility: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Format product for frontend
    const formattedProduct = {
      ...product,
      price: parseFloat(product.price.toString()),
      costPrice: product.costPrice ? parseFloat(product.costPrice.toString()) : null,
      taxRate: parseFloat(product.taxRate.toString()),
      flavorNotes: product.flavorNotes ? JSON.parse(product.flavorNotes) : [],
      compatibility: product.compatibility ? JSON.parse(product.compatibility) : null,
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error) {
    console.error('Get product API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    const { id } = params;
    const body = await request.json();

    // Find the existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    const updates: Record<string, unknown> = {};
    
    if (body.name !== undefined) updates.name = body.name;
    if (body.brand !== undefined) updates.brand = body.brand;
    if (body.type !== undefined) updates.type = body.type;
    if (body.intensity !== undefined) updates.intensity = body.intensity;
    if (body.roast !== undefined) updates.roast = body.roast;
    if (body.price !== undefined) updates.price = parseFloat(body.price);
    if (body.image !== undefined) updates.image = body.image;
    if (body.description !== undefined) updates.description = body.description;
    if (body.weight !== undefined) updates.weight = body.weight;
    if (body.inStock !== undefined) updates.inStock = body.inStock;
    if (body.currentStock !== undefined) updates.currentStock = parseInt(body.currentStock);
    if (body.minStockLevel !== undefined) updates.minStockLevel = parseInt(body.minStockLevel);
    if (body.maxStockLevel !== undefined) updates.maxStockLevel = parseInt(body.maxStockLevel);
    if (body.costPrice !== undefined) updates.costPrice = body.costPrice ? parseFloat(body.costPrice) : null;
    if (body.barcode !== undefined) updates.barcode = body.barcode;
    if (body.category !== undefined) updates.category = body.category;
    if (body.taxRate !== undefined) updates.taxRate = parseFloat(body.taxRate);
    if (body.flavorNotes !== undefined) updates.flavorNotes = JSON.stringify(body.flavorNotes);
    if (body.compatibility !== undefined) updates.compatibility = body.compatibility ? JSON.stringify(body.compatibility) : null;

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updates,
    });

    // Log the activity
    const changedFields = Object.keys(updates);
    if (changedFields.length > 0) {
      await prisma.activityLog.create({
        data: {
          action: 'updated',
          entity: 'product',
          entityId: id,
          description: `Updated product ${updatedProduct.name}: ${changedFields.join(', ')}`,
          metadata: JSON.stringify({ 
            productId: id, 
            name: updatedProduct.name,
            changes: changedFields 
          }),
        },
      });
    }

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Product with this combination already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    const { id } = params;

    // Find the existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        posTransactionItems: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has associated orders or transactions
    if (existingProduct.orderItems.length > 0 || existingProduct.posTransactionItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders or transactions. Consider marking as out of stock instead.' },
        { status: 409 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'deleted',
        entity: 'product',
        entityId: id,
        description: `Deleted product: ${existingProduct.name}`,
        metadata: JSON.stringify({ 
          productId: id, 
          name: existingProduct.name,
          brand: existingProduct.brand,
          type: existingProduct.type,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}