import api from "./api";

export const getPlayers = () => api.get("/players");
export const createPlayer = (data) => api.post("/players", data);
export const updatePlayer = (id, data) => api.put(`/players/${id}`, data);
export const deletePlayer = (id) => api.delete(`/players/${id}`);
export const registerPlayer = (tournamentId, data) =>
  api.post(`/players/register/${tournamentId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
