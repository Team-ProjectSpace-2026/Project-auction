import api from "./api";

export const createPaymentOrder = async (tournamentId) => {
  const response = await api.post("/payment/create-order", { tournamentId });
  return response.data;
};

export const verifyPaymentSignature = async (paymentData) => {
  const response = await api.post("/payment/verify-payment", paymentData);
  return response.data;
};
