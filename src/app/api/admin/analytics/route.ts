import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch revenue data from both orders and POS transactions
    const [currentOrderRevenue, previousOrderRevenue, currentPOSRevenue, previousPOSRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: 'paid',
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          paymentStatus: 'paid',
        },
        _sum: { total: true },
      }),
      prisma.pOSTransaction.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'completed',
        },
        _sum: { totalAmount: true },
      }),
      prisma.pOSTransaction.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          status: 'completed',
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const currentOrderTotal = parseFloat(currentOrderRevenue._sum.total?.toString() || '0');
    const previousOrderTotal = parseFloat(previousOrderRevenue._sum.total?.toString() || '0');
    const currentPOSTotal = parseFloat(currentPOSRevenue._sum.totalAmount?.toString() || '0');
    const previousPOSTotal = parseFloat(previousPOSRevenue._sum.totalAmount?.toString() || '0');
    
    const currentRevenueTotal = currentOrderTotal + currentPOSTotal;
    const previousRevenueTotal = previousOrderTotal + previousPOSTotal;
    const revenueChange = previousRevenueTotal === 0 ? 100 : 
      ((currentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100;

    // Fetch daily revenue for trend (both orders and POS)
    const [dailyOrderRevenue, dailyPOSRevenue] = await Promise.all([
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
          paymentStatus: 'paid',
        },
        _sum: { total: true },
      }),
      prisma.pOSTransaction.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
          status: 'completed',
        },
        _sum: { totalAmount: true },
      }),
    ]);

    // Process daily revenue data
    const revenueByDay = new Map();
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      revenueByDay.set(dateKey, 0);
    }

    // Add order revenue
    dailyOrderRevenue.forEach((day) => {
      const dateKey = day.createdAt.toISOString().split('T')[0];
      const amount = parseFloat(day._sum.total?.toString() || '0');
      if (revenueByDay.has(dateKey)) {
        revenueByDay.set(dateKey, revenueByDay.get(dateKey) + amount);
      }
    });

    // Add POS revenue
    dailyPOSRevenue.forEach((day) => {
      const dateKey = day.createdAt.toISOString().split('T')[0];
      const amount = parseFloat(day._sum.totalAmount?.toString() || '0');
      if (revenueByDay.has(dateKey)) {
        revenueByDay.set(dateKey, revenueByDay.get(dateKey) + amount);
      }
    });

    const dailyRevenueArray = Array.from(revenueByDay.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Fetch order statistics
    const [currentOrders, previousOrders] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.order.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
      }),
    ]);

    const ordersChange = previousOrders === 0 ? 100 :
      ((currentOrders - previousOrders) / previousOrders) * 100;

    // Fetch order status breakdown
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: { _all: true },
    });

    // Fetch customer statistics
    const [totalCustomers, newCustomers, returningCustomersData] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.customer.findMany({
        where: {
          orders: {
            some: {
              createdAt: { gte: startDate },
            },
          },
        },
        include: {
          _count: { select: { orders: true } },
        },
      }),
    ]);

    const returningCustomers = returningCustomersData.filter(c => c._count.orders > 1).length;

    // Fetch top customers
    const topCustomers = await prisma.customer.findMany({
      take: 5,
      include: {
        orders: {
          where: {
            createdAt: { gte: startDate },
            paymentStatus: 'paid',
          },
          select: { total: true },
        },
        _count: { select: { orders: true } },
      },
    });

    const formattedTopCustomers = topCustomers
      .map((customer) => ({
        name: customer.name,
        orders: customer._count.orders,
        spent: customer.orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0),
      }))
      .filter(customer => customer.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    // Fetch top selling products from both orders and POS transactions
    const [topOrderProducts, topPOSProducts] = await Promise.all([
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: startDate },
            paymentStatus: 'paid',
          },
        },
        _sum: {
          quantity: true,
          lineTotal: true,
        },
      }),
      prisma.pOSTransactionItem.groupBy({
        by: ['productId'],
        where: {
          transaction: {
            createdAt: { gte: startDate },
            status: 'completed',
          },
        },
        _sum: {
          quantity: true,
          lineTotal: true,
        },
      }),
    ]);

    // Combine and aggregate data from both sources
    const productSalesMap = new Map();
    
    // Add order data
    topOrderProducts.forEach((item) => {
      const existing = productSalesMap.get(item.productId) || { quantity: 0, revenue: 0 };
      productSalesMap.set(item.productId, {
        quantity: existing.quantity + (item._sum.quantity || 0),
        revenue: existing.revenue + parseFloat(item._sum.lineTotal?.toString() || '0'),
      });
    });
    
    // Add POS data
    topPOSProducts.forEach((item) => {
      const existing = productSalesMap.get(item.productId) || { quantity: 0, revenue: 0 };
      productSalesMap.set(item.productId, {
        quantity: existing.quantity + (item._sum.quantity || 0),
        revenue: existing.revenue + parseFloat(item._sum.lineTotal?.toString() || '0'),
      });
    });

    // Convert to array and sort by quantity
    const topProducts = Array.from(productSalesMap.entries())
      .map(([productId, data]) => ({
        productId,
        _sum: {
          quantity: data.quantity,
          lineTotal: data.revenue,
        },
      }))
      .sort((a, b) => b._sum.quantity - a._sum.quantity)
      .slice(0, 5);

    // Get product details for top products
    const productIds = topProducts.map(p => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const productMap = new Map(productDetails.map(p => [p.id, p.name]));

    const formattedTopProducts = topProducts.map((product) => ({
      name: productMap.get(product.productId) || 'Unknown Product',
      sold: product._sum.quantity || 0,
      revenue: parseFloat(product._sum.lineTotal?.toString() || '0'),
    }));

    // Fetch category performance
    const categoryPerformance = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          paymentStatus: 'paid',
        },
      },
      _sum: { lineTotal: true },
    });

    // Get product categories
    const allProducts = await prisma.product.findMany({
      where: { id: { in: categoryPerformance.map(cp => cp.productId) } },
      select: { id: true, type: true },
    });

    const categoryRevenue = new Map();
    let totalCategoryRevenue = 0;

    categoryPerformance.forEach((item) => {
      const product = allProducts.find(p => p.id === item.productId);
      if (product) {
        const revenue = parseFloat(item._sum.lineTotal?.toString() || '0');
        const currentRevenue = categoryRevenue.get(product.type) || 0;
        categoryRevenue.set(product.type, currentRevenue + revenue);
        totalCategoryRevenue += revenue;
      }
    });

    const formattedCategories = Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalCategoryRevenue > 0 ? (revenue / totalCategoryRevenue) * 100 : 0,
    }));

    // Fetch inventory alerts
    const [lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.count({
        where: {
          AND: [
            { inStock: true },
            { currentStock: { lte: prisma.product.fields.minStockLevel } },
          ],
        },
      }),
      prisma.product.count({
        where: {
          OR: [
            { inStock: false },
            { currentStock: 0 },
          ],
        },
      }),
    ]);

    const analytics = {
      revenue: {
        total: currentRevenueTotal,
        change: revenueChange,
        trend: revenueChange >= 0 ? 'up' : 'down',
        daily: dailyRevenueArray,
        breakdown: {
          onlineOrders: currentOrderTotal,
          posTransactions: currentPOSTotal,
          onlinePercentage: currentRevenueTotal > 0 ? (currentOrderTotal / currentRevenueTotal) * 100 : 0,
          posPercentage: currentRevenueTotal > 0 ? (currentPOSTotal / currentRevenueTotal) * 100 : 0,
        },
      },
      orders: {
        total: currentOrders,
        change: ordersChange,
        trend: ordersChange >= 0 ? 'up' : 'down',
        byStatus: ordersByStatus.map(status => ({
          status: status.status,
          count: status._count._all,
        })),
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
        returning: returningCustomers,
        topCustomers: formattedTopCustomers,
      },
      products: {
        topSelling: formattedTopProducts,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        categories: formattedCategories,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}