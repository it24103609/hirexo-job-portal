import api from '../api/axios';

export const applicationsApi = {
  apply: (payload) => api.post('/api/applications', payload).then((res) => res.data),
  mine: () => api.get('/api/applications/my').then((res) => res.data),
  byJob: (jobId) => api.get(`/api/applications/job/${jobId}`).then((res) => res.data),
  getById: (applicationId) => api.get(`/api/applications/${applicationId}`).then((res) => res.data),
  bookInterviewSlot: (applicationId, payload) => api.post(`/api/applications/${applicationId}/book-slot`, payload).then((res) => res.data),
  requestReschedule: (applicationId, payload) => api.patch(`/api/applications/${applicationId}/request-reschedule`, payload).then((res) => res.data),
  messages: (applicationId) => api.get(`/api/applications/${applicationId}/messages`).then((res) => res.data),
  sendMessage: (applicationId, payload, file) => {
    if (file) {
      const formData = new FormData();
      formData.append('attachment', file);
      if (payload.message) formData.append('message', payload.message);
      if (payload.recipientRole) formData.append('recipientRole', payload.recipientRole);
      if (payload.recipientUserId) formData.append('recipientUserId', payload.recipientUserId);
      return api.post(`/api/applications/${applicationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((res) => res.data);
    }
    return api.post(`/api/applications/${applicationId}/messages`, payload).then((res) => res.data);
  },
  downloadResume: async (applicationId) => {
    const response = await api.get(`/api/applications/${applicationId}/resume`, { responseType: 'blob' });
    return response.data;
  },
  downloadMessageAttachment: (applicationId, messageId) => {
    return api.get(`/api/applications/${applicationId}/messages/${messageId}/attachment`, { responseType: 'blob' });
  },
  updateStatus: (id, payload) => api.patch(`/api/applications/${id}/status`, payload).then((res) => res.data)
};
