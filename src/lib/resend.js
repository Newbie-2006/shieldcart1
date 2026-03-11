import { Resend } from 'resend';

let resend = null;

function getResend() {
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@shieldcart.in';

export async function sendInspectionPassedEmail({ to, customerName, orderDetails, certificateBuffer }) {
    const attachments = [];
    if (certificateBuffer) {
        attachments.push({
            filename: `ShieldCart_Certificate_${orderDetails.orderId}.pdf`,
            content: certificateBuffer,
        });
    }

    return getResend().emails.send({
        from: `ShieldCart <${FROM_EMAIL}>`,
        to,
        subject: `✅ Your order has passed inspection — ${orderDetails.productName}`,
        html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F9FAFB; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: Georgia, serif; color: #111827; font-size: 24px; margin: 0;">
            Shield<span style="color: #2563EB;">Cart</span>
          </h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px;">
          <h2 style="color: #5c6b3a; font-size: 18px; margin: 0 0 8px;">✅ Inspection Passed</h2>
          <p style="color: #7a6e62; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${customerName},<br><br>
            Great news! Your order <strong>${orderDetails.productName}</strong> from <strong>${orderDetails.platform}</strong> has passed our physical inspection and is on its way to you.
          </p>
          <div style="background: #edf0e6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="font-size: 13px; color: #1D4ED8; margin: 0;">
              <strong>Order ID:</strong> ${orderDetails.orderId}<br>
              <strong>Product:</strong> ${orderDetails.productName}<br>
              <strong>Platform:</strong> ${orderDetails.platform}<br>
              <strong>Inspector:</strong> ${orderDetails.inspectorName}<br>
              <strong>Inspected at:</strong> ${new Date().toLocaleString('en-IN')}
            </p>
          </div>
          <p style="color: #7a6e62; font-size: 13px; margin: 0;">
            Your inspection certificate is attached to this email. You can also download it from your dashboard.
          </p>
        </div>
        <p style="text-align: center; color: #a09488; font-size: 12px; margin-top: 24px;">
          ShieldCart — Consumer Safety Platform
        </p>
      </div>
    `,
        attachments,
    });
}

export async function sendOrderUpdateEmail({ to, customerName, productName, status }) {
    const statusMessages = {
        ordered: 'Your order has been placed and is being processed.',
        arrived: 'Your order has arrived at our inspection hub.',
        inspecting: 'Our inspectors are currently checking your product.',
        passed: 'Your product has passed inspection!',
        failed: 'Your product did not pass inspection. We will handle the return.',
        dispatched: 'Your verified product has been dispatched to your address.',
        delivered: 'Your order has been delivered.',
    };

    const statusColors = {
        ordered: '#9a7c3f',
        arrived: '#9a7c3f',
        inspecting: '#5c6b3a',
        passed: '#5c6b3a',
        failed: '#b04040',
        dispatched: '#5c6b3a',
        delivered: '#5c6b3a',
    };

    return getResend().emails.send({
        from: `ShieldCart <${FROM_EMAIL}>`,
        to,
        subject: `📦 Order Update: ${productName} — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html: `
      <div style="font-family: 'Manrope', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf7f2; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: Georgia, serif; color: #3b2f1e; font-size: 24px; margin: 0;">
            Shield<span style="color: #5c6b3a;">Cart</span>
          </h1>
        </div>
        <div style="background: #fff; border: 1px solid #ddd0bc; border-radius: 16px; padding: 32px;">
          <h2 style="color: ${statusColors[status] || '#3b2f1e'}; font-size: 18px; margin: 0 0 16px;">
            Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
          </h2>
          <p style="color: #7a6e62; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${customerName},<br><br>
            ${statusMessages[status] || 'Your order status has been updated.'}
          </p>
          <p style="color: #3b2f1e; font-weight: 600; font-size: 14px; margin: 0;">
            Product: ${productName}
          </p>
        </div>
        <p style="text-align: center; color: #a09488; font-size: 12px; margin-top: 24px;">
          ShieldCart — Consumer Safety Platform
        </p>
      </div>
    `,
    });
}

export { getResend as resend };
