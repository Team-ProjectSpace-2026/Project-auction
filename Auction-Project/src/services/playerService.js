import api from "./api";

export const getPlayers = (tournamentId) =>
  api.get("/players", { params: tournamentId ? { tournamentId } : {} });

export const getPlayer = (id) => api.get(`/players/${id}`);

export const getRegisteredPlayers = (tournamentId) =>
  api.get(`/players/registered/${tournamentId}`);

export const createPlayer = (data) => api.post("/players", data);

export const updatePlayer = (id, data) => api.put(`/players/${id}`, data);

export const deletePlayer = (id) => api.delete(`/players/${id}`);

export const registerPlayer = (tournamentId, data) =>
  api.post(`/players/register/${tournamentId}`, data);
export const getPublicTournament = (tournamentId) =>
  api.get(`/players/public/${tournamentId}`);
