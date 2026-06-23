import api from "./api";

export const getAuctionState = (tournamentId) =>
  api.get(`/auction/${tournamentId}`);
export const placeBid = (tournamentId, data) =>
  api.post(`/auction/${tournamentId}/bid`, data);