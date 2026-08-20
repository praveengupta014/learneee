import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach the JWT from localStorage to every request. This is what makes
// auth stateless on the client too -- no server session to keep in sync.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("learniee_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
