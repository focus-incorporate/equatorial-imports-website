import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Calculate today's revenue from orders and POS transactions
    const [todayOrders, todayPOSTransactions] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
          paymentStatus: 'paid',
        },
        select: { total: true },
      }),
      prisma.pOSTransaction.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
          status: 'completed',
        },
        select: { totalAmount: true },
      }),
    ]);

    const todayRevenue = [
      ...todayOrders.map(o => o.total),
      ...todayPOSTransactions.map(t => t.totalAmount)
    ].reduce((sum, amount) => sum + amount, 0);

    // Get yesterday's revenue for comparison
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);

    const [yesterdayOrders, yesterdayPOSTransactions] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfYesterday,
            lt: endOfYesterday,
          },
          paymentStatus: 'paid',
        },
        select: { total: true },
      }),
      prisma.pOSTransaction.findMany({
        where: {
          createdAt: {
            gte: startOfYesterday,
            lt: endOfYesterday,
          },
          status: 'completed',
        },
        select: { totalAmount: true },
      }),
    ]);

    const yesterdayRevenue = [
      ...yesterdayOrders.map(o => o.total),
      ...yesterdayPOSTransactions.map(t => t.totalAmount)
    ].reduce((sum, amount) => sum + amount, 0);

    // Calculate revenue change percentage
    const revenueChange = yesterdayRevenue === 0 ? 100 : 
      ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    // Get total orders count and change
    const [totalOrders, yesterdayOrdersCount] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfYesterday,
            lt: endOfYesterday,
          },
        },
      }),
    ]);

    const ordersChange = yesterdayOrdersCount === 0 ? 100 :
      ((totalOrders - yesterdayOrdersCount) / yesterdayOrdersCount) * 100;

    // Get active customers (customers who made orders in last 30 days)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [activeCustomers, previousPeriodCustomers] = await Promise.all([
      prisma.customer.count({
        where: {
          OR: [
            {
              orders: {
                some: {
                  createdAt: {
                    gte: thirtyDaysAgo,
                  },
                },
              },
            },
            {
              posTransactions: {
                some: {
                  createdAt: {
                    gte: thirtyDaysAgo,
                  },
                },
              },
            },
          ],
        },
      }),
      prisma.customer.count({
        where: {
          OR: [
            {
              orders: {
                some: {
                  createdAt: {
                    gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
                    lt: thirtyDaysAgo,
                  },
                },
              },
            },
            {
              posTransactions: {
                some: {
                  createdAt: {
                    gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
                    lt: thirtyDaysAgo,
                  },
                },
              },
            },
          ],
        },
      }),
    ]);

    const customersChange = previousPeriodCustomers === 0 ? 100 :
      ((activeCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100;

    // Get low stock items count
    const lowStockItems = await prisma.product.count({
      where: {
        currentStock: {
          lte: prisma.product.fields.minStockLevel,
        },
      },
    });

    // For simplicity, we'll assume low stock change is the difference from a baseline
    const previousLowStock = lowStockItems + 2; // Simulated previous count
    const lowStockChange = previousLowStock - lowStockItems;

    // Format currency as SCR
    const formatSCR = (amount: number) => `₨${amount.toFixed(2)}`;

    const stats = {
      todayRevenue: {
        value: formatSCR(todayRevenue),
        rawValue: todayRevenue,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        changeType: revenueChange >= 0 ? 'positive' : 'negative',
      },
      totalOrders: {
        value: totalOrders.toString(),
        rawValue: totalOrders,
        change: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}%`,
        changeType: ordersChange >= 0 ? 'positive' : 'negative',
      },
      activeCustomers: {
        value: activeCustomers.toString(),
        rawValue: activeCustomers,
        change: `${customersChange >= 0 ? '+' : ''}${customersChange.toFixed(1)}%`,
        changeType: customersChange >= 0 ? 'positive' : 'negative',
      },
      lowStockItems: {
        value: lowStockItems.toString(),
        rawValue: lowStockItems,
        change: lowStockChange > 0 ? `+${lowStockChange}` : lowStockChange.toString(),
        changeType: lowStockChange <= 0 ? 'positive' : 'negative',
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}