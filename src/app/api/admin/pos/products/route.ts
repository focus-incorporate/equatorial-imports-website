import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    // Fetch all in-stock products for POS
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        currentStock: {
          gt: 0,
        },
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        brand: true,
        type: true,
        price: true,
        image: true,
        currentStock: true,
        taxRate: true,
        barcode: true,
        intensity: true,
        roast: true,
        weight: true,
      },
    });

    // Format products for POS interface
    const posProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.type,
      price: parseFloat(product.price.toString()),
      image: product.image,
      stock: product.currentStock,
      taxRate: parseFloat(product.taxRate.toString()),
      barcode: product.barcode,
      intensity: product.intensity,
      roast: product.roast,
      weight: product.weight,
    }));

    return NextResponse.json({
      products: posProducts,
      total: posProducts.length,
    });
  } catch (error) {
    console.error('POS Products API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch POS products' },
      { status: 500 }
    );
  }
}