
import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import StatCard from '../../components/ui/StatCard';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import { adminApi } from '../../services/admin.api';
import { toast } from 'react-toastify';
import { Search, Briefcase, CheckCircle, XCircle, Clock, Users, ListChecks, FileText, History } from 'lucide-react';

export default function AdminJobsModerationPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobSearch, setJobSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actioningJobId, setActioningJobId] = useState(null);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationSearch, setApplicationSearch] = useState('');
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

  if (loading) return <Loader label="Loading moderation console..." />;

  // Status badge tone helper
  const getStatusTone = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'neutral';
      case 'under review': return 'neutral';
      case 'shortlisted': return 'success';
      default: return 'neutral';
    }
  };

  // Stat cards data
  const statCards = [
    { label: 'Pending Jobs', value: statusCounts.pending, icon: Briefcase, tone: 'default' },
    { label: 'Approved Jobs', value: statusCounts.approved, icon: CheckCircle, tone: 'success' },
    { label: 'Rejected Jobs', value: statusCounts.rejected, icon: XCircle, tone: 'danger' },
    { label: 'Pending Applications', value: applicationCounts.pending, icon: Users, tone: 'default' },
    { label: 'Reviewed Today', value: applicationCounts.reviewed, icon: ListChecks, tone: 'primary' },
    { label: 'Total Queue', value: statusCounts.all + applicationCounts.all, icon: Clock, tone: 'default' },
  ];

  // Recent moderation activity (mocked for now)
  const recentActivity = [
    ...jobs.slice(0, 3).map(j => ({
      type: 'Job',
      title: j.title,
      status: j.reviewStatus,
      date: j.updatedAt || j.createdAt,
      by: j.moderatedBy || j.submittedBy || '—',
    })),
    ...applications.slice(0, 3).map(a => ({
      type: 'Application',
      title: a.candidateUser?.name,
      status: a.status,
      date: a.updatedAt || a.createdAt,
      by: a.reviewer || a.candidateUser?.name || '—',
    })),
  ];

  const filteredJobs = jobs.filter((job) => {
    const query = jobSearch.trim().toLowerCase();
    if (!query) return true;

    return [
      job.title,
      job.companyName,
      job.employerUser?.name,
      job.employerUser?.email,
      job.submittedBy
    ].some((value) => String(value || '').toLowerCase().includes(query));
  });

  const filteredApplications = applications.filter((item) => {
    const query = applicationSearch.trim().toLowerCase();
    if (!query) return true;

    return [
      item.candidateUser?.name,
      item.candidateUser?.email,
      item.job?.title,
      item.job?.companyName,
      item.status
    ].some((value) => String(value || '').toLowerCase().includes(query));
  });

  return (
    <>
      <Seo title="Job Moderation | Hirexo" description="Approve or reject submitted jobs." />
      <DashboardHeader title="Moderation Console" description="Premium admin review center for jobs and applications." />

      {/* Stat cards row */}
      <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        {statCards.map((card, i) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} tone={card.tone} />
        ))}
      </div>

      {/* Filters and Job Moderation Table */}
      <Card>
        <div className="panel-head" style={{ marginBottom: '1.2rem' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.18rem' }}><Briefcase size={18} style={{marginRight: 8}} /> Job Moderation Queue</h3>
          <div className="dashboard-filter-bar">
            <Select
              label="Status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ minWidth: 120 }}
            >
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="approved">Approved ({statusCounts.approved})</option>
              <option value="rejected">Rejected ({statusCounts.rejected})</option>
              <option value="all">All ({statusCounts.all})</option>
            </Select>
            <div className="dashboard-search-field">
              <Search size={16} style={{ marginRight: 6, color: 'var(--muted)' }} />
              <input
                type="text"
                value={jobSearch}
                onChange={(event) => setJobSearch(event.target.value)}
                placeholder="Search job title..."
                className="dashboard-search-input"
              />
            </div>
          </div>
        </div>
        <div className="table-wrap">
          {filteredJobs.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id}>
                    <td style={{ fontWeight: 700 }}>{job.title}</td>
                    <td>{job.companyName}</td>
                    <td>{job.submittedBy || '—'}</td>
                    <td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}</td>
                    <td><Badge tone={getStatusTone(job.reviewStatus)}>{job.reviewStatus}</Badge></td>
                    <td>
                      <div className="form-links" style={{ gap: 6 }}>
                        <Button size="sm" variant="primary" disabled={actioningJobId === job._id} onClick={() => {}}><FileText size={15} /> Review</Button>
                        {job.reviewStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
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
                              <CheckCircle size={15} /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
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
                              <XCircle size={15} /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="No jobs in queue"
              description={jobSearch ? 'No jobs match the current search and status filters.' : 'There are no jobs to review for the selected status.'}
              actionLabel={null}
            />
          )}
        </div>
      </Card>

      {/* Application Moderation Section */}
      <Card className="mt-1">
        <div className="panel-head" style={{ marginBottom: '1.2rem' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.18rem' }}><Users size={18} style={{marginRight: 8}} /> Application Moderation</h3>
          <div className="dashboard-filter-bar">
            <Select
              label="Status"
              value={applicationStatusFilter}
              onChange={e => setApplicationStatusFilter(e.target.value)}
              style={{ minWidth: 120 }}
            >
              <option value="pending">Pending ({applicationCounts.pending})</option>
              <option value="reviewed">Reviewed ({applicationCounts.reviewed})</option>
              <option value="shortlisted">Shortlisted ({applicationCounts.shortlisted})</option>
              <option value="rejected">Rejected ({applicationCounts.rejected})</option>
              <option value="interview_scheduled">Interview Scheduled ({applicationCounts.interview_scheduled})</option>
              <option value="all">All ({applicationCounts.all})</option>
            </Select>
            <div className="dashboard-search-field">
              <Search size={16} style={{ marginRight: 6, color: 'var(--muted)' }} />
              <input
                type="text"
                value={applicationSearch}
                onChange={(event) => setApplicationSearch(event.target.value)}
                placeholder="Search candidate..."
                className="dashboard-search-input"
              />
            </div>
          </div>
        </div>
        {applicationsLoading ? (
          <Loader label="Loading applications..." />
        ) : (
          <div className="table-wrap">
            {filteredApplications.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((item) => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 700 }}>{item.candidateUser?.name || '-'}</td>
                      <td>{item.job?.title || '-'}</td>
                      <td>{item.job?.companyName || '-'}</td>
                      <td><Badge tone={getStatusTone(item.status)}>{item.status}</Badge></td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="form-links" style={{ gap: 6 }}>
                          <Button size="sm" variant="primary" onClick={() => {}}><FileText size={15} /> View</Button>
                          {/* Add more actions as needed */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="No applications in queue"
                description={applicationSearch ? 'No applications match the current search and status filters.' : 'There are no applications to review for the selected status.'}
                actionLabel={null}
              />
            )}
          </div>
        )}
      </Card>

      {/* Supporting Admin Panel: Recent Review Activity */}
      <Card className="mt-1">
        <div className="panel-head" style={{ marginBottom: '1.2rem' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}><History size={17} style={{marginRight: 8}} /> Recent Moderation Activity</h3>
        </div>
        {recentActivity.length ? (
          <div style={{ display: 'grid', gap: '0.7rem' }}>
            {recentActivity.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-alt)', borderRadius: 12, padding: '0.7rem 1rem' }}>
                <Badge tone={getStatusTone(item.status)} style={{ minWidth: 90, textTransform: 'capitalize' }}>{item.status}</Badge>
                <span style={{ fontWeight: 700 }}>{item.title}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>{item.type}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 13 }}>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>by {item.by}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No recent activity" description="No moderation actions have been taken recently." actionLabel={null} />
        )}
      </Card>
    </>
  );
}
