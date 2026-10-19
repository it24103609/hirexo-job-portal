import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, ''),
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('HEXORA_access_token');

  console.log('====================');
  console.log('REQUEST URL:', config.url);
  console.log('TOKEN:', token);
  console.log('====================');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    console.log(
      'AUTH HEADER:',
      config.headers.Authorization
    );
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API ERROR:', error?.response);
    
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