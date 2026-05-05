import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, ''),
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hirexo_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message = error?.response?.data?.message || error.message || 'Something went wrong';

    if (error?.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const payload = text ? JSON.parse(text) : null;
        message = payload?.message || message;
      } catch {
        // Keep the original network/HTTP error message for non-JSON blob responses.
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
