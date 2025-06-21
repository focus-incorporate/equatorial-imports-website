import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateOrderEmailHTML } from '@/lib/emailService';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    console.log('Sending order confirmation email to:', orderData.customerEmail);
    console.log('Order details:', orderData);
    
    // Generate the HTML email content
    const emailHTML = generateOrderEmailHTML(orderData);
    
    // Send customer confirmation email
    const customerEmailResult = await resend.emails.send({
      from: 'Equatorial Imports <orders@resend.dev>', // Use verified domain in production
      to: [orderData.customerEmail],
      subject: `Order Confirmation - ${orderData.orderId}`,
      html: emailHTML,
    });

    console.log('Customer email sent:', customerEmailResult);

    // Send admin notification email
    const adminEmailResult = await resend.emails.send({
      from: 'Equatorial Imports <orders@resend.dev>', // Use verified domain in production
      to: ['admin@resend.dev'], // Replace with your admin email
      subject: `New Order Received - ${orderData.orderId}`,
      html: `
        <h2>New Order Notification</h2>
        <p><strong>Order ID:</strong> ${orderData.orderId}</p>
        <p><strong>Customer:</strong> ${orderData.customerName} (${orderData.customerEmail})</p>
        <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
        <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
        <hr>
        <h3>Items:</h3>
        <ul>
          ${orderData.items.map((item: any) => `
            <li>${item.name} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</li>
          `).join('')}
        </ul>
      `,
    });

    console.log('Admin notification sent:', adminEmailResult);

    return NextResponse.json({ 
      success: true, 
      message: 'Order confirmation emails sent successfully',
      orderId: orderData.orderId,
      customerEmailId: customerEmailResult.data?.id,
      adminEmailId: adminEmailResult.data?.id
    });
  } catch (error) {
    console.error('Error sending order email:', error);
    return NextResponse.json(
      { success: false, error: `Failed to send order confirmation email: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}