import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const group = searchParams.get('group') || '';

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (group) {
      where.customerGroup = group;
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch customers with aggregated order data
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          orders: {
            select: {
              id: true,
              total: true,
              createdAt: true,
              paymentStatus: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Format customers for frontend
    const formattedCustomers = customers.map((customer) => {
      const paidOrders = customer.orders.filter(order => order.paymentStatus === 'paid');
      const totalSpent = paidOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
      const lastOrder = customer.orders.length > 0 
        ? customer.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        loyaltyPoints: customer.loyaltyPoints,
        creditLimit: parseFloat(customer.creditLimit.toString()),
        customerGroup: customer.customerGroup,
        createdAt: customer.createdAt,
        totalOrders: customer._count.orders,
        totalSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
      };
    });

    return NextResponse.json({
      customers: formattedCustomers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit,
      },
    });
  } catch (error) {
    console.error('Customers API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        loyaltyPoints: parseInt(body.loyaltyPoints || '0'),
        creditLimit: parseFloat(body.creditLimit || '0'),
        customerGroup: body.customerGroup || 'regular',
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'created',
        entity: 'customer',
        entityId: customer.id,
        description: `Created customer: ${customer.name}`,
        metadata: JSON.stringify({ customerId: customer.id, name: customer.name }),
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}