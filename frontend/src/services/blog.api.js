import api from '../api/axios';

export const blogApi = {
  list: (params = {}) => api.get('/blogs', { params }).then((res) => res.data),
  featured: () => api.get('/blogs/featured').then((res) => res.data),
  getBySlug: (slug) => api.get(`/blogs/${slug}`).then((res) => res.data),
  listAdmin: () => api.get('/admin/blogs').then((res) => res.data),
  create: (payload) => api.post('/blogs', payload).then((res) => res.data),
  update: (id, payload) => api.patch(`/blogs/${id}`, payload).then((res) => res.data),
  publish: (id) => api.patch(`/blogs/${id}/publish`).then((res) => res.data),
  remove: (id) => api.delete(`/blogs/${id}`).then((res) => res.data)
};
