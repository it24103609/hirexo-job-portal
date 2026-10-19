import api from '../api/axios';

export const candidateApi = {
  profile: () => api.get('/api/candidates/profile').then((res) => res.data),
  saveProfile: (payload) => api.patch('/api/candidates/profile', payload).then((res) => res.data),
  uploadProfilePicture: (formData) => api.post('/api/candidates/profile-picture', formData).then((res) => res.data),
  downloadProfilePicture: async (cacheKey = '') => {
    const suffix = cacheKey ? `?t=${encodeURIComponent(cacheKey)}` : '';
    const response = await api.get(`/api/candidates/profile-picture/download${suffix}`, { responseType: 'blob' });
    return response.data;
  },
  getProfilePicture: () => api.get('/api/candidates/profile-picture').then((res) => res.data),
  deleteProfilePicture: () => api.delete('/api/candidates/profile-picture').then((res) => res.data),
  uploadResume: (formData) => api.post('/api/candidates/resume', formData).then((res) => res.data),
  downloadResume: async () => {
    const response = await api.get('/api/candidates/resume/download', { responseType: 'blob' });
    return response.data;
  },
  getResume: () => api.get('/api/candidates/resume').then((res) => res.data),
  deleteResume: () => api.delete('/api/candidates/resume').then((res) => res.data),
  offers: () => api.get('/api/candidates/offers').then((res) => res.data),
  respondToOffer: (offerId, payload) => api.patch(`/api/candidates/offers/${offerId}/respond`, payload).then((res) => res.data),
  savedJobs: () => api.get('/api/candidates/saved-jobs').then((res) => res.data),
  saveJob: (jobId) => api.post(`/api/candidates/saved-jobs/${jobId}`).then((res) => res.data),
  unsaveJob: (jobId) => api.delete(`/api/candidates/saved-jobs/${jobId}`).then((res) => res.data)
};
