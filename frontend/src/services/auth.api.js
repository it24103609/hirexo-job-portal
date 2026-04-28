import api from '../api/axios';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  registerCandidate: (payload) => api.post('/auth/register/candidate', payload).then((res) => res.data),
  registerEmployer: (payload) => api.post('/auth/register/employer', payload).then((res) => res.data),
  refreshToken: (payload) => api.post('/auth/refresh-token', payload).then((res) => res.data),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then((res) => res.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  changePassword: (payload) => api.patch('/auth/change-password', payload).then((res) => res.data)
};
