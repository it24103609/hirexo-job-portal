import api from '../api/axios';

export const jobsApi = {
  list: (params = {}) => api.get('/api/jobs', { params }).then((res) => res.data),
  featured: () => api.get('/api/jobs/featured').then((res) => res.data),
  getBySlug: (slug) => api.get(`/api/jobs/${slug}`).then((res) => res.data),
  create: (payload) => api.post('/api/jobs', payload).then((res) => res.data),
  update: (id, payload) => api.patch(`/api/jobs/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/api/jobs/${id}`).then((res) => res.data)
};
