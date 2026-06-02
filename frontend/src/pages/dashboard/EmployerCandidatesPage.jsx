import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, Save, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import { employerApi } from '../../services/employer.api';
import { applicationsApi } from '../../services/applications.api';
import { formatDate } from '../../utils/formatters';

const STAGE_OPTIONS = [
  { value: 'all', label: 'Stage' },
  { value: 'pending', label: 'Screening' },
  { value: 'reviewed', label: 'Qualified' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Client Interview' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' }
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function stageLabel(status) {
  const match = STAGE_OPTIONS.find((option) => option.value === status);
  return match?.label || String(status || 'Screening').replace(/_/g, ' ');
}

function stageTone(status) {
  if (status === 'hired' || status === 'shortlisted' || status === 'interview_scheduled') return 'success';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

function getCandidate(application) {
  const candidate = application.candidateUser && typeof application.candidateUser === 'object'
    ? application.candidateUser
    : {};

  return {
    ...candidate,
    name: candidate.name || application.candidateName || application.name || '',
    email: candidate.email || application.candidateEmail || application.email || ''
  };
}

function getScore(application) {
  if (Number.isFinite(Number(application.aiMatchScore))) {
    return `${Math.round(Number(application.aiMatchScore))}%`;
  }

  const feedback = application.interviewFeedback || {};
  const values = ['communication', 'technicalSkills', 'confidence', 'cultureFit']
    .map((key) => Number(feedback[key]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return '-';
  return `${Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 20)}%`;
}

function hasResume(application) {
  return Boolean(application?.resumeSnapshot?.fileName);
}

export default function EmployerCandidatesPage() {
  const [state, setState] = useState({ loading: true, jobs: [], applications: [] });
  const [filters, setFilters] = useState({ keyword: '', tag: 'all', position: 'all', stage: 'all', date: 'all', rating: 'all' });

  useEffect(() => {
    let isMounted = true;

    const loadCandidates = async () => {
      const jobsRes = await employerApi.jobs();
      const jobs = jobsRes.data || [];
      const applicantResults = await Promise.allSettled(jobs.map((job) => employerApi.applicants(job._id)));
      const applications = [];

      jobs.forEach((job, index) => {
        const result = applicantResults[index];
        const list = result?.status === 'fulfilled' ? result.value.data?.applications || [] : [];
        list.forEach((application) => {
          applications.push({
            ...application,
            jobId: job._id,
            jobTitle: job.title,
            jobTags: job.tags || [],
            jobCategory: job.category || job.industry || ''
          });
        });
      });

      if (!isMounted) return;
      setState({ loading: false, jobs, applications });
    };

    loadCandidates().catch(() => {
      if (!isMounted) return;
      setState({ loading: false, jobs: [], applications: [] });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const tags = useMemo(() => (
    [...new Set(state.applications.flatMap((application) => application.jobTags || []).filter(Boolean))].sort()
  ), [state.applications]);

  const positions = useMemo(() => (
    [...new Set(state.applications.map((application) => application.jobTitle).filter(Boolean))].sort()
  ), [state.applications]);

  const filteredApplications = useMemo(() => {
    const keyword = normalize(filters.keyword);
    const now = Date.now();

    return state.applications.filter((application) => {
      const candidate = getCandidate(application);
      const candidateName = candidate.name || candidate.email || 'Candidate';
      const haystack = [candidateName, candidate.email, application.jobTitle, application.status, application.jobCategory].map(normalize).join(' ');
      const createdAt = application.createdAt ? new Date(application.createdAt).getTime() : 0;
      const score = getScore(application);
      const numericScore = score === '-' ? 0 : Number(score.replace('%', ''));

      if (keyword && !haystack.includes(keyword)) return false;
      if (filters.tag !== 'all' && !(application.jobTags || []).includes(filters.tag)) return false;
      if (filters.position !== 'all' && application.jobTitle !== filters.position) return false;
      if (filters.stage !== 'all' && application.status !== filters.stage) return false;
      if (filters.date === '7d' && (!createdAt || now - createdAt > 7 * 24 * 60 * 60 * 1000)) return false;
      if (filters.date === '30d' && (!createdAt || now - createdAt > 30 * 24 * 60 * 60 * 1000)) return false;
      if (filters.rating === 'rated' && score === '-') return false;
      if (filters.rating === '80' && numericScore < 80) return false;
      return true;
    });
  }, [filters, state.applications]);

  const clearFilters = () => setFilters({ keyword: '', tag: 'all', position: 'all', stage: 'all', date: 'all', rating: 'all' });

  const saveSearch = () => {
    window.localStorage.setItem('hirexo-employer-candidate-search', JSON.stringify(filters));
    toast.success('Current candidate search saved.');
  };

  const downloadResume = async (application) => {
    if (!hasResume(application)) {
      toast.info('This candidate has not attached a resume.');
      return;
    }

    try {
      const blob = await applicationsApi.downloadResume(application._id);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = application.resumeSnapshot?.fileName || `${getCandidate(application).name || 'candidate'}-resume`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || 'Unable to download resume.');
    }
  };

  if (state.loading) return <Loader label="Loading candidates..." />;

  return (
    <>
      <Seo title="Candidates | Hirexo" description="Search and filter all candidates across employer jobs." />

      <section className="rooster-page-head">
        <div>
          <h1>Candidates</h1>
          <span>{filteredApplications.length} candidates</span>
        </div>
        <Button type="button" className="rooster-create-button" onClick={saveSearch}>
          <Save size={17} />
          Save current search
        </Button>
      </section>

      <section className="rooster-filter-row" aria-label="Candidate filters">
        <label className="rooster-search-field">
          <Search size={18} aria-hidden="true" />
          <input
            value={filters.keyword}
            onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
            placeholder="Search"
            type="search"
          />
        </label>
        <Select value={filters.tag} onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))} className="rooster-select">
          <option value="all">Tags</option>
          {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </Select>
        <Select value={filters.position} onChange={(event) => setFilters((current) => ({ ...current, position: event.target.value }))} className="rooster-select">
          <option value="all">Positions</option>
          {positions.map((position) => <option key={position} value={position}>{position}</option>)}
        </Select>
        <Select value={filters.stage} onChange={(event) => setFilters((current) => ({ ...current, stage: event.target.value }))} className="rooster-select">
          {STAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
        <Select value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} className="rooster-select">
          <option value="all">Applied Date</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </Select>
        <Select value={filters.rating} onChange={(event) => setFilters((current) => ({ ...current, rating: event.target.value }))} className="rooster-select">
          <option value="all">Rating</option>
          <option value="rated">Rated only</option>
          <option value="80">80% and above</option>
        </Select>
        <button type="button" className="rooster-clear-button" onClick={clearFilters}>Clear all</button>
      </section>

      <section className="rooster-table-card">
        <div className="rooster-table-tools">
          <strong>{filteredApplications.length} Total Candidates</strong>
          <Button as={Link} to="/employer/jobs" size="sm" variant="secondary">
            <Plus size={15} />
            Add candidate
          </Button>
        </div>
        <div className="table-wrap">
          <table className="table rooster-candidate-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Applied for</th>
                <th>Applied on</th>
                <th>Score</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length ? filteredApplications.map((application) => {
                const candidate = getCandidate(application);
                const candidateName = candidate.name || candidate.email || 'Candidate';
                return (
                  <tr key={application._id}>
                    <td>
                      <Link to={`/employer/applicants/${application._id}`} className="rooster-candidate-link">
                        {candidateName}
                      </Link>
                    </td>
                    <td><Badge tone={stageTone(application.status)}>{stageLabel(application.status)}</Badge></td>
                    <td>{application.jobTags?.length ? application.jobTags.slice(0, 2).join(', ') : '-'}</td>
                    <td>
                      <Link to={`/employer/jobs/${application.jobId}/applicants`} className="link-button">
                        {application.jobTitle || 'Job'}
                      </Link>
                    </td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>{getScore(application)}</td>
                    <td>
                      {hasResume(application) ? (
                        <button type="button" className="rooster-icon-link" onClick={() => downloadResume(application)} aria-label={`Download ${candidateName} resume`}>
                          <Download size={16} />
                        </button>
                      ) : (
                        <span className="muted-text">No resume</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7">No candidates match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
