import api from "./api";

/**
 * Dynamically load & initialize Cashfree JS SDK v3 with CDN fallback
 * @param {string} env - 'PROD' | 'PRODUCTION' | 'TEST'
 */
export const loadCashfreeSDK = (env = "TEST") => {
  return new Promise((resolve, reject) => {
    const isProduction = String(env).toUpperCase() === "PROD" || String(env).toUpperCase() === "PRODUCTION";
    const mode = isProduction ? "production" : "sandbox";

    const getSDKInstance = () => {
      try {
        if (typeof window.Cashfree === "function") {
          return window.Cashfree({ mode });
        }
        if (window.Cashfree && typeof window.Cashfree.checkout === "function") {
          return window.Cashfree;
        }
      } catch (e) {
        console.warn("Cashfree constructor invocation note:", e);
      }
      return null;
    };

    const existingInstance = getSDKInstance();
    if (existingInstance) {
      return resolve(existingInstance);
    }

    const primaryUrl = "https://sdk.cashfree.com/js/v3/cashfree.js";
    const fallbackUrl = "https://sdk.cashfreepayments.com/js/v3/cashfree.js";

    const loadScript = (url, isFallback = false) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => {
        const instance = getSDKInstance();
        if (instance) {
          resolve(instance);
        } else {
          reject(new Error("Cashfree SDK loaded but failed to initialize instance."));
        }
      };
      script.onerror = () => {
        if (!isFallback) {
          script.remove();
          loadScript(fallbackUrl, true);
        } else {
          reject(new Error("Failed to load Cashfree JS SDK from primary or fallback CDN."));
        }
      };
      document.body.appendChild(script);
    };

    loadScript(primaryUrl, false);
  });
};

/**
 * Initiate Cashfree payment transaction for tournament hosting fee or player registration fee
 */
export const initiateCashfreePayment = async ({ tournamentId, numTeams, amount, type = 'tournament_hosting', firstname, email, phone }) => {
  const response = await api.post("/payment/initiate-payment", {
    tournamentId,
    numTeams,
    amount,
    type,
    firstname,
    email,
    phone
  });
  return response.data;
};

/**
 * Backward-compatible alias
 */
export const createPaymentOrder = async (tournamentId) => {
  return initiateCashfreePayment({ tournamentId, type: 'player_registration' });
};

/**
 * Verify Cashfree Payment Status
 */
export const verifyPaymentSignature = async (orderId) => {
  const response = await api.post("/payment/verify-payment", { orderId });
  return response.data;
};

/**
 * Initiate Cashfree payment for player registration (public, no auth)
 */
export const initiatePlayerPayment = async ({ tournamentId, firstname, email, phone }) => {
  const response = await api.post("/payment/public/initiate-player-payment", {
    tournamentId,
    firstname,
    email,
    phone
  });
  return response.data;
};

/**
 * Verify Cashfree payment for player registration (public, no auth)
 */
export const verifyPlayerPaymentPublic = async (orderId) => {
  const response = await api.post("/payment/public/verify-player-payment", { orderId });
  return response.data;
};
