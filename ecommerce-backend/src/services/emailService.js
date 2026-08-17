import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || 587;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('Email credentials not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const transporter = createTransporter();

const sendOrderConfirmationEmail = async (user, order) => {
  if (!transporter) {
    console.log('Email not configured. Order confirmation would be sent to:', user.email);
    return { success: false, reason: 'Email not configured' };
  }

  const orderItemsList = order.orderItems
    .map((item) => `  • ${item.qty} x ${item.name} - $${(item.price * item.qty).toFixed(2)}`)
    .join('\n');

  const mailOptions = {
    from: `"ShopZone" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Order Confirmation - #${order._id}`,
    text: `
Hello ${user.name},

Thank you for your order! We've received your order and it's being processed.

ORDER DETAILS
Order ID: ${order._id}
Date: ${new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}

Shipping Address:
${order.shippingAddress.address}
${order.shippingAddress.city}, ${order.shippingAddress.postalCode}
${order.shippingAddress.country}

Items:
${orderItemsList}

Subtotal: $${order.itemsPrice.toFixed(2)}
Tax: $${order.taxPrice.toFixed(2)}
Shipping: $${order.shippingPrice.toFixed(2)}
Total: $${order.totalPrice.toFixed(2)}

Payment Method: ${order.paymentMethod}
Payment Status: ${order.isPaid ? 'Paid' : 'Pending'}

We'll notify you when your order has been shipped.

Thank you for shopping with us!

Best regards,
The ShopZone Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .order-items { margin: 20px 0; }
    .order-item { padding: 10px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 18px; font-weight: bold; color: #22c55e; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hello ${user.name},</p>
      <p>Thank you for your order! We've received your order and it's being processed.</p>
      
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</p>
      
      <h3>Shipping Address:</h3>
      <p>${order.shippingAddress.address}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
      ${order.shippingAddress.country}</p>
      
      <div class="order-items">
        <h3>Items:</h3>
        ${order.orderItems
          .map(
            (item) => `
          <div class="order-item">
            <strong>${item.name}</strong><br>
            Quantity: ${item.qty} × $${item.price.toFixed(2)} = $${(item.price * item.qty).toFixed(2)}
          </div>
        `
          )
          .join('')}
      </div>
      
      <p><strong>Subtotal:</strong> $${order.itemsPrice.toFixed(2)}</p>
      <p><strong>Tax:</strong> $${order.taxPrice.toFixed(2)}</p>
      <p><strong>Shipping:</strong> $${order.shippingPrice.toFixed(2)}</p>
      <p class="total">Total: $${order.totalPrice.toFixed(2)}</p>
      
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Payment Status:</strong> ${order.isPaid ? 'Paid' : 'Pending'}</p>
      
      <p>We'll notify you when your order has been shipped.</p>
    </div>
    <div class="footer">
      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br>The ShopZone Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error.message);
    return { success: false, reason: error.message };
  }
};

const sendOrderStatusEmail = async (user, order, status) => {
  if (!transporter) {
    console.log('Email not configured. Order status update would be sent to:', user.email);
    return { success: false, reason: 'Email not configured' };
  }

  const statusMessages = {
    shipped: 'Your order has been shipped!',
    delivered: 'Your order has been delivered!',
    cancelled: 'Your order has been cancelled.',
    refunded: 'Your order has been refunded.',
  };

  const mailOptions = {
    from: `"ShopZone" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Order Update - #${order._id}`,
    text: `
Hello ${user.name},

${statusMessages[status] || 'Your order status has been updated.'}

Order ID: ${order._id}
Status: ${status}

${status === 'refunded' ? `\nRefund Amount: $${order.refundAmount?.toFixed(2) || order.totalPrice.toFixed(2)}` : ''}
${status === 'cancelled' ? `\nReason: ${order.cancellationReason || 'No reason provided'}` : ''}

Thank you for shopping with us!

Best regards,
The ShopZone Team
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order status email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order status email:', error.message);
    return { success: false, reason: error.message };
  }
};

export { sendOrderConfirmationEmail, sendOrderStatusEmail };
