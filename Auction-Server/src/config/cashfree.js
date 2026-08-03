import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export const getCashfreeConfig = () => {
  const appId = process.env.CASHFREE_APP_ID || '';
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const env = (process.env.CASHFREE_ENV || 'TEST').toUpperCase();

  const baseUrl = env === 'PROD' || env === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

  return { appId, secretKey, env, baseUrl };
};

/**
 * Create Cashfree Order via REST API (/pg/orders)
 */
export const createCashfreeOrder = async ({ orderId, orderAmount, orderCurrency = 'INR', customerId, customerName, customerEmail, customerPhone, returnUrl, notifyUrl }) => {
  const { appId, secretKey, baseUrl } = getCashfreeConfig();

  if (!appId || !secretKey) {
    throw new Error('Cashfree credentials missing in environment variables (CASHFREE_APP_ID / CASHFREE_SECRET_KEY)');
  }

  const payload = {
    order_id: orderId,
    order_amount: Number(orderAmount),
    order_currency: orderCurrency,
    customer_details: {
      customer_id: String(customerId || 'cust_' + Date.now()).slice(0, 50),
      customer_name: customerName || 'Player',
      customer_email: customerEmail || 'customer@example.com',
      customer_phone: customerPhone || '9999999999'
    },
    order_meta: {
      return_url: returnUrl || 'http://localhost:5173/payment-success?order_id={order_id}',
      notify_url: notifyUrl || ''
    }
  };

  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': appId,
      'x-client-secret': secretKey
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Cashfree Order creation failed');
  }

  return data;
};

/**
 * Verify Cashfree Webhook Signature Header (x-webhook-signature)
 */
export const verifyCashfreeWebhookSignature = (signature, rawBody, timestamp) => {
  const { secretKey } = getCashfreeConfig();
  const data = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(data)
    .digest('base64');

  return expectedSignature === signature;
};
