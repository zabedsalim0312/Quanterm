import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const skip = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/forgot-password', '/api/auth/reset-password'];
    if (error.response?.status === 401 && !original._retry && !skip.some((p) => original.url?.includes(p))) {
      original._retry = true;
      refreshPromise = refreshPromise || api.post('/api/auth/refresh');
      try {
        await refreshPromise;
        refreshPromise = null;
        return api(original);
      } catch (err) {
        refreshPromise = null;
        throw err;
      }
    }
    throw error;
  }
);

export default api;
