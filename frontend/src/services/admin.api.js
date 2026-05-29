import api from '../api/axios';

export const adminApi = {
  dashboard: () => api.get('/api/admin/dashboard').then((res) => res.data),
  reports: () => api.get('/api/admin/reports').then((res) => res.data),
  settings: () => api.get('/api/admin/settings').then((res) => res.data),
  updateSettings: (payload) => api.patch('/api/admin/settings', payload).then((res) => res.data),
  users: (params = {}) => api.get('/api/admin/users', { params }).then((res) => res.data),
  pendingJobs: (params = {}) => api.get('/api/admin/jobs/pending', { params }).then((res) => res.data),
  applications: (params = {}) => api.get('/api/admin/applications', { params }).then((res) => res.data),
  offers: () => api.get('/api/admin/offers').then((res) => res.data),
  approveJob: (id) => api.patch(`/api/admin/jobs/${id}/approve`).then((res) => res.data),
  rejectJob: (id) => api.patch(`/api/admin/jobs/${id}/reject`).then((res) => res.data),
  blockUser: (id) => api.patch(`/api/admin/users/${id}/block`).then((res) => res.data),
  unblockUser: (id) => api.patch(`/api/admin/users/${id}/unblock`).then((res) => res.data)
};
