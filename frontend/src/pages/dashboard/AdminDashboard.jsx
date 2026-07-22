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
    { label: 'Policy updates', value: metrics.totalBlogs, icon: FileText },
    { label: 'New inquiries', value: state.contactStats.new || 0, icon: Activity }
  ];

  if (state.loading) return <Loader label="Loading admin dashboard..." />;

  return (
    <>
      <Seo title="Premium Admin Dashboard | HEXORA" description="Modern enterprise command center for HEXORA administration." />

      <motion.div className="premium-admin-dashboard admin-dashboard-page" initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.35 }}>
        <section className="admin-hero-block premium-glass" aria-labelledby="admin-hero-title">
          <div className="admin-hero-copy">
            <p className="premium-kicker">ADMIN COMMAND CENTER</p>
            <h1 id="admin-hero-title">Welcome back, Admin</h1>
            <p>Monitor jobs, employers, candidates, applications, analytics, moderation and platform activity from one premium command view.</p>
            <div className="admin-hero-tags">
              <span>Live platform overview</span>
              <span>Real-time intelligence</span>
              <span>Operational control</span>
            </div>
            <div className="admin-hero-actions">
              <Link to="/admin/jobs" className="premium-btn premium-btn-soft"><BriefcaseBusiness size={16} /> Add Job</Link>
              <Link to="/admin/blogs/new" className="premium-btn premium-btn-soft"><PencilLine size={16} /> Add Blog</Link>
              <Link to="/admin/reports" className="premium-btn premium-btn-soft"><FileDown size={16} /> Export Report</Link>
              <Link to="/admin/messages" className="premium-btn premium-btn-primary"><Mail size={16} /> New Chat</Link>
            </div>
          </div>

          <div className="admin-hero-panel">
            <div className="admin-hero-stats">
              {heroStats.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="admin-hero-stat-card">
                    <span className="admin-hero-stat-icon"><Icon size={18} /></span>
                    <div>
                      <strong>{item.value}</strong>
                      <p>{item.label}</p>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="admin-hero-chart-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={applicationTrendData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#d9e8df" strokeDasharray="4 6" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4f6f5f' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4f6f5f' }} />
                  <Tooltip contentStyle={{ borderRadius: 20, borderColor: '#d9e8df' }} />
                  <Area type="monotone" dataKey="value" stroke="#15803d" strokeWidth={3} fill="url(#heroAreaGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="admin-stat-grid">
          {statCards.slice(0, 6).map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.label}
                className="premium-stat-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 * index }}
              >
                <div className="premium-stat-row">
                  <span className="premium-stat-badge"><Icon size={18} /></span>
                  <div>
                    <p>{card.label}</p>
                    <strong>{card.value}</strong>
                  </div>
                </div>
                <small>{card.subtitle}</small>
              </motion.article>
            );
          })}
        </section>

        <section className="premium-main-grid">
          <div className="premium-left-column">
            <article className="premium-panel premium-glass">
              <div className="premium-panel-head">
                <div>
                  <p className="premium-kicker">Platform summary</p>
                  <h3>Operational overview</h3>
                </div>
                <span className="premium-status-pill">Live data</span>
              </div>
              <div className="premium-summary-grid">
                <div>
                  <strong>{metrics.totalJobs}</strong>
                  <p>Total jobs</p>
                </div>
                <div>
                  <strong>{metrics.totalEmployers}</strong>
                  <p>Total employers</p>
                </div>
                <div>
                  <strong>{metrics.totalCandidates}</strong>
                  <p>Total candidates</p>
                </div>
                <div>
                  <strong>{metrics.totalApplications}</strong>
                  <p>Total applications</p>
                </div>
                <div>
                  <strong>{state.applicationCounts.interview_scheduled || 0}</strong>
                  <p>Interviews scheduled</p>
                </div>
                <div>
                  <strong>{state.unreadNotifications}</strong>
                  <p>Unread alerts</p>
                </div>
              </div>
            </article>

            <article className="premium-panel premium-glass">
              <div className="premium-panel-head">
                <div>
                  <p className="premium-kicker">Recent activity</p>
                  <h3>Platform timeline</h3>
                </div>
                <Link to="/admin/reports" className="premium-link">View all</Link>
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
                )) : <div className="premium-empty">Recent activity will appear once events happen.</div>}
              </div>
            </article>

            <article className="premium-panel premium-glass">
              <div className="premium-panel-head">
                <div>
                  <p className="premium-kicker">Moderation queue</p>
                  <h3>Pending reviews</h3>
                </div>
                <Link to="/admin/jobs" className="premium-link">Review all</Link>
              </div>
              <div className="premium-review-list">
                {moderationList.length ? moderationList.map((job) => (
                  <article key={job._id} className="premium-review-item">
                    <div>
                      <strong>{job.title}</strong>
                      <small>{job.companyName || job.employerUser?.name || 'Employer account'}</small>
                    </div>
                    <div className="premium-review-meta">
                      <span className={`premium-badge ${getBadgeTone(job.reviewStatus)}`}>{job.reviewStatus || 'pending'}</span>
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                  </article>
                )) : <div className="premium-empty">No moderation tasks at the moment.</div>}
              </div>
            </article>

            <article className="premium-panel premium-glass">
              <div className="premium-panel-head">
                <div>
                  <p className="premium-kicker">Notifications</p>
                  <h3>System alerts</h3>
                </div>
                <Link to="/admin/notifications" className="premium-link">Open alerts</Link>
              </div>
              <div className="premium-notification-card-grid">
                {notificationCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.label} className="premium-notification-card">
                      <span><Icon size={16} /></span>
                      <div>
                        <strong>{item.value}</strong>
                        <p>{item.label}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </article>
          </div>

          <div className="premium-right-column">
            <article className="premium-panel premium-glass premium-chart-panel">
              <div className="premium-panel-head">
                <div>
                  <p className="premium-kicker">Analytics</p>
                  <h3>Application trend</h3>
                </div>
              </div>
              <div className="premium-chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={applicationTrendData} margin={{ top: 14, right: 14, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="applicationTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#d9e8df" strokeDasharray="4 6" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4f6f5f' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4f6f5f' }} />
                    <Tooltip contentStyle={{ borderRadius: 20, borderColor: '#d9e8df' }} />
                    <Line type="monotone" dataKey="value" stroke="#15803d" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} />
                    <Area type="monotone" dataKey="value" stroke="none" fill="url(#applicationTrendGradient)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="premium-panel premium-glass premium-chart-panel">
              <div className="premium-panel-head">
                <div>
                  <p className="premium-kicker">Job growth</p>
                  <h3>Status distribution</h3>
                </div>
              </div>
              <div className="premium-chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={jobStatusData} margin={{ top: 14, right: 14, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#d9e8df" strokeDasharray="4 6" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4f6f5f' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4f6f5f' }} />
                    <Tooltip cursor={{ fill: 'rgba(33, 150, 83, 0.08)' }} contentStyle={{ borderRadius: 20, borderColor: '#d9e8df' }} />
                    <Bar dataKey="value" fill="#22c55e" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="premium-panel premium-glass premium-chart-panel">
              <div className="premium-panel-head">
                <div>
                  <p className="premium-kicker">Platform health</p>
                  <h3>Live performance</h3>
                </div>
              </div>
              <div className="premium-chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={platformActivityData} margin={{ top: 14, right: 14, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="platformActivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#86efac" stopOpacity={0.38} />
                        <stop offset="100%" stopColor="#86efac" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#d9e8df" strokeDasharray="4 6" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4f6f5f' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4f6f5f' }} />
                    <Tooltip contentStyle={{ borderRadius: 20, borderColor: '#d9e8df' }} />
                    <Area type="monotone" dataKey="value" stroke="#15803d" strokeWidth={3} fill="url(#platformActivityGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="premium-panel premium-glass premium-performance-panel">
              <div className="premium-panel-head">
                <div>
                  <p className="premium-kicker">Performance metrics</p>
                  <h3>Operational pulse</h3>
                </div>
              </div>
              <div className="premium-performance-grid">
                {notificationCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.label} className="premium-performance-card">
                      <div className="premium-performance-icon"><Icon size={16} /></div>
                      <div>
                        <strong>{item.value}</strong>
                        <p>{item.label}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </article>
          </div>
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
