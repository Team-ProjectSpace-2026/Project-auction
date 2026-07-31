import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase";

/**
 * Setup Firebase invisible reCAPTCHA on a button or container div ID
 */
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved successfully
        },
        "expired-callback": () => {
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        },
      }
    );
  }
  return window.recaptchaVerifier;
};

/**
 * Send SMS OTP to phone number (+91XXXXXXXXXX)
 */
export const sendPhoneOtp = async (phoneNumber, containerId = "recaptcha-container") => {
  try {
    // Format to E.164 standard (+91 for India domestic numbers)
    let formattedPhone = String(phoneNumber || "").trim();
    if (!formattedPhone.startsWith("+")) {
      const cleanDigits = formattedPhone.replace(/[^0-9]/g, "").slice(-10);
      if (cleanDigits.length < 10) {
        throw new Error("Please enter a valid 10-digit mobile number");
      }
      formattedPhone = "+91" + cleanDigits;
    }

    const appVerifier = setupRecaptcha(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    
    // Store confirmationResult globally to verify the code later
    window.confirmationResult = confirmationResult;
    return { success: true, confirmationResult };
  } catch (error) {
    console.error("Firebase SMS Dispatch Error:", error);
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    throw error;
  }
};

/**
 * Verify 6-digit OTP code typed by user
 */
export const verifyPhoneOtp = async (otpCode) => {
  try {
    if (!window.confirmationResult) {
      throw new Error("No active SMS verification session. Please request a new OTP.");
    }
    const result = await window.confirmationResult.confirm(otpCode);
    const user = result.user; // Verified Firebase User object!
    return { success: true, user };
  } catch (error) {
    console.error("OTP Code Verification Error:", error);
    throw new Error("Invalid or expired SMS OTP code. Please check and try again.");
  }
};
