import api from '../api/axios';

export const employerApi = {
  profile: () => api.get('/employers/profile').then((res) => res.data),
  saveProfile: (payload) => api.patch('/employers/profile', payload).then((res) => res.data),
  dashboard: () => api.get('/employers/dashboard').then((res) => res.data),
  jobs: () => api.get('/employers/jobs').then((res) => res.data),
  applicants: (jobId, params = {}) => api.get(`/employers/jobs/${jobId}/applications`, { params }).then((res) => res.data),
  updateApplicantStatus: (applicationId, payload) => api.patch(`/employers/applications/${applicationId}/status`, payload).then((res) => res.data)
};
