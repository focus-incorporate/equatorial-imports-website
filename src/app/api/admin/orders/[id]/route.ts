import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

// Order status workflow validation
const validateStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['on_the_way', 'cancelled'],
    on_the_way: ['delivered'],
    delivered: [], // No transitions from delivered
    cancelled: [], // No transitions from cancelled
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    const { id } = params;
    const body = await request.json();

    // Find the existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate status transition if status is being updated
    if (body.status && body.status !== existingOrder.status) {
      if (!validateStatusTransition(existingOrder.status, body.status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${existingOrder.status} to ${body.status}` },
          { status: 400 }
        );
      }
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'partially_paid', 'failed'];
    if (body.paymentStatus && !validPaymentStatuses.includes(body.paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // Validate order status
    const validOrderStatuses = ['pending', 'confirmed', 'on_the_way', 'delivered', 'cancelled'];
    if (body.status && !validOrderStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
        ...(body.deliveryNotes && { deliveryNotes: body.deliveryNotes }),
        ...(body.timePreference && { timePreference: body.timePreference }),
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    // Log the activity
    const changedFields = [];
    if (body.status && body.status !== existingOrder.status) {
      changedFields.push(`status: ${existingOrder.status} → ${body.status}`);
    }
    if (body.paymentStatus && body.paymentStatus !== existingOrder.paymentStatus) {
      changedFields.push(`payment: ${existingOrder.paymentStatus} → ${body.paymentStatus}`);
    }

    if (changedFields.length > 0) {
      await prisma.activityLog.create({
        data: {
          action: 'updated',
          entity: 'order',
          entityId: id,
          description: `Updated order ${id}: ${changedFields.join(', ')}`,
          metadata: JSON.stringify({ 
            orderId: id, 
            changes: changedFields,
            customerName: existingOrder.customerName 
          }),
        },
      });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Update order API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to update order' },
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

    // Find the existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete the order (this will cascade delete order items due to schema)
    await prisma.order.delete({
      where: { id },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'deleted',
        entity: 'order',
        entityId: id,
        description: `Deleted order ${id} for customer ${existingOrder.customerName}`,
        metadata: JSON.stringify({ 
          orderId: id, 
          customerName: existingOrder.customerName,
          total: existingOrder.total.toString(),
          itemCount: existingOrder.items.length,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}