import api from '../api/axios';

export const authApi = {
  login: (payload) => api.post('/api/auth/login', payload).then((res) => res.data),
  registerCandidate: (payload) => api.post('/api/auth/register/candidate', payload).then((res) => res.data),
  registerEmployer: (payload) => api.post('/api/auth/register/employer', payload).then((res) => res.data),
  refreshToken: (payload) => api.post('/api/auth/refresh-token', payload).then((res) => res.data),
  forgotPassword: (payload) => api.post('/api/auth/forgot-password', payload).then((res) => res.data),
  resetPassword: (payload) => api.post('/api/auth/reset-password', payload).then((res) => res.data),
  me: () => api.get('/api/auth/me').then((res) => res.data),
  changePassword: (payload) => api.patch('/api/auth/change-password', payload).then((res) => res.data)
};
