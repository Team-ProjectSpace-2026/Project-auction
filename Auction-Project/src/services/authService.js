import api from "./api";

export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const updateProfilePhoto = (formData) => api.put("/auth/profile/photo", formData);
export const logout = () => api.post("/auth/logout");
