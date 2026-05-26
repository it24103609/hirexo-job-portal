import api from '../api/axios';

export const contactApi = {
  submit: (payload) => api.post('/contacts', payload).then((res) => res.data),
  list: (params = {}) => api.get('/contacts', { params }).then((res) => res.data),
  getById: (id) => api.get(`/api/contacts/${id}`).then((res) => res.data),
  reply: (id, payload) => api.patch(`/api/contacts/${id}/reply`, payload).then((res) => res.data),
  updateStatus: (id, payload) => api.patch(`/api/contacts/${id}/status`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/api/contacts/${id}`).then((res) => res.data)
};
