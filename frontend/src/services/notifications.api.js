import api from '../api/axios';

export const notificationsApi = {
  mine: (params = {}) => api.get('/notifications/my', { params }).then((res) => res.data),
  preferences: () => api.get('/notifications/preferences').then((res) => res.data),
  updatePreferences: (payload) => api.patch('/notifications/preferences', payload).then((res) => res.data),
  processReminders: () => api.post('/notifications/process-reminders').then((res) => res.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllRead: () => api.patch('/notifications/read-all').then((res) => res.data)
};
