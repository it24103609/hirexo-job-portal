import api from '../api/axios';

export const notificationsApi = {
  mine: (params = {}) => api.get('/api/notifications/my', { params }).then((res) => res.data),
  preferences: () => api.get('/api/notifications/preferences').then((res) => res.data),
  updatePreferences: (payload) => api.patch('/api/notifications/preferences', payload).then((res) => res.data),
  processReminders: () => api.post('/api/notifications/process-reminders').then((res) => res.data),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`).then((res) => res.data),
  markAllRead: () => api.patch('/api/notifications/read-all').then((res) => res.data)
};
