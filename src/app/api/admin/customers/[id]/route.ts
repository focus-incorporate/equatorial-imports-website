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

    // Find the customer with order summary
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            status: true,
            paymentStatus: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate customer analytics
    const paidOrders = customer.orders.filter(order => order.paymentStatus === 'paid');
    const totalSpent = paidOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    const lastOrder = customer.orders.length > 0 ? customer.orders[0] : null;

    // Format customer for frontend
    const formattedCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth,
      loyaltyPoints: customer.loyaltyPoints,
      creditLimit: parseFloat(customer.creditLimit.toString()),
      customerGroup: customer.customerGroup,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      totalOrders: customer._count.orders,
      totalSpent,
      lastOrderDate: lastOrder ? lastOrder.createdAt : null,
      orderHistory: customer.orders.map(order => ({
        id: order.id,
        total: parseFloat(order.total.toString()),
        createdAt: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
      })),
    };

    return NextResponse.json({ customer: formattedCustomer });
  } catch (error) {
    console.error('Get customer API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch customer' },
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

    // Find the existing customer
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.email !== undefined) updates.email = body.email || null;
    if (body.phone !== undefined) updates.phone = body.phone || null;
    if (body.address !== undefined) updates.address = body.address || null;
    if (body.dateOfBirth !== undefined) updates.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    if (body.loyaltyPoints !== undefined) updates.loyaltyPoints = parseInt(body.loyaltyPoints) || 0;
    if (body.creditLimit !== undefined) updates.creditLimit = parseFloat(body.creditLimit) || 0;
    if (body.customerGroup !== undefined) updates.customerGroup = body.customerGroup || 'regular';

    // Update the customer
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updates,
    });

    // Log the activity
    const changedFields = Object.keys(updates);
    if (changedFields.length > 0) {
      await prisma.activityLog.create({
        data: {
          action: 'updated',
          entity: 'customer',
          entityId: id,
          description: `Updated customer ${updatedCustomer.name}: ${changedFields.join(', ')}`,
          metadata: JSON.stringify({ 
            customerId: id, 
            name: updatedCustomer.name,
            changes: changedFields 
          }),
        },
      });
    }

    return NextResponse.json({ customer: updatedCustomer });
  } catch (error) {
    console.error('Update customer API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Customer with this email or phone already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update customer' },
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

    // Find the existing customer
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: true,
        posTransactions: true,
        invoices: true,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has associated orders, transactions, or invoices
    if (existingCustomer.orders.length > 0 || 
        existingCustomer.posTransactions.length > 0 || 
        existingCustomer.invoices.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders, transactions, or invoices. Consider archiving instead.' },
        { status: 409 }
      );
    }

    // Delete the customer
    await prisma.customer.delete({
      where: { id },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'deleted',
        entity: 'customer',
        entityId: id,
        description: `Deleted customer: ${existingCustomer.name}`,
        metadata: JSON.stringify({ 
          customerId: id, 
          name: existingCustomer.name,
          email: existingCustomer.email,
          phone: existingCustomer.phone,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete customer API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}