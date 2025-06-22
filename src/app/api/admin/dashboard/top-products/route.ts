import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    // Get the last 30 days for analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get top products from order items in the last 30 days
    const topProductsFromOrders = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          paymentStatus: 'paid',
        },
      },
      _sum: {
        quantity: true,
        lineTotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Get top products from POS transactions in the last 30 days
    const topProductsFromPOS = await prisma.pOSTransactionItem.groupBy({
      by: ['productId'],
      where: {
        transaction: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          status: 'completed',
        },
      },
      _sum: {
        quantity: true,
        lineTotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Combine and aggregate results from both sources
    const productSalesMap = new Map();

    // Process order items
    for (const item of topProductsFromOrders) {
      const productId = item.productId;
      if (!productSalesMap.has(productId)) {
        productSalesMap.set(productId, {
          productId,
          totalQuantity: 0,
          totalRevenue: 0,
        });
      }
      const existing = productSalesMap.get(productId);
      existing.totalQuantity += item._sum.quantity || 0;
      existing.totalRevenue += item._sum.lineTotal || 0;
    }

    // Process POS items
    for (const item of topProductsFromPOS) {
      const productId = item.productId;
      if (!productSalesMap.has(productId)) {
        productSalesMap.set(productId, {
          productId,
          totalQuantity: 0,
          totalRevenue: 0,
        });
      }
      const existing = productSalesMap.get(productId);
      existing.totalQuantity += item._sum.quantity || 0;
      existing.totalRevenue += item._sum.lineTotal || 0;
    }

    // Sort by total quantity and take top 4
    const sortedProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 4);

    // Get product details
    const productIds = sortedProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        brand: true,
        price: true,
        image: true,
      },
    });

    // Create a map for easy lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Format the response
    const formattedProducts = sortedProducts.map((sales) => {
      const product = productMap.get(sales.productId);
      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: parseFloat(product.price.toString()),
        image: product.image,
        sales: sales.totalQuantity,
        revenue: parseFloat(sales.totalRevenue.toString()),
      };
    }).filter(Boolean);

    // Calculate the maximum sales for progress bar calculation
    const maxSales = Math.max(...formattedProducts.map(p => p!.sales));

    const responseData = {
      products: formattedProducts.map(product => ({
        ...product,
        progressPercent: maxSales > 0 ? Math.round((product!.sales / maxSales) * 100) : 0,
      })),
      period: '30 days',
      totalProducts: formattedProducts.length,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Top products API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch top products' },
      { status: 500 }
    );
  }
}