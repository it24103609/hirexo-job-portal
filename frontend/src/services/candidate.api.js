import api from '../api/axios';

export const candidateApi = {
  profile: () => api.get('/candidates/profile').then((res) => res.data),
  saveProfile: (payload) => api.patch('/candidates/profile', payload).then((res) => res.data),
  uploadResume: (formData) => api.post('/candidates/resume', formData).then((res) => res.data),
  downloadResume: async () => {
    const response = await api.get('/candidates/resume/download', { responseType: 'blob' });
    return response.data;
  },
  getResume: () => api.get('/candidates/resume').then((res) => res.data),
  deleteResume: () => api.delete('/candidates/resume').then((res) => res.data),
  savedJobs: () => api.get('/candidates/saved-jobs').then((res) => res.data),
  saveJob: (jobId) => api.post(`/candidates/saved-jobs/${jobId}`).then((res) => res.data),
  unsaveJob: (jobId) => api.delete(`/candidates/saved-jobs/${jobId}`).then((res) => res.data)
};
