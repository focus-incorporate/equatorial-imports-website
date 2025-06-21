interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryAddress: string;
}

export async function sendOrderConfirmationEmail(orderData: OrderEmailData) {
  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
}

export function generateOrderEmailHTML(orderData: OrderEmailData): string {
  const itemsHTML = orderData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Equatorial Imports</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8b4513, #6b3410); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing Equatorial Imports</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="margin-bottom: 25px;">
          <h2 style="color: #8b4513; margin-bottom: 10px;">Order Details</h2>
          <p><strong>Order Number:</strong> ${orderData.orderId}</p>
          <p><strong>Customer:</strong> ${orderData.customerName}</p>
          <p><strong>Email:</strong> ${orderData.customerEmail}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #8b4513; margin-bottom: 15px;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 15px; font-size: 18px; font-weight: bold; color: #8b4513;">
            Total: $${orderData.total.toFixed(2)}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #8b4513; margin-bottom: 10px;">Delivery Address</h3>
          <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 0;">
            ${orderData.deliveryAddress}
          </p>
        </div>

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin-bottom: 25px;">
          <h3 style="color: #2d5a2d; margin-top: 0;">What happens next?</h3>
          <ol style="color: #2d5a2d; margin-bottom: 0;">
            <li style="margin-bottom: 10px;"><strong>Confirmation Call:</strong> We'll contact you within 2 hours to confirm your order and delivery details.</li>
            <li style="margin-bottom: 10px;"><strong>Preparation:</strong> Your coffee will be carefully prepared and packaged for delivery.</li>
            <li style="margin-bottom: 0;"><strong>Delivery:</strong> Same-day delivery in Victoria, 1-2 days to other islands. Payment on delivery.</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            For any questions about your order, please contact us:<br>
            Email: info@equatorialimports.sc<br>
            Phone: +248 xxx xxxx
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>© 2025 Equatorial Imports - Premium Coffee Delivery in Seychelles</p>
      </div>
    </body>
    </html>
  `;
}