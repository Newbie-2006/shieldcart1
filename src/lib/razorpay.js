import Razorpay from 'razorpay';

let razorpayInstance = null;

export function getRazorpay() {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
}

export function verifyWebhookSignature(body, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    return expectedSignature === signature;
}

export function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const crypto = require('crypto');
    const generated = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    return generated === razorpay_signature;
}
