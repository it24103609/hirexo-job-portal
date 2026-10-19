import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, ''),
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('HEXORA_access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message =
      error?.response?.data?.message ||
      error.message ||
      'Something went wrong';

    if (error?.code === 'ERR_NETWORK') {
      message =
        'Backend server is not reachable. Please check if the API is running.';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
