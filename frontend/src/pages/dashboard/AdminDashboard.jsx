import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
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
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  UserCheck,
  CircleDashed,
  ScanLine,
  Wrench,
  MessageSquareMore,
  NotebookText,
  Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/admin.api';
import { contactApi } from '../../services/contact.api';
import { notificationsApi } from '../../services/notifications.api';
import { blogApi } from '../../services/blog.api';
import { formatDate, formatDateTime } from '../../utils/formatters';
import '../../styles/admin-dashboard-premium.css';

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
  if (!value) return 'Just now';

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Just now';

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
  if (['approved', 'published', 'active', 'shortlisted', 'hired', 'replied', 'read'].includes(normalized)) return 'is-success';
  if (['rejected', 'blocked'].includes(normalized)) return 'is-danger';
  return 'is-neutral';
}

function buildActivityFeed({ applications, jobs, contacts, blogs, notifications, registrations }) {
  const registrationActivity = (registrations || [])
    .slice(-2)
    .map((entry) => ({
      id: `registration-${entry.date}`,
      type: 'candidate',
      title: `${entry.count} candidate${entry.count === 1 ? '' : 's'} registered`,
      description: 'New signups joined the HEXORA talent network.',
      date: entry.date,
      timestamp: new Date(entry.date).getTime() || 0
    }));

  const applicationActivity = (applications || []).slice(0, 3).map((item) => ({
    id: `application-${item._id}`,
    type: 'application',
    title: `${item.candidateUser?.name || 'A candidate'} applied`,
    description: `${item.job?.title || 'Job'} at ${item.job?.companyName || 'HEXORA employer'}.`,
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

function formatTrend(value) {
  const numeric = Number(value) || 0;
  if (numeric >= 50) return '+22%';
  if (numeric >= 20) return '+14%';
  if (numeric >= 10) return '+9%';
  if (numeric > 0) return '+4%';
  return '0%';
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [actioningJobId, setActioningJobId] = useState('');
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

  const loadDashboard = async () => {
    const [dashboardRes, jobsRes, applicationsRes, contactsRes, notificationsRes, blogsRes, reportsRes, offersRes] = await Promise.allSettled([
      adminApi.dashboard(),
      adminApi.pendingJobs(),
      adminApi.applications({ status: 'all' }),
      contactApi.list({ limit: 8 }),
      notificationsApi.mine({ limit: 8 }),
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

  const moderationList = state.jobs.slice(0, 5);
  const notifications = state.notifications.slice(0, 4);

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

  const statCards = [
    { label: 'Total Jobs', value: metrics.totalJobs, icon: BriefcaseBusiness, growth: formatTrend(metrics.totalJobs), subtitle: `${metrics.activeJobs} active listings` },
    { label: 'Pending Jobs', value: state.jobCounts.pending || metrics.pendingJobs, icon: Clock3, growth: formatTrend(state.jobCounts.pending), subtitle: 'Awaiting moderation review' },
    { label: 'Applications', value: metrics.totalApplications, icon: FileText, growth: formatTrend(metrics.totalApplications), subtitle: `${state.applicationCounts.shortlisted || 0} shortlisted` },
    { label: 'Employers', value: metrics.totalEmployers, icon: Users, growth: formatTrend(metrics.totalEmployers), subtitle: 'Verified employer accounts' },
    { label: 'Content & Inquiries', value: metrics.totalBlogs + metrics.totalContacts, icon: NotebookText, growth: formatTrend(metrics.totalBlogs + metrics.totalContacts), subtitle: `${state.contactStats.new || 0} new inquiries` },
    { label: 'Notifications', value: state.unreadNotifications, icon: Bell, growth: formatTrend(state.unreadNotifications), subtitle: 'Unread operational alerts' },
    { label: 'Interviews', value: state.applicationCounts.interview_scheduled || 0, icon: UserCheck, growth: formatTrend(state.applicationCounts.interview_scheduled), subtitle: 'Scheduled interview stages' },
    { label: 'System Health', value: state.unreadNotifications > 8 ? 'At Risk' : 'Stable', icon: ShieldCheck, growth: state.unreadNotifications > 8 ? '-6%' : '+3%', subtitle: 'Platform operations signal' }
  ];

  const heroStats = [
    { label: 'Live Jobs', value: metrics.activeJobs, icon: BriefcaseBusiness },
    { label: 'Pending Reviews', value: state.jobCounts.pending || 0, icon: CircleAlert },
    { label: 'Reviewed Applications', value: state.applicationCounts.reviewed || 0, icon: CheckCheck },
    { label: 'Active Employers', value: metrics.totalEmployers, icon: Users }
  ];

  const quickActions = [
    { label: 'Manage Users', to: '/admin/users', icon: Users, description: 'Review roles, verification, and account controls.' },
    { label: 'Add Job', to: '/admin/jobs', icon: BriefcaseBusiness, description: 'Open moderation board and create job postings.' },
    { label: 'New Chat', to: '/admin/messages', icon: MessageSquareMore, description: 'Start direct conversations with candidates.' },
    { label: 'Review Inquiries', to: '/admin/inquiries', icon: ScanLine, description: 'Reply to new contact requests and leads.' },
    { label: 'Publish Blog', to: '/admin/blogs/new', icon: PencilLine, description: 'Ship product updates and editorial releases.' },
    { label: 'View Reports', to: '/admin/reports', icon: FileDown, description: 'Inspect analytics with export-ready summaries.' }
  ];

  const jobStatusData = [
    { name: 'Pending', value: state.jobCounts.pending || 0 },
    { name: 'Approved', value: state.jobCounts.approved || 0 },
    { name: 'Rejected', value: state.jobCounts.rejected || 0 }
  ];

  const userGrowthData = (state.reports?.candidateRegistrations?.last30Days || [])
    .slice(-10)
    .map((entry) => ({
      name: formatDate(entry.date).slice(0, 6),
      users: entry.count || 0
    }));

  const fallbackGrowth = [
    { name: 'W1', users: 0 },
    { name: 'W2', users: 0 },
    { name: 'W3', users: 0 },
    { name: 'W4', users: 0 }
  ];

  const platformActivityData = [
    { name: 'Jobs', value: metrics.totalJobs || 0 },
    { name: 'Apps', value: metrics.totalApplications || 0 },
    { name: 'Inquiries', value: state.contactStats.total || 0 },
    { name: 'Alerts', value: state.notifications.length || 0 },
    { name: 'Blogs', value: metrics.totalBlogs || 0 }
  ];

  const applicationTrendData = [
    { name: 'Applied', value: state.applicationCounts.pending || 0 },
    { name: 'Screening', value: state.applicationCounts.reviewed || 0 },
    { name: 'Interview', value: state.applicationCounts.interview_scheduled || 0 },
    { name: 'Approved', value: state.applicationCounts.shortlisted || 0 },
    { name: 'Hired', value: state.applicationCounts.hired || 0 }
  ];

  const pipelineSteps = [
    { label: 'Applied', count: state.applicationCounts.pending || 0, icon: CircleDashed },
    { label: 'Screening', count: state.applicationCounts.reviewed || 0, icon: ScanLine },
    { label: 'Interview', count: state.applicationCounts.interview_scheduled || 0, icon: Users },
    { label: 'Approved', count: state.applicationCounts.shortlisted || 0, icon: CheckCheck },
    { label: 'Hired', count: state.applicationCounts.hired || 0, icon: Sparkles }
  ];

  const notificationCards = [
    { label: 'Unread alerts', value: state.unreadNotifications, icon: Bell },
    { label: 'System updates', value: state.notifications.length, icon: Wrench },
    { label: 'Policy updates', value: metrics.publishedBlogs, icon: FileText },
    { label: 'Maintenance alerts', value: state.contactStats.new || 0, icon: Activity }
  ];

  if (state.loading) return <Loader label="Loading admin dashboard..." />;

  return (
    <>
      <Seo title="Premium Admin Dashboard | HEXORA" description="Luxury SaaS command center for moderation, analytics, communication, and operations." />

      <motion.div className="premium-admin-dashboard" initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.35 }}>
        <motion.header className="premium-admin-header premium-glass" variants={fadeUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <div className="premium-admin-header-copy">
            <p className="premium-kicker">Admin Command Center</p>
            <h1>Welcome back, Admin 👋</h1>
            <p>Monitor jobs, employers, moderation, analytics, and platform activity.</p>
            <div className="premium-header-subline">
              <span>Live platform oversight</span>
              <span>Moderation ready</span>
              <span>Real-time updates</span>
            </div>
          </div>

          <div className="premium-admin-header-actions">
            <div className="premium-header-toprow">
              <label className="premium-search" htmlFor="admin-dashboard-search">
                <Search size={16} />
                <input
                  id="admin-dashboard-search"
                  type="search"
                  placeholder="Search anything..."
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </label>

              <button type="button" className="premium-icon-btn" aria-label="Open notifications">
                <Bell size={18} />
                {state.unreadNotifications > 0 ? <span>{state.unreadNotifications}</span> : null}
              </button>

              <div className="premium-profile-pill">
                <div className="premium-profile-avatar">{String(user?.name || 'Admin').trim().charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{user?.name || 'Admin User'}</strong>
                  <small>Super Admin</small>
                </div>
              </div>
            </div>

            <div className="premium-actions-row">
              <Link to="/admin/jobs" className="premium-btn premium-btn-soft"><BriefcaseBusiness size={16} /> Add Job</Link>
              <Link to="/admin/blogs/new" className="premium-btn premium-btn-soft"><PencilLine size={16} /> Add Blog</Link>
              <Link to="/admin/reports" className="premium-btn premium-btn-soft"><FileDown size={16} /> Export Report</Link>
              <Link to="/admin/messages" className="premium-btn premium-btn-primary"><Mail size={16} /> New Chat</Link>
            </div>
          </div>
        </motion.header>

        <motion.section className="premium-admin-hero" variants={fadeUp} transition={{ duration: 0.45, delay: 0.08 }}>
          <div className="premium-admin-hero-content">
            <p className="premium-kicker">Admin Workspace</p>
            <h2>Moderation, reporting, and communication in one operational view</h2>
            <p>
              Monitor jobs, employers, moderation queue, analytics, and notifications in real time.
            </p>
            <div className="premium-hero-cta-row">
              <Link to="/admin/notifications" className="premium-btn premium-btn-primary">View Notifications</Link>
              <Link to="/admin/reports" className="premium-btn premium-btn-ghost">View Reports</Link>
            </div>
          </div>

          <div className="premium-admin-hero-visual">
            <div className="premium-screen-mock premium-glass">
              <div className="premium-screen-head">
                <span />
                <span />
                <span />
              </div>
              <div className="premium-screen-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={applicationTrendData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="heroChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#79f1bc" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#79f1bc" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area dataKey="value" stroke="#91ffd2" strokeWidth={2} fill="url(#heroChart)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="premium-float-cards">
              {heroStats.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.article key={item.label} className="premium-float-card" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                    <span><Icon size={14} /></span>
                    <div>
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </motion.section>

        <section className="premium-stats-grid">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.label}
                className="premium-stat-card premium-glass"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.03 * index }}
              >
                <div className="premium-stat-head">
                  <p>{card.label}</p>
                  <span className="premium-stat-icon"><Icon size={18} /></span>
                </div>
                <strong>{card.value}</strong>
                <div className="premium-stat-foot">
                  <span>{card.subtitle}</span>
                  <em>{card.growth}</em>
                </div>
              </motion.article>
            );
          })}
        </section>

        <section className="premium-main-grid">
          <article className="premium-panel premium-panel-wide premium-glass">
            <div className="premium-panel-head">
              <div>
                <p className="premium-kicker">Moderation Queue</p>
                <h3>Pending Moderation Workspace</h3>
              </div>
              <Link to="/admin/jobs" className="premium-btn premium-btn-soft">Review All</Link>
            </div>

            {moderationList.length ? (
              <div className="premium-moderation-list">
                {moderationList.map((job) => {
                  const ageHours = Math.max(1, Math.round((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60)));
                  const priority = ageHours > 72 ? 'High Priority' : ageHours > 24 ? 'Priority' : 'Normal';

                  return (
                    <article key={job._id} className="premium-moderation-item">
                      <div className="premium-moderation-main">
                        <div className="premium-moderation-title">
                          <h4>{job.title}</h4>
                          <span className={`premium-status-badge ${getBadgeTone(job.reviewStatus)}`}>{job.reviewStatus || 'pending'}</span>
                        </div>
                        <p>{job.companyName || job.employerUser?.name || 'Employer account'}</p>
                        <div className="premium-moderation-meta">
                          <span>Submitted {formatDate(job.createdAt)}</span>
                          <span>{priority}</span>
                          <span>{job.employerUser?.email || 'Employer details available in moderation view'}</span>
                        </div>
                      </div>

                      <div className="premium-moderation-actions">
                        <Link to="/admin/jobs" className="premium-btn premium-btn-ghost">Review</Link>
                        <button
                          type="button"
                          className="premium-btn premium-btn-primary"
                          disabled={actioningJobId === job._id}
                          onClick={() => handleModerationAction(job._id, 'approve')}
                        >
                          {actioningJobId === job._id ? 'Saving...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          className="premium-btn premium-btn-soft"
                          disabled={actioningJobId === job._id}
                          onClick={() => handleModerationAction(job._id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="premium-empty">Moderation queue is clear. New jobs requiring review will appear here.</div>
            )}
          </article>

          <article className="premium-panel premium-glass">
            <div className="premium-panel-head compact">
              <div>
                <p className="premium-kicker">Analytics</p>
                <h3>Job Status</h3>
              </div>
            </div>
            <div className="premium-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStatusData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.09)" />
                  <XAxis dataKey="name" tick={{ fill: '#d3f9e7', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#d3f9e7', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7bf0bc" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="premium-panel premium-glass">
            <div className="premium-panel-head compact">
              <div>
                <p className="premium-kicker">Analytics</p>
                <h3>User Growth</h3>
              </div>
            </div>
            <div className="premium-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData.length ? userGrowthData : fallbackGrowth} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e6ab" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#67e6ab" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#d3f9e7', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#d3f9e7', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#81ffd0" strokeWidth={2} fill="url(#userGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="premium-panel premium-glass">
            <div className="premium-panel-head compact">
              <div>
                <p className="premium-kicker">Analytics</p>
                <h3>Platform Activity</h3>
              </div>
            </div>
            <div className="premium-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={platformActivityData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#d3f9e7', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#d3f9e7', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#a6ffdb" strokeWidth={2.2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="premium-panel premium-glass">
            <div className="premium-panel-head compact">
              <div>
                <p className="premium-kicker">Analytics</p>
                <h3>Applications Trend</h3>
              </div>
            </div>
            <div className="premium-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationTrendData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="applicationTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#96fdd2" stopOpacity={0.78} />
                      <stop offset="100%" stopColor="#96fdd2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#d3f9e7', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#d3f9e7', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#afffe0" strokeWidth={2.1} fill="url(#applicationTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="premium-grid-two">
          <article className="premium-panel premium-glass">
            <div className="premium-panel-head">
              <div>
                <p className="premium-kicker">Admin Feed</p>
                <h3>Recent Activity Timeline</h3>
              </div>
              <span className="premium-inline-chip">{activityFeed.length} events</span>
            </div>
            <div className="premium-timeline">
              {activityFeed.length ? activityFeed.map((item) => (
                <article key={item.id} className="premium-timeline-item">
                  <span className={`premium-dot dot-${item.type}`} aria-hidden="true" />
                  <div>
                    <div className="premium-timeline-top">
                      <strong>{item.title}</strong>
                      <small>{getRelativeTime(item.date)}</small>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </article>
              )) : <div className="premium-empty">Recent activity will appear once events are generated.</div>}
            </div>
          </article>

          <article className="premium-panel premium-glass">
            <div className="premium-panel-head">
              <div>
                <p className="premium-kicker">Operational Shortcuts</p>
                <h3>Quick Actions</h3>
              </div>
            </div>
            <div className="premium-actions-grid">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} to={action.to} className="premium-action-card">
                    <span><Icon size={16} /></span>
                    <strong>{action.label}</strong>
                    <p>{action.description}</p>
                    <em>Open <ArrowRight size={13} /></em>
                  </Link>
                );
              })}
            </div>
          </article>
        </section>

        <section className="premium-grid-two">
          <article className="premium-panel premium-glass">
            <div className="premium-panel-head">
              <div>
                <p className="premium-kicker">Applications Pipeline</p>
                <h3>Applied to Hired Flow</h3>
              </div>
            </div>
            <div className="premium-pipeline-row">
              {pipelineSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="premium-pipeline-step">
                    <span><Icon size={14} /></span>
                    <small>{step.label}</small>
                    <strong>{step.count}</strong>
                    {index < pipelineSteps.length - 1 ? <i aria-hidden="true" /> : null}
                  </div>
                );
              })}
            </div>
          </article>

          <article className="premium-panel premium-glass">
            <div className="premium-panel-head">
              <div>
                <p className="premium-kicker">Notification Summary</p>
                <h3>Platform Alerts</h3>
              </div>
              <Link to="/admin/notifications" className="premium-btn premium-btn-ghost">Open Alerts</Link>
            </div>
            <div className="premium-notification-card-grid">
              {notificationCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="premium-notification-card">
                    <span><Icon size={15} /></span>
                    <strong>{item.value}</strong>
                    <p>{item.label}</p>
                  </article>
                );
              })}
            </div>
            <div className="premium-notification-list">
              {notifications.length ? notifications.map((item) => (
                <article key={item._id} className={`premium-notification-item ${item.isRead ? '' : 'is-unread'}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                  </div>
                  <small>{formatDateTime(item.createdAt)}</small>
                </article>
              )) : <div className="premium-empty">No notification updates yet.</div>}
            </div>
          </article>
        </section>
      </motion.div>
    </>
  );
}
