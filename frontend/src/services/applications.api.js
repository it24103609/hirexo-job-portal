import api from '../api/axios';

export const applicationsApi = {
  apply: (payload) => api.post('/applications', payload).then((res) => res.data),
  mine: () => api.get('/applications/my').then((res) => res.data),
  byJob: (jobId) => api.get(`/applications/job/${jobId}`).then((res) => res.data),
  getById: (applicationId) => api.get(`/applications/${applicationId}`).then((res) => res.data),
  messages: (applicationId) => api.get(`/applications/${applicationId}/messages`).then((res) => res.data),
  sendMessage: (applicationId, payload) => api.post(`/applications/${applicationId}/messages`, payload).then((res) => res.data),
  downloadResume: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}/resume`, { responseType: 'blob' });
    return response.data;
  },
  updateStatus: (id, payload) => api.patch(`/applications/${id}/status`, payload).then((res) => res.data)
};
