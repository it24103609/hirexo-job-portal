import api from '../api/axios';

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then((res) => res.data),
  reports: () => api.get('/admin/reports').then((res) => res.data),
  settings: () => api.get('/admin/settings').then((res) => res.data),
  updateSettings: (payload) => api.patch('/admin/settings', payload).then((res) => res.data),
  users: (params = {}) => api.get('/admin/users', { params }).then((res) => res.data),
  pendingJobs: (params = {}) => api.get('/admin/jobs/pending', { params }).then((res) => res.data),
  applications: (params = {}) => api.get('/admin/applications', { params }).then((res) => res.data),
  offers: () => api.get('/admin/offers').then((res) => res.data),
  approveJob: (id) => api.patch(`/admin/jobs/${id}/approve`).then((res) => res.data),
  rejectJob: (id) => api.patch(`/admin/jobs/${id}/reject`).then((res) => res.data),
  blockUser: (id) => api.patch(`/admin/users/${id}/block`).then((res) => res.data),
  unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`).then((res) => res.data)
};
