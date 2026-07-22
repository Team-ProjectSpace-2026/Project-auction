import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn('⚠️ Razorpay credentials missing in environment variables (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)');
    }

    razorpayInstance = new Razorpay({
      key_id: keyId || 'dummy_key_id',
      key_secret: keySecret || 'dummy_key_secret',
    });
  }
  return razorpayInstance;
};
