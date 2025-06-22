import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { Resend } from 'resend';
import { generateOrderEmailHTML } from '@/lib/emailService';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
}

interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  timePreference?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!orderData.customerName || !orderData.customerEmail || !orderData.customerPhone) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!orderData.deliveryAddress) {
      return NextResponse.json(
        { error: 'Delivery address is required' },
        { status: 400 }
      );
    }

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if customer exists, create if not
      let customer = await tx.customer.findFirst({
        where: {
          OR: [
            { email: orderData.customerEmail },
            { phone: orderData.customerPhone },
          ],
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: orderData.customerName,
            email: orderData.customerEmail,
            phone: orderData.customerPhone,
            address: orderData.deliveryAddress,
            customerGroup: 'regular',
            loyaltyPoints: 0,
          },
        });
      } else {
        // Update customer info if order has new details
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: orderData.customerName,
            email: orderData.customerEmail,
            phone: orderData.customerPhone,
            address: orderData.deliveryAddress,
          },
        });
      }

      // Create the order
      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          deliveryAddress: orderData.deliveryAddress,
          deliveryNotes: orderData.deliveryNotes,
          timePreference: orderData.timePreference,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          taxAmount: 0, // Currently no tax
          discountAmount: 0, // Currently no discounts
          total: orderData.total,
          status: 'pending',
          paymentMethod: orderData.paymentMethod || 'cash-on-delivery',
          paymentStatus: 'pending',
        },
      });

      // Create order items and update product stock
      const orderItems = [];
      for (const item of orderData.items) {
        // Verify product exists and has sufficient stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, currentStock: true, price: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
        }

        // Create order item
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: item.price,
            lineTotal: item.price * item.quantity,
          },
        });

        orderItems.push(orderItem);

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
            updatedAt: new Date(),
          },
        });

        // Create inventory transaction record
        // Get the first admin user to associate with system transactions
        const adminUser = await tx.user.findFirst({
          where: { role: 'admin', isActive: true }
        });
        
        if (!adminUser) {
          throw new Error('No admin user found for inventory transaction');
        }

        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: 'sale',
            quantity: -item.quantity, // Negative for sale
            referenceId: order.id,
            referenceType: 'order',
            reason: 'Online Order',
            performedBy: adminUser.id,
            cost: item.price * item.quantity,
          },
        });
      }

      // Award loyalty points (1 point per SCR spent)
      const pointsToAdd = Math.floor(orderData.total);
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          loyaltyPoints: {
            increment: pointsToAdd,
          },
        },
      });

      return {
        order,
        orderItems,
        customer,
        pointsAwarded: pointsToAdd,
      };
    });

    // Send confirmation emails
    try {
      const emailData = {
        orderId: result.order.id,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        total: orderData.total,
        deliveryAddress: orderData.deliveryAddress,
        deliveryFee: orderData.deliveryFee,
        subtotal: orderData.subtotal,
        timePreference: orderData.timePreference,
        paymentMethod: orderData.paymentMethod,
      };

      // Generate the HTML email content
      const emailHTML = generateOrderEmailHTML(emailData);
      
      // Send customer confirmation email
      const customerEmailResult = await resend.emails.send({
        from: 'Equatorial Imports <orders@resend.dev>',
        to: [orderData.customerEmail],
        subject: `Order Confirmation - ${result.order.id}`,
        html: emailHTML,
      });

      // Send admin notification email
      const adminEmailResult = await resend.emails.send({
        from: 'Equatorial Imports <orders@resend.dev>',
        to: ['admin@resend.dev'], // Replace with actual admin email
        subject: `New Order Received - ${result.order.id}`,
        html: `
          <h2>New Order Notification</h2>
          <p><strong>Order ID:</strong> ${result.order.id}</p>
          <p><strong>Customer:</strong> ${orderData.customerName} (${orderData.customerEmail})</p>
          <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
          <p><strong>Total:</strong> ₨${orderData.total.toFixed(2)}</p>
          <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
          <p><strong>Time Preference:</strong> ${orderData.timePreference || 'Anytime'}</p>
          <p><strong>Loyalty Points Awarded:</strong> ${result.pointsAwarded}</p>
          <hr>
          <h3>Items:</h3>
          <ul>
            ${orderData.items.map(item => `
              <li>${item.name} (${item.brand}) × ${item.quantity} = ₨${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
          </ul>
          <hr>
          <p><strong>Subtotal:</strong> ₨${orderData.subtotal.toFixed(2)}</p>
          <p><strong>Delivery Fee:</strong> ₨${orderData.deliveryFee.toFixed(2)}</p>
          <p><strong>Total:</strong> ₨${orderData.total.toFixed(2)}</p>
        `,
      });

      console.log('Order emails sent:', { customerEmailResult, adminEmailResult });
    } catch (emailError) {
      console.error('Error sending order emails:', emailError);
      // Don't fail the order creation if emails fail
    }

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      message: 'Order created successfully',
      customer: {
        id: result.customer.id,
        loyaltyPoints: result.customer.loyaltyPoints + result.pointsAwarded,
      },
      pointsAwarded: result.pointsAwarded,
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('Product not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Get orders (for admin or customer lookup)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('customerEmail');
    const orderId = searchParams.get('orderId');

    let where = {};
    if (customerEmail) {
      where = { customerEmail };
    } else if (orderId) {
      where = { id: orderId };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                image: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            loyaltyPoints: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        deliveryNotes: order.deliveryNotes,
        timePreference: order.timePreference,
        subtotal: parseFloat(order.subtotal.toString()),
        deliveryFee: parseFloat(order.deliveryFee.toString()),
        total: parseFloat(order.total.toString()),
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          lineTotal: parseFloat(item.lineTotal.toString()),
          product: item.product,
        })),
        customer: order.customer,
      })),
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}