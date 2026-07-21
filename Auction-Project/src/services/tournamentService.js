import api from "./api";

export const getTournaments = () => api.get("/tournaments");
export const getTournament = (id) => api.get(`/tournaments/${id}`);
export const createTournament = (data) => api.post("/tournaments", data);
export const updateTournament = (id, data) =>
  api.put(`/tournaments/${id}`, data);
export const updateRegistrationDeadline = (id, data) =>
  api.put(`/tournaments/${id}/deadline`, data);
export const deleteTournament = (id) => api.delete(`/tournaments/${id}`);

// Public endpoint — no auth required (for landing page)
export const getPublicRecentTournaments = () =>
  api.get("/tournaments/public/recent");

