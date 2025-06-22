import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const format = searchParams.get('format') || 'csv';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch comprehensive data for export
    const [orders, customers, products, posTransactions] = await Promise.all([
      // Orders data
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          items: {
            include: { product: { select: { name: true, brand: true } } },
          },
          customer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Customers data
      prisma.customer.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          _count: { select: { orders: true } },
          orders: {
            where: { paymentStatus: 'paid' },
            select: { total: true },
          },
        },
      }),

      // Products performance
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: startDate },
            paymentStatus: 'paid',
          },
        },
        _sum: { quantity: true, lineTotal: true },
        _count: { _all: true },
      }),

      // POS transactions
      prisma.pOSTransaction.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          items: {
            include: { product: { select: { name: true, brand: true } } },
          },
          customer: { select: { name: true } },
          staff: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Get product details for products performance
    const productIds = products.map(p => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, brand: true, type: true },
    });
    const productMap = new Map(productDetails.map(p => [p.id, p]));

    if (format === 'csv') {
      // Generate CSV data
      const csvData = [];

      // Orders CSV
      csvData.push('=== ORDERS REPORT ===');
      csvData.push('Order ID,Customer,Email,Total (SCR),Status,Payment Status,Created Date,Items Count');
      orders.forEach(order => {
        csvData.push([
          order.id,
          order.customerName,
          order.customerEmail,
          order.total.toString(),
          order.status,
          order.paymentStatus,
          order.createdAt.toISOString().split('T')[0],
          order.items.length.toString(),
        ].join(','));
      });

      csvData.push('');
      
      // POS Transactions CSV
      csvData.push('=== POS TRANSACTIONS REPORT ===');
      csvData.push('Transaction Number,Customer,Staff,Total (SCR),Payment Method,Status,Created Date,Items Count');
      posTransactions.forEach(transaction => {
        csvData.push([
          transaction.transactionNumber,
          transaction.customer?.name || 'Walk-in',
          transaction.staff.name || 'Unknown',
          transaction.totalAmount.toString(),
          transaction.paymentMethod,
          transaction.status,
          transaction.createdAt.toISOString().split('T')[0],
          transaction.items.length.toString(),
        ].join(','));
      });

      csvData.push('');

      // Customers CSV
      csvData.push('=== CUSTOMERS REPORT ===');
      csvData.push('Name,Email,Phone,Total Orders,Total Spent (SCR),Loyalty Points,Customer Group,Join Date');
      customers.forEach(customer => {
        const totalSpent = customer.orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
        csvData.push([
          customer.name,
          customer.email || '',
          customer.phone || '',
          customer._count.orders.toString(),
          totalSpent.toFixed(2),
          customer.loyaltyPoints.toString(),
          customer.customerGroup,
          customer.createdAt.toISOString().split('T')[0],
        ].join(','));
      });

      csvData.push('');

      // Products Performance CSV
      csvData.push('=== PRODUCTS PERFORMANCE REPORT ===');
      csvData.push('Product Name,Brand,Category,Units Sold,Revenue (SCR),Order Count');
      products.forEach(product => {
        const productInfo = productMap.get(product.productId);
        if (productInfo) {
          csvData.push([
            productInfo.name,
            productInfo.brand,
            productInfo.type,
            (product._sum.quantity || 0).toString(),
            (product._sum.lineTotal || 0).toString(),
            product._count._all.toString(),
          ].join(','));
        }
      });

      csvData.push('');

      // Summary Statistics
      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0) +
        posTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, transaction) => sum + parseFloat(transaction.totalAmount.toString()), 0);

      csvData.push('=== SUMMARY STATISTICS ===');
      csvData.push(`Report Period,${startDate.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`);
      csvData.push(`Total Revenue (SCR),${totalRevenue.toFixed(2)}`);
      csvData.push(`Total Orders,${orders.length}`);
      csvData.push(`Total POS Transactions,${posTransactions.length}`);
      csvData.push(`New Customers,${customers.length}`);
      csvData.push(`Unique Products Sold,${products.length}`);

      const csvContent = csvData.join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${range}-${now.toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // For future JSON export format
    const jsonData = {
      reportPeriod: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        range,
      },
      summary: {
        totalRevenue: orders
          .filter(o => o.paymentStatus === 'paid')
          .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0) +
          posTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, transaction) => sum + parseFloat(transaction.totalAmount.toString()), 0),
        totalOrders: orders.length,
        totalPOSTransactions: posTransactions.length,
        newCustomers: customers.length,
        uniqueProductsSold: products.length,
      },
      orders: orders.map(order => ({
        id: order.id,
        customer: order.customerName,
        email: order.customerEmail,
        total: parseFloat(order.total.toString()),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        itemsCount: order.items.length,
      })),
      posTransactions: posTransactions.map(transaction => ({
        transactionNumber: transaction.transactionNumber,
        customer: transaction.customer?.name || 'Walk-in',
        staff: transaction.staff.name,
        total: parseFloat(transaction.totalAmount.toString()),
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        createdAt: transaction.createdAt,
        itemsCount: transaction.items.length,
      })),
      customers: customers.map(customer => ({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalOrders: customer._count.orders,
        totalSpent: customer.orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0),
        loyaltyPoints: customer.loyaltyPoints,
        customerGroup: customer.customerGroup,
        joinDate: customer.createdAt,
      })),
      products: products.map(product => {
        const productInfo = productMap.get(product.productId);
        return {
          name: productInfo?.name || 'Unknown',
          brand: productInfo?.brand || 'Unknown',
          category: productInfo?.type || 'Unknown',
          unitsSold: product._sum.quantity || 0,
          revenue: parseFloat((product._sum.lineTotal || 0).toString()),
          orderCount: product._count._all,
        };
      }),
    };

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error('Analytics export API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}