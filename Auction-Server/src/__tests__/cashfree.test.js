import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import crypto from 'crypto';
import { getCashfreeConfig, verifyCashfreeWebhookSignature } from '../config/cashfree.js';

describe('Cashfree Configuration & Webhook Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('getCashfreeConfig returns SANDBOX URL when env is TEST', () => {
    process.env.CASHFREE_APP_ID = 'test_app_id';
    process.env.CASHFREE_SECRET_KEY = 'test_secret_key';
    process.env.CASHFREE_ENV = 'TEST';

    const config = getCashfreeConfig();
    expect(config.appId).toBe('test_app_id');
    expect(config.secretKey).toBe('test_secret_key');
    expect(config.env).toBe('TEST');
    expect(config.baseUrl).toBe('https://sandbox.cashfree.com/pg');
  });

  test('getCashfreeConfig returns PROD URL when env is PROD', () => {
    process.env.CASHFREE_APP_ID = 'prod_app_id';
    process.env.CASHFREE_SECRET_KEY = 'prod_secret_key';
    process.env.CASHFREE_ENV = 'PROD';

    const config = getCashfreeConfig();
    expect(config.appId).toBe('prod_app_id');
    expect(config.env).toBe('PROD');
    expect(config.baseUrl).toBe('https://api.cashfree.com/pg');
  });

  test('verifyCashfreeWebhookSignature verifies HMAC SHA256 signature correctly', () => {
    process.env.CASHFREE_SECRET_KEY = 'secret123';
    const timestamp = '1600000000';
    const rawBody = '{"order_id":"123","order_status":"PAID"}';

    const expectedSig = crypto
      .createHmac('sha256', 'secret123')
      .update(timestamp + rawBody)
      .digest('base64');

    const isValid = verifyCashfreeWebhookSignature(expectedSig, rawBody, timestamp);
    expect(isValid).toBe(true);

    const isInvalid = verifyCashfreeWebhookSignature('wrong_signature', rawBody, timestamp);
    expect(isInvalid).toBe(false);
  });
});
