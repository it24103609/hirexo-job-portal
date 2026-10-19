import api from '../api/axios';

export const masterDataApi = {
  list: (type) => api.get(`/api/master-data/${type}`).then((res) => res.data),
  listPublic: (type) => api.get(`/api/master-data/public/${type}`).then((res) => res.data),
  create: (type, payload) => api.post(`/api/master-data/${type}`, payload).then((res) => res.data),
  update: (type, id, payload) => api.patch(`/api/master-data/${type}/${id}`, payload).then((res) => res.data),
  remove: (type, id) => api.delete(`/api/master-data/${type}/${id}`).then((res) => res.data)
};
