import api from '../api/axios';

export const notificationsApi = {
  mine: (params = {}) => api.get('/notifications/my', { params }).then((res) => res.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllRead: () => api.patch('/notifications/read-all').then((res) => res.data)
};