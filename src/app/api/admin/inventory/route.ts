import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.type = category;
    }

    // Fetch products for inventory view
    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        brand: true,
        type: true,
        currentStock: true,
        minStockLevel: true,
        maxStockLevel: true,
        costPrice: true,
        price: true,
        barcode: true,
        inStock: true,
        updatedAt: true,
      },
    });

    // Format inventory data
    const inventory = products.map((product) => {
      const costPrice = parseFloat(product.costPrice?.toString() || '0');
      const sellPrice = parseFloat(product.price.toString());
      const stockValue = product.currentStock * costPrice;
      
      // Determine stock status
      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
      if (!product.inStock || product.currentStock === 0) {
        stockStatus = 'out_of_stock';
      } else if (product.currentStock <= product.minStockLevel) {
        stockStatus = 'low_stock';
      } else {
        stockStatus = 'in_stock';
      }

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.type,
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        maxStockLevel: product.maxStockLevel,
        costPrice,
        sellPrice,
        stockValue,
        stockStatus,
        lastRestocked: product.updatedAt,
        barcode: product.barcode,
      };
    });

    // Filter by status if requested
    const filteredInventory = status 
      ? inventory.filter(item => item.stockStatus === status)
      : inventory;

    return NextResponse.json({
      inventory: filteredInventory,
      summary: {
        totalProducts: inventory.length,
        inStock: inventory.filter(item => item.stockStatus === 'in_stock').length,
        lowStock: inventory.filter(item => item.stockStatus === 'low_stock').length,
        outOfStock: inventory.filter(item => item.stockStatus === 'out_of_stock').length,
        totalValue: inventory.reduce((sum, item) => sum + item.stockValue, 0),
      },
    });
  } catch (error) {
    console.error('Inventory API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}