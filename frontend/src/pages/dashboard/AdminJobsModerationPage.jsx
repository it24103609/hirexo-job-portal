import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { adminApi } from '../../services/admin.api';
import { toast } from 'react-toastify';

export default function AdminJobsModerationPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actioningJobId, setActioningJobId] = useState(null);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('pending');
  const [applicationCounts, setApplicationCounts] = useState({
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    interview_scheduled: 0,
    all: 0
  });

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = { status: statusFilter };
      const res = await adminApi.pendingJobs(params);
      setJobs(res.data || []);
      setStatusCounts(res.meta?.counts || { pending: 0, approved: 0, rejected: 0, all: 0 });
    } catch (error) {
      toast.error(error.message || 'Failed to load moderated jobs');
      setJobs([]);
      setStatusCounts({ pending: 0, approved: 0, rejected: 0, all: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);
      const params = { status: applicationStatusFilter };
      const res = await adminApi.applications(params);
      setApplications(res.data || []);
      setApplicationCounts(res.meta?.counts || {
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        rejected: 0,
        interview_scheduled: 0,
        all: 0
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load applications');
      setApplications([]);
      setApplicationCounts({ pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, interview_scheduled: 0, all: 0 });
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [applicationStatusFilter]);

  if (loading) return <Loader label="Loading moderated jobs..." />;

  return (
    <>
      <Seo title="Job Moderation | Hirexo" description="Approve or reject submitted jobs." />
      <DashboardHeader title="Job Moderation" description="Review jobs before they appear in public listings." />
      <Card>
        <div className="form-links mb-1">
          <label htmlFor="reviewStatusFilter">Review status</label>
          <select
            id="reviewStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="approved">Approved ({statusCounts.approved})</option>
            <option value="rejected">Rejected ({statusCounts.rejected})</option>
            <option value="all">All ({statusCounts.all})</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Job</th><th>Company</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {jobs.length ? jobs.map((job) => (
                <tr key={job._id}>
                  <td>{job.title}</td>
                  <td>{job.companyName}</td>
                  <td><Badge tone="neutral">{job.reviewStatus}</Badge></td>
                  <td>
                    {job.reviewStatus === 'pending' ? (
                      <div className="form-links">
                        <Button
                          size="sm"
                          disabled={actioningJobId === job._id}
                          onClick={async () => {
                            try {
                              setActioningJobId(job._id);
                              await adminApi.approveJob(job._id);
                              toast.success('Job approved');
                              await loadJobs();
                            } catch (error) {
                              toast.error(error.message || 'Failed to approve job');
                            } finally {
                              setActioningJobId(null);
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={actioningJobId === job._id}
                          onClick={async () => {
                            try {
                              setActioningJobId(job._id);
                              await adminApi.rejectJob(job._id);
                              toast.info('Job rejected');
                              await loadJobs();
                            } catch (error) {
                              toast.error(error.message || 'Failed to reject job');
                            } finally {
                              setActioningJobId(null);
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan="4">No jobs found for selected status.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-1">
        <div className="form-links mb-1">
          <label htmlFor="applicationStatusFilter">Application status</label>
          <select
            id="applicationStatusFilter"
            value={applicationStatusFilter}
            onChange={(e) => setApplicationStatusFilter(e.target.value)}
          >
            <option value="pending">Pending ({applicationCounts.pending})</option>
            <option value="reviewed">Reviewed ({applicationCounts.reviewed})</option>
            <option value="shortlisted">Shortlisted ({applicationCounts.shortlisted})</option>
            <option value="rejected">Rejected ({applicationCounts.rejected})</option>
            <option value="interview_scheduled">Interview Scheduled ({applicationCounts.interview_scheduled})</option>
            <option value="all">All ({applicationCounts.all})</option>
          </select>
        </div>
        {applicationsLoading ? (
          <Loader label="Loading applications..." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.length ? applications.map((item) => (
                  <tr key={item._id}>
                    <td>{item.candidateUser?.name || '-'}</td>
                    <td>{item.job?.title || '-'}</td>
                    <td>{item.job?.companyName || '-'}</td>
                    <td><Badge tone={item.status === 'shortlisted' ? 'success' : 'neutral'}>{item.status}</Badge></td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                )) : <tr><td colSpan="5">No applications found for selected status.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
