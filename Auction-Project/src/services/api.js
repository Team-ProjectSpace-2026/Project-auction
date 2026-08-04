import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send cookies with every request
});

// Attach Authorization Bearer token & Anti-CSRF headers for state-modifying requests
api.interceptors.request.use((config) => {
  config.headers["X-Requested-With"] = "XMLHttpRequest";

  // Attach token from localStorage for cross-domain Vercel+Render compatibility
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  const match = document.cookie.match(new RegExp("(^| )csrfToken=([^;]+)"));
  if (match && match[2]) {
    config.headers["X-CSRF-Token"] = match[2];
  }
  return config;
});

export default api;
