import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';
import { formatDate, currencyRange } from '../../utils/formatters';

function getJobBadge(job) {
  if (job.reviewStatus === 'approved') return { label: 'approved', tone: 'success' };
  if (job.reviewStatus === 'rejected') return { label: 'rejected', tone: 'danger' };
  if (job.reviewStatus === 'draft' || job.status === 'draft') return { label: 'draft', tone: 'neutral' };
  return { label: job.reviewStatus || job.status || 'pending', tone: 'neutral' };
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employerApi.jobs().then((res) => setJobs(res.data || [])).catch(() => {
      setJobs([]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo title="Manage Jobs | Hirexo" description="Create and manage your company jobs." />
      <DashboardHeader title="Manage Jobs" description="Create jobs, view review status, and manage live openings." actions={<Button as={Link} to="/employer/jobs/new">Post a job</Button>} />
      {loading ? <Loader label="Loading jobs..." /> : (
        <Card>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Title</th><th>Status</th><th>Salary</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {jobs.length ? jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td><Badge tone={getJobBadge(job).tone}>{getJobBadge(job).label}</Badge></td>
                    <td>{currencyRange(job.salaryMin, job.salaryMax)}</td>
                    <td>{formatDate(job.createdAt)}</td>
                    <td className="form-links"><Button as={Link} to={`/employer/jobs/${job._id}/edit`} variant="secondary" size="sm">Edit</Button><Button as={Link} to={`/employer/jobs/${job._id}/applicants`} variant="ghost" size="sm">Applicants</Button></td>
                  </tr>
                )) : <tr><td colSpan="5">No jobs posted yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
