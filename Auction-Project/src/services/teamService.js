import api from "./api";

export const getTeams = (tournamentId) => {
  const params = tournamentId ? { tournamentId } : {};
  return api.get("/teams", { params });
};
export const getTeam = (id, opts) => api.get(`/teams/${id}`, opts);
export const createTeam = (data) => api.post("/teams", data);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
