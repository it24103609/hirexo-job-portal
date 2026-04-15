import api from '../api/axios';

export const jobsApi = {
  list: (params = {}) => api.get('/jobs', { params }).then((res) => res.data),
  featured: () => api.get('/jobs/featured').then((res) => res.data),
  getBySlug: (slug) => api.get(`/jobs/${slug}`).then((res) => res.data),
  create: (payload) => api.post('/jobs', payload).then((res) => res.data),
  update: (id, payload) => api.patch(`/jobs/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((res) => res.data)
};
