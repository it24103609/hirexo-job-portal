import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';
import { applicationsApi } from '../../services/applications.api';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/formatters';

export default function EmployerApplicantsPage() {
  const { jobId } = useParams();
  const [state, setState] = useState({ loading: true, job: null, applications: [] });
  const [filters, setFilters] = useState({ keyword: '', skills: '', minExperience: '', education: '' });

  const loadApplicants = async (nextFilters = filters) => {
    const res = await employerApi.applicants(jobId, nextFilters);
    setState({ loading: false, job: res.data?.job || null, applications: res.data?.applications || [] });
  };

  const refreshApplicants = async (nextFilters = filters) => {
    setState((current) => ({ ...current, loading: true }));
    await loadApplicants(nextFilters);
  };

  useEffect(() => {
    loadApplicants().catch(() => setState({ loading: false, job: null, applications: [] }));
  }, [jobId]);

  if (state.loading) return <Loader label="Loading applicants..." />;

  return (
    <>
      <Seo title="Applicants | Hirexo" description="Review applicants for your job." />
      <DashboardHeader title="Applicants" description={state.job ? `${state.job.title} - applicant pool` : 'Applicant pool for your job'} />
      <Card>
        <div className="grid-4">
          <Input label="Keyword" value={filters.keyword} onChange={(e) => setFilters((current) => ({ ...current, keyword: e.target.value }))} placeholder="Name, email, headline" />
          <Input label="Skills" value={filters.skills} onChange={(e) => setFilters((current) => ({ ...current, skills: e.target.value }))} placeholder="React, Node.js" />
          <Input label="Min experience" type="number" value={filters.minExperience} onChange={(e) => setFilters((current) => ({ ...current, minExperience: e.target.value }))} placeholder="2" />
          <Input label="Education keyword" value={filters.education} onChange={(e) => setFilters((current) => ({ ...current, education: e.target.value }))} placeholder="B.Tech, MBA" />
        </div>
        <div className="dashboard-actions">
          <Button variant="secondary" onClick={async () => { await refreshApplicants(filters); }}>Apply filters</Button>
          <Button variant="ghost" onClick={async () => {
            const cleared = { keyword: '', skills: '', minExperience: '', education: '' };
            setFilters(cleared);
            await refreshApplicants(cleared);
          }}>Clear</Button>
        </div>
      </Card>
      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Candidate</th><th>Profile</th><th>Status</th><th>Resume</th><th>Action</th></tr></thead>
            <tbody>
              {state.applications.length ? state.applications.map((application) => (
                <tr key={application._id}>
                  <td>{application.candidateUser?.name || 'Candidate'}</td>
                  <td>
                    <small>
                      Skills: {(application.candidateProfile?.skills || []).slice(0, 4).join(', ') || '-'}
                      <br />
                      Experience: {application.candidateProfile?.experienceYears ?? 0} years
                    </small>
                  </td>
                  <td><Badge tone={application.status === 'shortlisted' ? 'success' : 'neutral'}>{application.status}</Badge></td>
                  <td>{application.resumeSnapshot?.fileName || '-'}</td>
                  <td>
                    <div className="form-links">
                      <Select defaultValue={application.status} onChange={async (e) => {
                        await employerApi.updateApplicantStatus(application._id, { status: e.target.value });
                        toast.success('Status updated');
                        await loadApplicants(filters);
                      }}>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                      <Button variant="secondary" size="sm" onClick={async () => {
                        const input = window.prompt('Interview date/time (YYYY-MM-DDTHH:mm), e.g. 2026-04-20T14:30');
                        if (!input) return;
                        const mode = window.prompt('Interview mode: phone | video | onsite', 'video') || 'video';
                        const location = window.prompt('Interview location / meeting details', 'Google Meet');
                        await employerApi.updateApplicantStatus(application._id, {
                          status: 'interview_scheduled',
                          interviewScheduledAt: input,
                          interviewMode: mode,
                          interviewLocation: location || ''
                        });
                        toast.success('Interview scheduled');
                        await loadApplicants(filters);
                      }}>Schedule interview</Button>
                      <Button variant="secondary" size="sm" onClick={async () => {
                        const blob = await applicationsApi.downloadResume(application._id);
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank', 'noopener,noreferrer');
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}>Resume</Button>
                    </div>
                    {application.interviewScheduledAt ? <small>Interview: {formatDateTime(application.interviewScheduledAt)}</small> : null}
                  </td>
                </tr>
              )) : <tr><td colSpan="5">No applicants found for current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
