import api from '../api/axios';

export const contactApi = {
  submit: (payload) => api.post('/contacts', payload).then((res) => res.data),
  list: (params = {}) => api.get('/contacts', { params }).then((res) => res.data),
  getById: (id) => api.get(`/contacts/${id}`).then((res) => res.data),
  reply: (id, payload) => api.patch(`/contacts/${id}/reply`, payload).then((res) => res.data),
  updateStatus: (id, payload) => api.patch(`/contacts/${id}/status`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/contacts/${id}`).then((res) => res.data)
};
