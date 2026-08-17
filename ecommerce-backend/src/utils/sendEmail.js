import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });

  return transporter;
}

export const sendEmail = async (to, subject, html) => {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[EMAIL] SMTP not configured. Skipping email to:', to);
    return false;
  }

  try {
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

    await transport.sendMail({
      from: `"ShopZone" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Sent successfully to: ${to}, subject: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send to: ${to}, subject: ${subject}, error: ${error.message}`);
    return false;
  }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">ShopZone Ecommerce</p>
    </div>
  `;

  return sendEmail(user.email, subject, html);
};

export default getTransporter;
