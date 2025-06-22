import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    // Get recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    // Format the orders for the frontend
    const formattedOrders = recentOrders.map((order) => {
      const now = new Date();
      const orderTime = new Date(order.createdAt);
      const timeDiff = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60)); // minutes

      let timeAgo: string;
      if (timeDiff < 1) {
        timeAgo = 'Just now';
      } else if (timeDiff < 60) {
        timeAgo = `${timeDiff} min ago`;
      } else if (timeDiff < 1440) { // 24 hours
        const hours = Math.floor(timeDiff / 60);
        timeAgo = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        const days = Math.floor(timeDiff / 1440);
        timeAgo = `${days} ${days === 1 ? 'day' : 'days'} ago`;
      }

      return {
        id: order.id,
        customer: order.customerName,
        email: order.customerEmail,
        total: parseFloat(order.total.toString()),
        status: order.status,
        paymentStatus: order.paymentStatus,
        timeAgo,
        createdAt: order.createdAt,
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      total: formattedOrders.length,
    });
  } catch (error) {
    console.error('Recent orders API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch recent orders' },
      { status: 500 }
    );
  }
}