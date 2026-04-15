import api from '../api/axios';

export const masterDataApi = {
  list: (type) => api.get(`/master-data/${type}`).then((res) => res.data),
  listPublic: (type) => api.get(`/master-data/public/${type}`).then((res) => res.data),
  create: (type, payload) => api.post(`/master-data/${type}`, payload).then((res) => res.data),
  update: (type, id, payload) => api.patch(`/master-data/${type}/${id}`, payload).then((res) => res.data),
  remove: (type, id) => api.delete(`/master-data/${type}/${id}`).then((res) => res.data)
};
