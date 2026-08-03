/**
 * Fast2SMS API Service for dispatching real SMS OTPs to Indian domestic numbers.
 * Requires FAST2SMS_API_KEY in .env (Get free API key at fast2sms.com)
 */
export const sendSmsOtp = async (mobile, otp) => {
  try {
    const cleanMobile = String(mobile || "").replace(/[^0-9]/g, "").slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      throw new Error("Invalid 10-digit mobile number");
    }

    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      // Log for local developer debugging only when API key is not configured
      console.log(`[SMS OTP DEBUG] Mobile: +91 ${cleanMobile} | OTP Code: ${otp}`);
      console.warn("FAST2SMS_API_KEY is not set in .env. Logging OTP to console for development.");
      return { success: true, simulated: true };
    }

    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
      apiKey
    )}&route=otp&variables_values=${encodeURIComponent(otp)}&numbers=${encodeURIComponent(cleanMobile)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "cache-control": "no-cache",
        },
        signal: controller.signal,
      });

      const data = await response.json();
      clearTimeout(timeoutId);

      if (data.return) {
        console.log(`[Fast2SMS Success] Real SMS dispatched to +91 ${cleanMobile}`);
        return { success: true, message: data.message };
      } else {
        console.error("[Fast2SMS Error]", data.message || data);
        return { success: false, message: data.message || "Failed to dispatch SMS" };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.error("[SMS Dispatch Timeout] Request aborted after 10 seconds");
        return { success: false, message: "SMS service request timed out" };
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[SMS Dispatch Exception]", error.message);
    return { success: false, message: error.message };
  }
};
