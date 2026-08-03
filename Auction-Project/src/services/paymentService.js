import api from "./api";

/**
 * Dynamically load Cashfree JS SDK v3
 */
export const loadCashfreeSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      return resolve(window.Cashfree);
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfreepayments.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) resolve(window.Cashfree);
      else reject(new Error("Cashfree SDK failed to initialize"));
    };
    script.onerror = () => reject(new Error("Failed to load Cashfree JS SDK"));
    document.body.appendChild(script);
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
