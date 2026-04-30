import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Grid2X2, List, Plus, Search } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import { employerApi } from '../../services/employer.api';
import { formatDate } from '../../utils/formatters';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function getLifecycle(job) {
  const review = normalize(job.reviewStatus);
  const status = normalize(job.status);

  if (review === 'rejected') return 'rejected';
  if (review === 'pending') return 'pending';
  if (status === 'inactive' || status === 'expired') return 'inactive';
  return status || 'active';
}

function getJobBadge(job) {
  const lifecycle = getLifecycle(job);
  if (lifecycle === 'active') return { label: 'Active', tone: 'success' };
  if (lifecycle === 'rejected') return { label: 'Rejected', tone: 'danger' };
  if (lifecycle === 'pending') return { label: 'Pending', tone: 'neutral' };
  return { label: lifecycle.charAt(0).toUpperCase() + lifecycle.slice(1), tone: 'neutral' };
}

function countOpened(applications = []) {
  return applications.filter((application) => Boolean(application.viewedAt)).length;
}

export default function EmployerJobsPage() {
  const [state, setState] = useState({ loading: true, jobs: [], applicationsByJob: {} });
  const [filters, setFilters] = useState({ keyword: '', department: 'all', jobType: 'all', status: 'active' });
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      const jobsRes = await employerApi.jobs();
      const jobs = jobsRes.data || [];
      const applicantResults = await Promise.allSettled(jobs.map((job) => employerApi.applicants(job._id)));
      const applicationsByJob = {};

      jobs.forEach((job, index) => {
        const result = applicantResults[index];
        applicationsByJob[job._id] = result?.status === 'fulfilled' ? result.value.data?.applications || [] : [];
      });

      if (!isMounted) return;
      setState({ loading: false, jobs, applicationsByJob });
    };

    loadJobs().catch(() => {
      if (!isMounted) return;
      setState({ loading: false, jobs: [], applicationsByJob: {} });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    const active = state.jobs.filter((job) => getLifecycle(job) === 'active').length;
    const inactive = state.jobs.filter((job) => getLifecycle(job) === 'inactive').length;
    const pending = state.jobs.filter((job) => getLifecycle(job) === 'pending').length;
    return { all: state.jobs.length, active, inactive, pending };
  }, [state.jobs]);

  const departments = useMemo(() => (
    [...new Set(state.jobs.map((job) => job.category || job.industry).filter(Boolean))].sort()
  ), [state.jobs]);

  const jobTypes = useMemo(() => (
    [...new Set(state.jobs.map((job) => job.jobType).filter(Boolean))].sort()
  ), [state.jobs]);

  const filteredJobs = useMemo(() => {
    const keyword = normalize(filters.keyword);

    return state.jobs.filter((job) => {
      const haystack = [job.title, job.companyName, job.location, job.category, job.industry, job.jobType].map(normalize).join(' ');
      const department = job.category || job.industry || '';
      const lifecycle = getLifecycle(job);

      if (keyword && !haystack.includes(keyword)) return false;
      if (filters.department !== 'all' && department !== filters.department) return false;
      if (filters.jobType !== 'all' && job.jobType !== filters.jobType) return false;
      if (filters.status !== 'all' && lifecycle !== filters.status) return false;
      return true;
    });
  }, [filters, state.jobs]);

  const clearFilters = () => setFilters({ keyword: '', department: 'all', jobType: 'all', status: 'all' });

  if (state.loading) return <Loader label="Loading jobs..." />;

  return (
    <>
      <Seo title="Jobs | Hirexo" description="Search, filter, and manage employer job postings." />

      <section className="rooster-page-head">
        <div>
          <h1>Jobs</h1>
          <span>{counts.all} jobs</span>
          <Badge tone="success">{counts.active} active</Badge>
          <Badge tone="neutral">{counts.inactive} inactive</Badge>
        </div>
        <Button as={Link} to="/employer/jobs/new" className="rooster-create-button">
          <Plus size={18} />
          Create new job
        </Button>
      </section>

      <section className="rooster-filter-row" aria-label="Job filters">
        <label className="rooster-search-field">
          <Search size={18} aria-hidden="true" />
          <input
            value={filters.keyword}
            onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
            placeholder="Search"
            type="search"
          />
        </label>
        <Select
          value={filters.department}
          onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}
          className="rooster-select"
        >
          <option value="all">Departments</option>
          {departments.map((department) => <option key={department} value={department}>{department}</option>)}
        </Select>
        <Select
          value={filters.jobType}
          onChange={(event) => setFilters((current) => ({ ...current, jobType: event.target.value }))}
          className="rooster-select"
        >
          <option value="all">Job types</option>
          {jobTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </Select>
        <Select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          className="rooster-select rooster-status-select"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
          <option value="rejected">Rejected</option>
        </Select>
        <button type="button" className="rooster-clear-button" onClick={clearFilters}>Clear all</button>
        <div className="rooster-view-toggle" aria-label="View mode">
          <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
            <List size={18} /> List
          </button>
          <button type="button" className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
            <Grid2X2 size={18} /> Table
          </button>
        </div>
      </section>

      {viewMode === 'table' ? (
        <section className="rooster-table-card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th>Applicants</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length ? filteredJobs.map((job) => {
                  const applicants = state.applicationsByJob[job._id] || [];
                  const opened = countOpened(applicants);
                  const badge = getJobBadge(job);
                  return (
                    <tr key={job._id}>
                      <td>{job.title}</td>
                      <td><Badge tone={badge.tone}>{badge.label}</Badge></td>
                      <td>{job.category || job.industry || '-'}</td>
                      <td>{applicants.length} total · {opened} opened</td>
                      <td>{formatDate(job.createdAt)}</td>
                      <td className="form-links">
                        <Button as={Link} to={`/employer/jobs/${job._id}/edit`} variant="secondary" size="sm">Edit</Button>
                        <Button as={Link} to={`/employer/jobs/${job._id}/applicants`} variant="ghost" size="sm">Pipeline</Button>
                      </td>
                    </tr>
                  );
                }) : <tr><td colSpan="6">No jobs match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rooster-job-list" aria-label="Jobs list">
          {filteredJobs.length ? filteredJobs.map((job) => {
            const applicants = state.applicationsByJob[job._id] || [];
            const opened = countOpened(applicants);
            const unopened = Math.max(0, applicants.length - opened);
            const badge = getJobBadge(job);

            return (
              <article key={job._id} className="rooster-job-row">
                <Link to={`/employer/jobs/${job._id}/applicants`} className="rooster-job-main">
                  <ChevronRight size={18} aria-hidden="true" />
                  <strong>{job.title}</strong>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  <span>{job.jobType || 'Full-Time'}</span>
                  <span>{job.category || job.industry || 'Operations'}</span>
                  <span>{job.location || 'Location not set'}</span>
                  <span>{formatDate(job.createdAt)}</span>
                </Link>
                <div className="rooster-job-counts">
                  <strong>{applicants.length} Total candidate{applicants.length === 1 ? '' : 's'}</strong>
                  <span>{opened} Opened</span>
                  <span>{unopened} Unopened</span>
                </div>
              </article>
            );
          }) : (
            <div className="employer-empty-state">
              <div className="employer-empty-icon"><Search size={22} /></div>
              <div>
                <h4>No jobs match these filters</h4>
                <p>Try clearing filters or create a fresh opening for your next role.</p>
                <Button as={Link} to="/employer/jobs/new" size="sm">Create new job</Button>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
