import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCheck,
  CircleAlert,
  Clock3,
  FileDown,
  FileText,
  Mail,
  PencilLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { adminApi } from '../../services/admin.api';
import { contactApi } from '../../services/contact.api';
import { notificationsApi } from '../../services/notifications.api';
import { blogApi } from '../../services/blog.api';
import { formatDate, formatDateTime } from '../../utils/formatters';

const fallbackDashboard = {
  totalJobs: 0,
  activeJobs: 0,
  pendingJobs: 0,
  totalEmployers: 0,
  totalCandidates: 0,
  totalApplications: 0,
  totalBlogs: 0,
  publishedBlogs: 0,
  totalContacts: 0,
  newContacts: 0
};

function getRelativeTime(value) {
  if (!value) return 'Recently';

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Recently';

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(value);
}

function getBadgeTone(status) {
  const normalized = String(status || '').toLowerCase();
  if (['approved', 'published', 'active', 'shortlisted', 'hired', 'replied', 'read'].includes(normalized)) return 'success';
  if (['rejected', 'blocked'].includes(normalized)) return 'danger';
  return 'neutral';
}

function buildActivityFeed({ applications, jobs, contacts, blogs, notifications, registrations }) {
  const registrationActivity = (registrations || [])
    .slice(-2)
    .map((entry) => ({
      id: `registration-${entry.date}`,
      type: 'candidate',
      title: `${entry.count} candidate${entry.count === 1 ? '' : 's'} registered`,
      description: 'New signups joined the Hirexo talent network.',
      date: entry.date,
      timestamp: new Date(entry.date).getTime() || 0
    }));

  const applicationActivity = (applications || []).slice(0, 3).map((item) => ({
    id: `application-${item._id}`,
    type: 'application',
    title: `${item.candidateUser?.name || 'A candidate'} applied`,
    description: `${item.job?.title || 'Job'} at ${item.job?.companyName || 'Hirexo employer'}.`,
    date: item.createdAt,
    timestamp: new Date(item.createdAt).getTime() || 0
  }));

  const jobActivity = (jobs || []).slice(0, 3).map((item) => ({
    id: `job-${item._id}`,
    type: item.reviewStatus === 'approved' ? 'approval' : 'job',
    title: item.reviewStatus === 'approved' ? 'Job approved' : 'Employer posted a job',
    description: `${item.title} from ${item.companyName || item.employerUser?.name || 'an employer'}.`,
    date: item.reviewedAt || item.createdAt,
    timestamp: new Date(item.reviewedAt || item.createdAt).getTime() || 0
  }));

  const contactActivity = (contacts || []).slice(0, 2).map((item) => ({
    id: `contact-${item._id}`,
    type: 'inquiry',
    title: 'Inquiry received',
    description: `${item.name} sent "${item.subject || 'a new inquiry'}".`,
    date: item.createdAt,
    timestamp: new Date(item.createdAt).getTime() || 0
  }));

  const blogActivity = (blogs || []).slice(0, 2).map((item) => ({
    id: `blog-${item._id}`,
    type: 'blog',
    title: item.published ? 'Blog updated' : 'Blog draft updated',
    description: item.title,
    date: item.updatedAt || item.createdAt,
    timestamp: new Date(item.updatedAt || item.createdAt).getTime() || 0
  }));

  const notificationActivity = (notifications || []).slice(0, 2).map((item) => ({
    id: `notification-${item._id}`,
    type: 'notification',
    title: item.title || 'Platform update',
    description: item.message || 'A new admin notification is available.',
    date: item.createdAt,
    timestamp: new Date(item.createdAt).getTime() || 0
  }));

  return [
    ...registrationActivity,
    ...applicationActivity,
    ...jobActivity,
    ...contactActivity,
    ...blogActivity,
    ...notificationActivity
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8);
}

export default function AdminDashboard() {
  const [state, setState] = useState({
    loading: true,
    dashboard: fallbackDashboard,
    jobs: [],
    jobCounts: { pending: 0, approved: 0, rejected: 0, all: 0 },
    applications: [],
    applicationCounts: { pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, interview_scheduled: 0, hired: 0, all: 0 },
    contacts: [],
    contactStats: { new: 0, read: 0, replied: 0, total: 0 },
    notifications: [],
    unreadNotifications: 0,
    blogs: [],
    offers: [],
    reports: { candidateRegistrations: { total: 0, thisMonth: 0, last30Days: [] } }
  });
  const [actioningJobId, setActioningJobId] = useState('');

  const loadDashboard = async () => {
    const [dashboardRes, jobsRes, applicationsRes, contactsRes, notificationsRes, blogsRes, reportsRes, offersRes] = await Promise.allSettled([
      adminApi.dashboard(),
      adminApi.pendingJobs(),
      adminApi.applications({ status: 'all' }),
      contactApi.list({ limit: 5 }),
      notificationsApi.mine({ limit: 5 }),
      blogApi.listAdmin(),
      adminApi.reports(),
      adminApi.offers()
    ]);

    setState({
      loading: false,
      dashboard: dashboardRes.status === 'fulfilled' ? { ...fallbackDashboard, ...(dashboardRes.value.data || {}) } : fallbackDashboard,
      jobs: jobsRes.status === 'fulfilled' ? jobsRes.value.data || [] : [],
      jobCounts: jobsRes.status === 'fulfilled' ? jobsRes.value.meta?.counts || { pending: 0, approved: 0, rejected: 0, all: 0 } : { pending: 0, approved: 0, rejected: 0, all: 0 },
      applications: applicationsRes.status === 'fulfilled' ? applicationsRes.value.data || [] : [],
      applicationCounts: applicationsRes.status === 'fulfilled'
        ? applicationsRes.value.meta?.counts || { pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, interview_scheduled: 0, hired: 0, all: 0 }
        : { pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, interview_scheduled: 0, hired: 0, all: 0 },
      contacts: contactsRes.status === 'fulfilled' ? contactsRes.value.data || [] : [],
      contactStats: contactsRes.status === 'fulfilled' ? contactsRes.value.stats || { new: 0, read: 0, replied: 0, total: 0 } : { new: 0, read: 0, replied: 0, total: 0 },
      notifications: notificationsRes.status === 'fulfilled' ? notificationsRes.value.data || [] : [],
      unreadNotifications: notificationsRes.status === 'fulfilled' ? notificationsRes.value.meta?.unreadCount || 0 : 0,
      blogs: blogsRes.status === 'fulfilled' ? blogsRes.value.data || [] : [],
      offers: offersRes.status === 'fulfilled' ? offersRes.value.data || [] : [],
      reports: reportsRes.status === 'fulfilled'
        ? reportsRes.value.data || { candidateRegistrations: { total: 0, thisMonth: 0, last30Days: [] } }
        : { candidateRegistrations: { total: 0, thisMonth: 0, last30Days: [] } }
    });
  };

  useEffect(() => {
    loadDashboard().catch(() => {
      setState((current) => ({ ...current, loading: false }));
      toast.error('Failed to load the admin overview.');
    });
  }, []);

  const metrics = state.dashboard || fallbackDashboard;
  const activityFeed = useMemo(
    () => buildActivityFeed({
      applications: state.applications,
      jobs: state.jobs,
      contacts: state.contacts,
      blogs: state.blogs,
      notifications: state.notifications,
      registrations: state.reports?.candidateRegistrations?.last30Days || []
    }),
    [state.applications, state.jobs, state.contacts, state.blogs, state.notifications, state.reports]
  );

  const chartBars = useMemo(() => {
    const entries = [
      { label: 'Pending', value: state.jobCounts.pending || 0, tone: 'pending' },
      { label: 'Approved', value: state.jobCounts.approved || 0, tone: 'approved' },
      { label: 'Rejected', value: state.jobCounts.rejected || 0, tone: 'rejected' }
    ];
    const max = Math.max(1, ...entries.map((item) => item.value));
    return entries.map((item) => ({ ...item, width: `${Math.max(14, (item.value / max) * 100)}%` }));
  }, [state.jobCounts]);

  const quickActions = [
    { label: 'Manage Users', to: '/admin/users', icon: Users, description: 'Review employers, candidates, and account access.' },
    { label: 'Add Job', to: '/admin/jobs', icon: BriefcaseBusiness, description: 'Open job moderation and queue review tasks.' },
    { label: 'New Chat', to: '/admin/messages', icon: Mail, description: 'Start a direct chat with a candidate or employer.' },
    { label: 'Review Inquiries', to: '/admin/inquiries', icon: Mail, description: 'Reply to leads and clear new contact requests.' },
    { label: 'Publish Blog', to: '/admin/blogs/new', icon: PencilLine, description: 'Create or publish editorial updates.' },
    { label: 'View Reports', to: '/admin/reports', icon: FileDown, description: 'Inspect platform analytics and reporting views.' }
  ];

  const recentApplications = state.applications.slice(0, 5);
  const recentInquiries = state.contacts.slice(0, 4);
  const notifications = state.notifications.slice(0, 4);

  const statCards = [
    {
      label: 'Total jobs',
      value: metrics.totalJobs,
      hint: `${metrics.activeJobs} active listings live now`,
      trend: `${state.jobCounts.pending || 0} waiting for moderation`,
      icon: BriefcaseBusiness
    },
    {
      label: 'Pending jobs',
      value: metrics.pendingJobs,
      hint: 'Review queue needing admin attention',
      trend: `${state.jobCounts.rejected || 0} rejected recently`,
      icon: Clock3,
      tone: 'highlight'
    },
    {
      label: 'Applications',
      value: metrics.totalApplications,
      hint: `${state.applicationCounts.shortlisted || 0} shortlisted so far`,
      trend: `${state.applicationCounts.pending || 0} still pending review`,
      icon: TrendingUp
    },
    {
      label: 'Employers',
      value: metrics.totalEmployers,
      hint: 'Companies actively using Hirexo',
      trend: `${metrics.totalCandidates} candidates in the network`,
      icon: Users
    },
    {
      label: 'Content & inquiries',
      value: metrics.totalBlogs + metrics.totalContacts,
      hint: `${metrics.totalBlogs} blogs and ${metrics.totalContacts} inquiries`,
      trend: `${state.contactStats.new || 0} new inquiry${(state.contactStats.new || 0) === 1 ? '' : 'ies'} awaiting follow-up`,
      icon: FileText
    },
    {
      label: 'Notifications',
      value: state.unreadNotifications,
      hint: 'Unread platform alerts',
      trend: `${notifications.length} latest updates ready to review`,
      icon: Bell
    },
    {
      label: 'Offers',
      value: state.offers.length,
      hint: `${state.offers.filter((offer) => offer.status === 'sent').length} pending responses`,
      trend: `${state.offers.filter((offer) => offer.status === 'accepted').length} accepted so far`,
      icon: FileText
    }
  ];

  const handleModerationAction = async (jobId, action) => {
    try {
      setActioningJobId(jobId);
      if (action === 'approve') {
        await adminApi.approveJob(jobId);
        toast.success('Job approved successfully.');
      } else {
        await adminApi.rejectJob(jobId);
        toast.info('Job rejected.');
      }
      await loadDashboard();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} job.`);
    } finally {
      setActioningJobId('');
    }
  };

  if (state.loading) return <Loader label="Loading admin dashboard..." />;

  return (
    <>
      <Seo title="Admin Dashboard | Hirexo" description="Monitor activity, review moderation queues, and manage the Hirexo platform." />
      <DashboardHeader
        className="admin-workspace-header"
        title="Admin Dashboard"
        description="A premium control center for moderation, platform visibility, team actions, and day-to-day Hirexo operations."
        actions={(
          <>
            <Button as={Link} to="/admin/jobs" size="sm" variant="secondary">
              <BriefcaseBusiness size={16} />
              Add Job
            </Button>
            <Button as={Link} to="/admin/blogs/new" size="sm" variant="secondary">
              <PencilLine size={16} />
              Add Blog
            </Button>
            <Button as={Link} to="/admin/reports" size="sm" variant="ghost">
              <FileDown size={16} />
              Export Report
            </Button>
            <Button as={Link} to="/admin/messages" size="sm" variant="ghost">
              <Mail size={16} />
              New Chat
            </Button>
            <Button as={Link} to="/admin/notifications" size="sm">
              <Bell size={16} />
              View Notifications
            </Button>
          </>
        )}
      />

      <section className="admin-hero-strip">
        <div>
          <span className="admin-hero-badge"><ShieldCheck size={14} /> Admin workspace</span>
          <h2>Moderation, reporting, and communications in one operational view.</h2>
          <p>Stay on top of pending jobs, incoming inquiries, recent applications, and notification pressure without leaving the dashboard.</p>
        </div>
        <div className="admin-hero-pills">
          <span><Sparkles size={14} /> {metrics.activeJobs} live jobs</span>
          <span><CircleAlert size={14} /> {metrics.pendingJobs} pending reviews</span>
          <span><CheckCheck size={14} /> {state.applicationCounts.reviewed || 0} reviewed applications</span>
          <span><Sparkles size={14} /> {state.applicationCounts.hired || 0} hired</span>
        </div>
      </section>

      <div className="dashboard-grid admin-stat-grid">
        {statCards.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            trend={item.trend}
            icon={item.icon}
            tone={item.tone}
            className="admin-stat-card"
          />
        ))}
      </div>

      <section className="admin-dashboard-layout mt-1">
        <Card className="admin-panel admin-panel-wide">
          <div className="panel-head admin-panel-head">
            <div>
              <p className="section-eyebrow">Moderation queue</p>
              <h3>Pending Moderation</h3>
            </div>
            <Button as={Link} to="/admin/jobs" size="sm" variant="secondary">
              Review all
            </Button>
          </div>

          {state.jobs.length ? (
            <div className="admin-moderation-list">
              {state.jobs.slice(0, 5).map((job) => (
                <article key={job._id} className="admin-moderation-item">
                  <div className="admin-moderation-main">
                    <div className="admin-moderation-title-row">
                      <h4>{job.title}</h4>
                      <Badge tone={getBadgeTone(job.reviewStatus)}>{job.reviewStatus || 'pending'}</Badge>
                    </div>
                    <p>{job.companyName || job.employerUser?.name || 'Employer account'}</p>
                    <div className="admin-moderation-meta">
                      <span>Submitted {formatDate(job.createdAt)}</span>
                      <span>{job.employerUser?.email || 'Employer details available in moderation view'}</span>
                    </div>
                  </div>
                  <div className="admin-moderation-actions">
                    <Button as={Link} to="/admin/jobs" size="sm" variant="ghost">Review</Button>
                    <Button size="sm" disabled={actioningJobId === job._id} onClick={() => handleModerationAction(job._id, 'approve')}>
                      {actioningJobId === job._id ? 'Saving...' : 'Approve'}
                    </Button>
                    <Button size="sm" variant="secondary" disabled={actioningJobId === job._id} onClick={() => handleModerationAction(job._id, 'reject')}>
                      Reject
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><CheckCheck size={22} /></div>
              <div>
                <h4>Moderation queue is clear</h4>
                <p>No pending job submissions right now. Approved, rejected, and future moderation tasks will show up here in a polished review queue.</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="admin-panel">
          <div className="panel-head admin-panel-head">
            <div>
              <p className="section-eyebrow">Analytics snapshot</p>
              <h3>Jobs by status</h3>
            </div>
            <Badge tone="neutral">Live overview</Badge>
          </div>
          <div className="admin-chart">
            {chartBars.map((item) => (
              <div key={item.label} className="admin-chart-row">
                <div className="admin-chart-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="admin-chart-track">
                  <span className={`admin-chart-fill admin-chart-fill-${item.tone}`} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
          <div className="admin-analytics-foot">
            <span>{metrics.activeJobs} currently active</span>
            <span>{state.applicationCounts.all || 0} total applications tracked</span>
          </div>
        </Card>

        <Card className="admin-panel">
          <div className="panel-head admin-panel-head">
            <div>
              <p className="section-eyebrow">Admin feed</p>
              <h3>Recent Activity</h3>
            </div>
            <Badge tone="success">{activityFeed.length} events</Badge>
          </div>
          <div className="admin-activity-feed">
            {activityFeed.map((item) => (
              <article key={item.id} className="admin-activity-item">
                <span className={`admin-activity-dot admin-activity-dot-${item.type}`} aria-hidden="true" />
                <div>
                  <div className="admin-activity-title-row">
                    <strong>{item.title}</strong>
                    <small>{getRelativeTime(item.date)}</small>
                  </div>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card className="admin-panel">
          <div className="panel-head admin-panel-head">
            <div>
              <p className="section-eyebrow">Operational shortcuts</p>
              <h3>Quick Actions</h3>
            </div>
          </div>
          <div className="admin-quick-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.to} className="admin-quick-action-card">
                  <span className="admin-quick-action-icon"><Icon size={18} /></span>
                  <strong>{action.label}</strong>
                  <p>{action.description}</p>
                  <span className="admin-quick-action-link">Open <ArrowRight size={14} /></span>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="admin-panel">
          <div className="panel-head admin-panel-head">
            <div>
              <p className="section-eyebrow">Application pipeline</p>
              <h3>Recent Applications</h3>
            </div>
            <Button as={Link} to="/admin/jobs" size="sm" variant="ghost">Open moderation</Button>
          </div>
          <div className="admin-mini-list">
            {recentApplications.length ? recentApplications.map((application) => (
              <article key={application._id} className="admin-mini-item">
                <div>
                  <strong>{application.candidateUser?.name || 'Candidate'}</strong>
                  <p>{application.job?.title || 'Job'} at {application.job?.companyName || 'Employer'}</p>
                </div>
                <div className="admin-mini-meta">
                  <Badge tone={getBadgeTone(application.status)}>{application.status || 'pending'}</Badge>
                  <small>{formatDate(application.createdAt)}</small>
                  <Link to={`/admin/messages?applicationId=${application._id}&recipientRole=candidate`} className="link-button">
                    Chat <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            )) : (
              <div className="admin-empty-inline">Recent applications will appear here when candidates start applying.</div>
            )}
          </div>
        </Card>

        <Card className="admin-panel">
          <div className="panel-head admin-panel-head">
            <div>
              <p className="section-eyebrow">Inbox health</p>
              <h3>Recent Inquiries</h3>
            </div>
            <Button as={Link} to="/admin/inquiries" size="sm" variant="secondary">Open inquiries</Button>
          </div>
          <div className="admin-mini-list">
            {recentInquiries.length ? recentInquiries.map((inquiry) => (
              <article key={inquiry._id} className="admin-mini-item">
                <div>
                  <strong>{inquiry.name}</strong>
                  <p>{inquiry.subject || 'General inquiry'}</p>
                </div>
                <div className="admin-mini-meta">
                  <Badge tone={getBadgeTone(inquiry.status)}>{inquiry.status || 'new'}</Badge>
                  <small>{formatDate(inquiry.createdAt)}</small>
                </div>
              </article>
            )) : (
              <div className="admin-empty-inline">No inquiries yet. New contact submissions will surface here.</div>
            )}
          </div>
        </Card>

        <Card className="admin-panel">
          <div className="panel-head admin-panel-head">
            <div>
              <p className="section-eyebrow">Alerts</p>
              <h3>Notifications Summary</h3>
            </div>
            <Badge tone={state.unreadNotifications ? 'success' : 'neutral'}>
              {state.unreadNotifications} unread
            </Badge>
          </div>
          <div className="admin-notification-summary">
            <div className="admin-notification-stats">
              <div>
                <strong>{state.unreadNotifications}</strong>
                <span>Unread alerts</span>
              </div>
              <div>
                <strong>{state.contactStats.new || 0}</strong>
                <span>New inquiries</span>
              </div>
              <div>
                <strong>{metrics.publishedBlogs}</strong>
                <span>Published blogs</span>
              </div>
            </div>
            <div className="admin-notification-list">
              {notifications.length ? notifications.map((item) => (
                <article key={item._id} className={`admin-notification-item ${item.isRead ? '' : 'is-unread'}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                  </div>
                  <small>{formatDateTime(item.createdAt)}</small>
                </article>
              )) : (
                <div className="admin-empty-inline">Notification updates will appear here once the platform generates them.</div>
              )}
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
