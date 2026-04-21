
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
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { adminApi } from '../../services/admin.api';
import { applicationsApi } from '../../services/applications.api';
import { toast } from 'react-toastify';
import { Search, Briefcase, CheckCircle, XCircle, Clock, Users, ListChecks, FileText, History } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

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
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationDetailLoading, setApplicationDetailLoading] = useState(false);
  const [applicationActionLoading, setApplicationActionLoading] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    status: 'pending',
    notes: '',
    interviewScheduledAt: '',
    interviewMode: 'video',
    interviewLocation: '',
    interviewMeetingLink: '',
    interviewNotes: ''
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

  const loadApplicationDetail = async (applicationId) => {
    try {
      setApplicationDetailLoading(true);
      const res = await applicationsApi.getById(applicationId);
      const detail = res.data || null;
      setSelectedApplication(detail);
      setSelectedApplicationId(applicationId);
      setApplicationForm({
        status: detail?.status || 'pending',
        notes: detail?.notes || '',
        interviewScheduledAt: detail?.interviewScheduledAt ? new Date(detail.interviewScheduledAt).toISOString().slice(0, 16) : '',
        interviewMode: detail?.interviewMode || 'video',
        interviewLocation: detail?.interviewLocation || '',
        interviewMeetingLink: detail?.interviewMeetingLink || '',
        interviewNotes: detail?.interviewNotes || ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load application details');
    } finally {
      setApplicationDetailLoading(false);
    }
  };

  const clearSelectedApplication = () => {
    setSelectedApplicationId('');
    setSelectedApplication(null);
    setApplicationForm({
      status: 'pending',
      notes: '',
      interviewScheduledAt: '',
      interviewMode: 'video',
      interviewLocation: '',
      interviewMeetingLink: '',
      interviewNotes: ''
    });
  };

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

  const updateApplicationField = (key, value) => {
    setApplicationForm((current) => ({ ...current, [key]: value }));
  };

  const submitApplicationUpdate = async () => {
    if (!selectedApplicationId) return;

    if (applicationForm.status === 'interview_scheduled' && !applicationForm.interviewScheduledAt) {
      toast.error('Interview date and time is required');
      return;
    }

    try {
      setApplicationActionLoading(true);
      const payload = {
        status: applicationForm.status,
        notes: applicationForm.notes
      };

      if (applicationForm.status === 'interview_scheduled') {
        payload.interviewScheduledAt = applicationForm.interviewScheduledAt;
        payload.interviewMode = applicationForm.interviewMode;
        payload.interviewLocation = applicationForm.interviewLocation;
        payload.interviewMeetingLink = applicationForm.interviewMeetingLink;
        payload.interviewNotes = applicationForm.interviewNotes;
      }

      await applicationsApi.updateStatus(selectedApplicationId, payload);
      toast.success('Application updated successfully');
      await Promise.all([loadApplications(), loadApplicationDetail(selectedApplicationId)]);
    } catch (error) {
      toast.error(error.message || 'Failed to update application');
    } finally {
      setApplicationActionLoading(false);
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

  // Recent moderation activity based on the latest fetched queue data.
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
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={async () => {
                              await loadApplicationDetail(item._id);
                            }}
                          >
                            <FileText size={15} /> View
                          </Button>
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

      <Card className="mt-1">
        <div className="panel-head" style={{ marginBottom: '1.2rem' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}><FileText size={17} style={{ marginRight: 8 }} /> Application Review Detail</h3>
          {selectedApplication ? (
            <Button size="sm" variant="ghost" onClick={clearSelectedApplication}>Close</Button>
          ) : null}
        </div>

        {applicationDetailLoading ? (
          <Loader label="Loading application detail..." />
        ) : selectedApplication ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div>
                <strong>Candidate</strong>
                <div>{selectedApplication.candidateUser?.name || '-'}</div>
                <small>{selectedApplication.candidateUser?.email || '-'}</small>
              </div>
              <div>
                <strong>Job</strong>
                <div>{selectedApplication.job?.title || '-'}</div>
                <small>{selectedApplication.job?.companyName || '-'}</small>
              </div>
              <div>
                <strong>Current status</strong>
                <div><Badge tone={getStatusTone(selectedApplication.status)}>{selectedApplication.status}</Badge></div>
                <small>Applied {selectedApplication.createdAt ? formatDateTime(selectedApplication.createdAt) : '-'}</small>
              </div>
              <div>
                <strong>Interview</strong>
                <div>{selectedApplication.interviewScheduledAt ? formatDateTime(selectedApplication.interviewScheduledAt) : 'Not scheduled'}</div>
                <small>{selectedApplication.interviewMode || 'Mode not set'}</small>
              </div>
            </div>

            {selectedApplication.candidateProfile ? (
              <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div>
                  <strong>Headline</strong>
                  <div>{selectedApplication.candidateProfile.headline || '-'}</div>
                </div>
                <div>
                  <strong>Experience</strong>
                  <div>{selectedApplication.candidateProfile.experienceYears ?? 0} years</div>
                </div>
                <div>
                  <strong>Location</strong>
                  <div>{selectedApplication.candidateProfile.location || '-'}</div>
                </div>
                <div>
                  <strong>Skills</strong>
                  <div>{(selectedApplication.candidateProfile.skills || []).join(', ') || '-'}</div>
                </div>
              </div>
            ) : null}

            {selectedApplication.coverLetter ? (
              <div>
                <strong>Cover letter</strong>
                <p style={{ marginTop: 8 }}>{selectedApplication.coverLetter}</p>
              </div>
            ) : null}

            <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <Select label="Next status" value={applicationForm.status} onChange={(event) => updateApplicationField('status', event.target.value)}>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="rejected">Rejected</option>
              </Select>
              <Input
                label="Interview date & time"
                type="datetime-local"
                value={applicationForm.interviewScheduledAt}
                onChange={(event) => updateApplicationField('interviewScheduledAt', event.target.value)}
              />
              <Select label="Interview mode" value={applicationForm.interviewMode} onChange={(event) => updateApplicationField('interviewMode', event.target.value)}>
                <option value="phone">Phone</option>
                <option value="video">Video</option>
                <option value="onsite">Onsite</option>
              </Select>
              <Input
                label="Location / platform"
                value={applicationForm.interviewLocation}
                onChange={(event) => updateApplicationField('interviewLocation', event.target.value)}
                placeholder="Office address or Google Meet"
              />
            </div>

            <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <Input
                label="Meeting link"
                value={applicationForm.interviewMeetingLink}
                onChange={(event) => updateApplicationField('interviewMeetingLink', event.target.value)}
                placeholder="https://..."
              />
              <Textarea
                label="Internal notes"
                value={applicationForm.notes}
                onChange={(event) => updateApplicationField('notes', event.target.value)}
                placeholder="Review summary or moderation notes"
              />
              <Textarea
                label="Interview notes"
                value={applicationForm.interviewNotes}
                onChange={(event) => updateApplicationField('interviewNotes', event.target.value)}
                placeholder="Panel, agenda, preparation notes"
              />
            </div>

            <div className="form-links" style={{ gap: 8 }}>
              <Button size="sm" disabled={applicationActionLoading} onClick={submitApplicationUpdate}>
                {applicationActionLoading ? 'Saving...' : 'Save application update'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  try {
                    const blob = await applicationsApi.downloadResume(selectedApplicationId);
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank', 'noopener,noreferrer');
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  } catch (error) {
                    toast.error(error.message || 'Failed to open resume');
                  }
                }}
              >
                Open resume
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Select an application"
            description="Open any application from the moderation table to review the profile, update status, and schedule interviews as admin."
            actionLabel={null}
          />
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
