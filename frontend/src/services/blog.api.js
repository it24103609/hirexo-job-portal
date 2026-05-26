import api from '../api/axios';

export const blogApi = {
  list: (params = {}) => api.get('/api/blogs', { params }).then((res) => res.data),
  featured: () => api.get('/api/blogs/featured').then((res) => res.data),
  getBySlug: (slug) => api.get(`/api/blogs/${slug}`).then((res) => res.data),
  listAdmin: () => api.get('/api/admin/blogs').then((res) => res.data),
  create: (payload) => api.post('/api/blogs', payload).then((res) => res.data),
  update: (id, payload) => api.patch(`/api/blogs/${id}`, payload).then((res) => res.data),
  publish: (id) => api.patch(`/api/blogs/${id}/publish`).then((res) => res.data),
  remove: (id) => api.delete(`/api/blogs/${id}`).then((res) => res.data)
};
