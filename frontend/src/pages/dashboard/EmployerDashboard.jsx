import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  FolderKanban,
  Gauge,
  HandCoins,
  LineChart,
  ListChecks,
  Mail,
  MessageSquareText,
  PlusSquare,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { employerApi } from '../../services/employer.api';
import { formatDate } from '../../utils/formatters';

const fallbackDashboard = {
  totalJobs: 0,
  pendingJobs: 0,
  activeJobs: 0,
  totalApplications: 0,
  shortlistedApplications: 0,
  hiredApplications: 0
};

function formatStatus(status = '') {
  return String(status || 'unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getJobBadge(job) {
  const reviewStatus = String(job?.reviewStatus || '').toLowerCase();
  const lifecycleStatus = String(job?.status || '').toLowerCase();

  if (reviewStatus === 'pending') return { label: 'Pending review', tone: 'neutral' };
  if (reviewStatus === 'rejected') return { label: 'Rejected', tone: 'danger' };
  if (lifecycleStatus === 'active') return { label: 'Active', tone: 'success' };
  if (lifecycleStatus === 'expired') return { label: 'Expired', tone: 'neutral' };
  if (lifecycleStatus === 'inactive') return { label: 'Inactive', tone: 'neutral' };
  return { label: formatStatus(reviewStatus || lifecycleStatus || 'draft'), tone: 'neutral' };
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function makeLinePoints(items, maxValue) {
  if (!items.length) return '';
  const width = 520;
  const height = 190;
  const gap = items.length > 1 ? width / (items.length - 1) : width;

  return items
    .map((item, index) => {
      const x = Math.round(index * gap);
      const y = Math.round(height - (item.count / maxValue) * 150 - 20);
      return `${x},${y}`;
    })
    .join(' ');
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: true,
    dashboard: fallbackDashboard,
    jobs: [],
    applicationsByJob: {},
    applications: []
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const [dashRes, jobsRes] = await Promise.allSettled([employerApi.dashboard(), employerApi.jobs()]);
      const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value.data || [] : [];
      const dashboard = dashRes.status === 'fulfilled' ? { ...fallbackDashboard, ...(dashRes.value.data || {}) } : fallbackDashboard;

      const applicantResults = await Promise.allSettled(jobs.map((job) => employerApi.applicants(job._id)));
      const applicationsByJob = {};
      const applications = [];

      jobs.forEach((job, index) => {
        const result = applicantResults[index];
        const list = result?.status === 'fulfilled' ? result.value.data?.applications || [] : [];
        applicationsByJob[job._id] = list;
        list.forEach((application) => {
          applications.push({
            ...application,
            jobId: job._id,
            jobTitle: job.title
          });
        });
      });

      if (!isMounted) return;

      setState({
        loading: false,
        dashboard,
        jobs,
        applicationsByJob,
        applications
      });
    };

    loadDashboard().catch(() => {
      if (!isMounted) return;
      setState({
        loading: false,
        dashboard: fallbackDashboard,
        jobs: [],
        applicationsByJob: {},
        applications: []
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = { ...fallbackDashboard, ...(state.dashboard || {}) };
  const applicantTargetJob = state.jobs.find((job) => job.reviewStatus === 'approved') || state.jobs[0];
  const applicantsRoute = applicantTargetJob ? `/employer/jobs/${applicantTargetJob._id}/applicants` : '/employer/jobs';

  const workflowSteps = [
    {
      title: 'Post role',
      description: 'Create an opening and publish it to the portal.',
      to: '/employer/jobs/new',
      icon: PlusSquare
    },
    {
      title: 'Review candidates',
      description: 'Open applications and shortlist top fits.',
      to: applicantsRoute,
      icon: Users
    },
    {
      title: 'Schedule interviews',
      description: 'Book interview slots for your shortlisted talent.',
      to: '/employer/interviews',
      icon: CalendarClock
    },
    {
      title: 'Issue offers',
      description: 'Send offers and close hires in one place.',
      to: '/employer/offers',
      icon: HandCoins
    }
  ];

  const dashboardGroups = [
    {
      key: 'hire',
      icon: BriefcaseBusiness,
      label: 'Hire',
      description: 'Job creation, candidate review, interview scheduling, and offers.',
      items: [
        { title: 'Post Job', description: 'Create and publish a role instantly.', to: '/employer/jobs/new', icon: PlusSquare },
        { title: 'Manage Jobs', description: 'Edit, clone, or close live listings.', to: '/employer/jobs', icon: BriefcaseBusiness },
        { title: 'Applicants', description: 'Review candidates and move them through stages.', to: applicantsRoute, icon: Users },
        { title: 'Interviews', description: 'Book and manage interview rounds.', to: '/employer/interviews', icon: CalendarClock },
        { title: 'Offers', description: 'Send offers and track acceptance.', to: '/employer/offers', icon: HandCoins },
        { title: 'Talent Pool', description: 'Search saved candidate matches.', to: '/employer/talent-pool', icon: UserPlus }
      ]
    },
    {
      key: 'manage',
      icon: Users,
      label: 'Manage',
      description: 'Team collaboration, approvals, analytics, and operational control.',
      items: [
        { title: 'Messages', description: 'Chat with applicants and team members.', to: '/employer/messages', icon: Mail },
        { title: 'Analytics', description: 'Track pipeline and hiring performance.', to: '/employer/reports-center', icon: BarChart3 },
        { title: 'Hiring Team', description: 'Manage collaborators and assignments.', to: '/employer/team', icon: Users },
        { title: 'Tracking', description: 'Monitor workflows, approvals, and tasks.', to: '/employer/activity-calendar', icon: ListChecks },
        { title: 'Approvals', description: 'Review and approve candidate actions.', to: '/employer/approvals', icon: CheckCircle2 },
        { title: 'Allocations', description: 'Assign roles, budgets, and resources.', to: '/employer/allocations', icon: FolderKanban }
      ]
    },
    {
      key: 'company',
      icon: Building2,
      label: 'Company',
      description: 'Employer branding, policies, and notifications.',
      items: [
        { title: 'Company Profile', description: 'Customize your public hiring page.', to: '/employer/company-profile', icon: Building2 },
        { title: 'Policies', description: 'Configure hiring and interview rules.', to: '/employer/policies', icon: Settings },
        { title: 'Notifications', description: 'View alerts and system updates.', to: '/employer/notifications', icon: Bell }
      ]
    }
  ];

  const pipelineCounts = useMemo(() => {
    const counts = {
      applied: 0,
      screening: 0,
      interview: 0,
      selected: 0,
      hired: 0
    };

    state.applications.forEach((application) => {
      const status = String(application.status || '').toLowerCase();
      if (status === 'pending') counts.applied += 1;
      else if (status === 'reviewed') counts.screening += 1;
      else if (status === 'shortlisted') counts.selected += 1;
      else if (status === 'interview_scheduled') counts.interview += 1;
      else if (status === 'hired') counts.hired += 1;
    });

    return counts;
  }, [state.applications]);

  const totalApplications = Math.max(metrics.totalApplications || 0, state.applications.length);
  const shortlistedCount = Math.max(metrics.shortlistedApplications || 0, pipelineCounts.selected);
  const hiredCount = Math.max(metrics.hiredApplications || 0, pipelineCounts.hired);
  const successRate = totalApplications ? Math.round((hiredCount / totalApplications) * 100) : 0;
  const pipelineTotal = Object.values(pipelineCounts).reduce((sum, value) => sum + value, 0);
  const recentJobs = state.jobs.slice(0, 4);

  const applicationsPerJob = useMemo(() => {
    const rows = state.jobs.slice(0, 8).map((job) => ({
      id: job._id,
      title: job.title,
      applicants: state.applicationsByJob[job._id]?.length || 0
    }));

    rows.sort((left, right) => right.applicants - left.applicants);
    return rows.slice(0, 5);
  }, [state.jobs, state.applicationsByJob]);

  const monthlyTrend = useMemo(() => {
    const windowSize = 7;
    const now = new Date();
    const buckets = [];
    const bucketMap = new Map();

    for (let index = windowSize - 1; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const key = getMonthKey(date);
      const entry = {
        key,
        label: date.toLocaleDateString('en-IN', { month: 'short' }),
        count: 0
      };
      buckets.push(entry);
      bucketMap.set(key, entry);
    }

    state.applications.forEach((application) => {
      if (!application.createdAt) return;
      const bucket = bucketMap.get(getMonthKey(new Date(application.createdAt)));
      if (bucket) bucket.count += 1;
    });

    return buckets;
  }, [state.applications]);

  const monthlyTrendMax = useMemo(
    () => Math.max(1, ...monthlyTrend.map((item) => item.count)),
    [monthlyTrend]
  );

  const analyticsPoints = useMemo(() => makeLinePoints(monthlyTrend, monthlyTrendMax), [monthlyTrend, monthlyTrendMax]);

  const statCards = [
    { label: 'Total Jobs', value: metrics.totalJobs, trend: '+12.4%', icon: BriefcaseBusiness, tone: 'emerald' },
    { label: 'Pending Review', value: metrics.pendingJobs, trend: '-4.8%', icon: Clock3, tone: 'mint' },
    { label: 'Active Jobs', value: metrics.activeJobs, trend: '+8.2%', icon: Sparkles, tone: 'green' },
    { label: 'Total Applications', value: totalApplications, trend: '+24.7%', icon: TrendingUp, tone: 'emerald' },
    { label: 'Shortlisted Candidates', value: shortlistedCount, trend: '+16.1%', icon: UserCheck, tone: 'mint' },
    { label: 'Interview Scheduled', value: pipelineCounts.interview, trend: '+9.5%', icon: CalendarClock, tone: 'green' },
    { label: 'Hired Candidates', value: hiredCount, trend: '+6.8%', icon: CheckCircle2, tone: 'emerald' },
    { label: 'Hiring Success Rate', value: `${successRate}%`, trend: '+3.2%', icon: Gauge, tone: 'mint' }
  ];

  const heroStats = [
    { label: 'Active Jobs', value: metrics.activeJobs, icon: BriefcaseBusiness },
    { label: 'Interviews', value: pipelineCounts.interview, icon: CalendarClock },
    { label: 'Applicants', value: totalApplications, icon: Users },
    { label: 'Hired', value: hiredCount, icon: Sparkles }
  ];

  const quickActions = [
    { title: 'Post Job', description: 'Launch a premium role in minutes.', to: '/employer/jobs/new', icon: PlusSquare },
    { title: 'Review Candidates', description: 'Open your live applicant workspace.', to: applicantsRoute, icon: UserCheck },
    { title: 'Schedule Interview', description: 'Move shortlisted talent to meetings.', to: applicantsRoute, icon: CalendarClock },
    { title: 'Team Communication', description: 'Coordinate hiring conversations.', to: '/employer/messages', icon: MessageSquareText },
    { title: 'Analytics', description: 'Inspect growth and hiring velocity.', to: '/employer/reports-center', icon: BarChart3 },
    { title: 'Hiring Settings', description: 'Tune policies and approval rules.', to: '/employer/policies', icon: Settings }
  ];

  const pipelineSteps = [
    { label: 'Applied', value: pipelineCounts.applied },
    { label: 'Screening', value: pipelineCounts.screening },
    { label: 'Interview', value: pipelineCounts.interview },
    { label: 'Selected', value: pipelineCounts.selected },
    { label: 'Hired', value: pipelineCounts.hired }
  ];

  const activities = [
    state.applications[0] ? { title: 'Candidate applied', detail: state.applications[0].jobTitle || 'Open role', icon: Users } : null,
    state.jobs[0] ? { title: 'Job posted', detail: state.jobs[0].title, icon: BriefcaseBusiness } : null,
    pipelineCounts.interview ? { title: 'Interview scheduled', detail: `${pipelineCounts.interview} candidates in interview`, icon: CalendarClock } : null,
    shortlistedCount ? { title: 'Candidate shortlisted', detail: `${shortlistedCount} candidates shortlisted`, icon: UserCheck } : null
  ].filter(Boolean);

  if (state.loading) return <Loader label="Loading premium employer dashboard..." />;

  return (
    <div className="employer-premium-dashboard">
      <Seo title="Employer Dashboard | HEXORA" description="Premium employer hiring command center." />

      <header className="employer-command-header">
        <div>
          <span className="employer-command-kicker"><Sparkles size={14} /> Enterprise HR Command Center</span>
          <h1>Welcome back, {user?.name || 'Employer'} 👋</h1>
          <p>Operate jobs, applicants, interviews, analytics, and team workflows from one futuristic hiring cockpit.</p>
        </div>
        <div className="employer-command-side">
          <div className="employer-command-tools">
            <label className="employer-command-search" aria-label="Search dashboard">
              <Search size={17} />
              <input type="search" placeholder="Search jobs, candidates, reports..." />
            </label>
            <button type="button" className="employer-command-icon" aria-label="Notifications">
              <Bell size={18} />
              <span aria-hidden="true" />
            </button>
            <div className="employer-command-profile">
              <span><CircleUserRound size={18} /></span>
              <div>
                <strong>{user?.name || 'Employer'}</strong>
                <small>Premium workspace</small>
              </div>
            </div>
          </div>
          <nav className="employer-command-actions" aria-label="Employer quick actions">
            <Button as={Link} to="/employer/jobs/new" size="sm"><PlusSquare size={16} /> Post New Job</Button>
            <Button as={Link} to="/employer/jobs" size="sm" variant="secondary"><FolderKanban size={16} /> Manage Jobs</Button>
            <Button as={Link} to={applicantsRoute} size="sm" variant="ghost"><UserCheck size={16} /> View Applicants</Button>
          </nav>
        </div>
      </header>

      <section className="employer-premium-hero">
        <div className="employer-premium-hero-copy">
          <span className="employer-hero-badge"><Sparkles size={14} /> Live hiring intelligence</span>
          <h2>Premium hiring control for modern employer teams.</h2>
          <p>Forecast demand, inspect pipeline health, and move candidates faster with a command center designed for enterprise HR operators.</p>
          <div className="employer-hero-cta-row">
            <Link to="/employer/jobs/new">Launch role <ArrowRight size={15} /></Link>
            <Link to="/employer/reports-center">Open analytics <LineChart size={15} /></Link>
          </div>
        </div>
        <div className="employer-hero-visual" aria-hidden="true">
          <div className="employer-3d-chip employer-3d-chip-a" />
          <div className="employer-3d-chip employer-3d-chip-b" />
          <div className="employer-3d-dashboard-card">
            <div className="employer-3d-card-top">
              <span />
              <span />
              <span />
            </div>
            <div className="employer-3d-chart">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="employer-3d-user-row">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
        <div className="employer-hero-live-grid">
          {heroStats.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="employer-hero-live-card">
                <span><Icon size={18} /></span>
                <strong>{item.value}</strong>
                <small>{item.label}</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="employer-workflow-path" aria-label="Hiring workflow steps">
        {workflowSteps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <Link key={step.title} to={step.to} className="employer-workflow-step">
              <span><StepIcon size={18} /></span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
              {index < workflowSteps.length - 1 ? <span className="employer-workflow-separator" aria-hidden="true">›</span> : null}
            </Link>
          );
        })}
      </section>

      <section className="employer-dashboard-sections" aria-label="Employer workflow groups">
        {dashboardGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <article key={group.key} className="employer-dashboard-group-card">
              <div className="employer-dashboard-group-header">
                <span><GroupIcon size={18} /></span>
                <div>
                  <small>{group.label}</small>
                  <h3>{group.description}</h3>
                </div>
              </div>
              <div className="employer-dashboard-group-list">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link key={item.title} to={item.to} className="employer-dashboard-group-item">
                      <span><ItemIcon size={16} /></span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>

      <section className="employer-premium-stat-grid" aria-label="Hiring statistics">
        {statCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className={`employer-premium-stat-card is-${item.tone}`} style={{ '--delay': `${index * 45}ms` }}>
              <div className="employer-stat-3d-icon"><Icon size={22} /></div>
              <div>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </div>
              <span className="employer-stat-trend">{item.trend}</span>
            </article>
          );
        })}
      </section>

      <section className="employer-premium-analytics-grid">
        <article className="employer-premium-panel employer-analytics-line-panel">
          <div className="employer-premium-panel-head">
            <div>
              <p className="section-eyebrow">Hiring analytics</p>
              <h3>Application Trend</h3>
            </div>
            <Badge tone="success">Live</Badge>
          </div>
          <div className="employer-line-chart" role="img" aria-label="Hiring analytics line chart">
            <svg viewBox="0 0 520 210" preserveAspectRatio="none">
              <defs>
                <linearGradient id="employerLineGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(75, 222, 128, 0.45)" />
                  <stop offset="100%" stopColor="rgba(75, 222, 128, 0)" />
                </linearGradient>
              </defs>
              <polyline className="employer-chart-area" points={`0,210 ${analyticsPoints} 520,210`} />
              <polyline className="employer-chart-line" points={analyticsPoints} />
            </svg>
            <div className="employer-chart-tooltip">
              <strong>{totalApplications}</strong>
              <span>Total applications</span>
            </div>
          </div>
        </article>

        <article className="employer-premium-panel">
          <div className="employer-premium-panel-head">
            <div>
              <p className="section-eyebrow">Monthly insights</p>
              <h3>Hiring performance</h3>
            </div>
            <Badge tone="neutral">7 months</Badge>
          </div>
          <div className="employer-insight-summary">
            <div>
              <small>Total applications</small>
              <strong>{totalApplications}</strong>
            </div>
            <div>
              <small>Success rate</small>
              <strong>{successRate}%</strong>
            </div>
          </div>
          <div className="employer-premium-bars">
            {monthlyTrend.map((item) => (
              <div key={item.key} className="employer-premium-bar-column">
                <small>{item.count}</small>
                <span style={{ height: `${Math.max(item.count ? 22 : 10, (item.count / monthlyTrendMax) * 100)}%` }} />
                <em>{item.label}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="employer-premium-panel employer-pipeline-panel">
          <div className="employer-premium-panel-head">
            <div>
              <p className="section-eyebrow">Hiring pipeline</p>
              <h3>Applied → Screening → Interview → Selected → Hired</h3>
            </div>
            <Badge tone="success">{pipelineTotal} tracked</Badge>
          </div>
          <div className="employer-modern-pipeline">
            {pipelineSteps.map((step, index) => {
              const percent = pipelineTotal ? Math.max(8, Math.round((step.value / pipelineTotal) * 100)) : 0;
              return (
                <article key={step.label} className="employer-pipeline-step">
                  <div className="employer-pipeline-step-top">
                    <span>{index + 1}</span>
                    <strong>{step.value}</strong>
                  </div>
                  <p>{step.label}</p>
                  <div className="employer-pipeline-progress"><span style={{ width: `${percent}%` }} /></div>
                </article>
              );
            })}
          </div>
        </article>
      </section>

      <section className="employer-premium-lower-grid">
        <article className="employer-premium-panel">
          <div className="employer-premium-panel-head">
            <div>
              <p className="section-eyebrow">Quick actions</p>
              <h3>High velocity workflows</h3>
            </div>
          </div>
          <div className="employer-action-matrix">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.to} className="employer-action-tile">
                  <span><Icon size={19} /></span>
                  <div>
                    <strong>{action.title}</strong>
                    <p>{action.description}</p>
                  </div>
                  <ArrowRight size={15} />
                </Link>
              );
            })}
          </div>
        </article>

        <article className="employer-premium-panel">
          <div className="employer-premium-panel-head">
            <div>
              <p className="section-eyebrow">Recent activity</p>
              <h3>Hiring timeline</h3>
            </div>
          </div>
          <div className="employer-activity-timeline">
            {activities.length ? activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={`${activity.title}-${index}`} className="employer-activity-item">
                  <span><Icon size={16} /></span>
                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.detail}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="employer-empty-inline">
                <h4>No activity yet</h4>
                <p>Candidate and job events will appear here as your hiring workflow begins.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="employer-premium-panel employer-job-management-panel">
        <div className="employer-premium-panel-head">
          <div>
            <p className="section-eyebrow">Job management</p>
            <h3>Premium role cards</h3>
          </div>
          <Button as={Link} to="/employer/jobs" size="sm" variant="secondary">View all jobs</Button>
        </div>
        {recentJobs.length ? (
          <div className="employer-premium-job-grid">
            {recentJobs.map((job) => {
              const badge = getJobBadge(job);
              const applicantCount = state.applicationsByJob[job._id]?.length || 0;
              return (
                <article key={job._id} className="employer-premium-job-card">
                  <div className="employer-job-card-head">
                    <span><BriefcaseBusiness size={18} /></span>
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                  </div>
                  <h4>{job.title}</h4>
                  <p>{job.company || 'HEXORA Employer'} · Posted {formatDate(job.createdAt)}</p>
                  <div className="employer-job-card-metrics">
                    <span>{applicantCount} applicants</span>
                    <span>{job.salaryMin || job.salaryMax ? `${job.salaryMin || ''}-${job.salaryMax || ''}` : 'Salary hidden'}</span>
                  </div>
                  <div className="employer-job-card-actions">
                    <Link to={`/employer/jobs/${job._id}/edit`}>Edit</Link>
                    <Link to={`/employer/jobs/${job._id}/applicants`}>Applicants <ArrowRight size={14} /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="employer-empty-state">
            <div className="employer-empty-icon"><BriefcaseBusiness size={22} /></div>
            <div>
              <h4>No jobs published yet</h4>
              <p>Create your first premium role card and start collecting applications.</p>
              <Button as={Link} to="/employer/jobs/new" size="sm">Post your first job</Button>
            </div>
          </div>
        )}
      </section>

      {applicationsPerJob.length ? (
        <section className="employer-premium-panel employer-interest-panel">
          <div className="employer-premium-panel-head">
            <div>
              <p className="section-eyebrow">Role demand</p>
              <h3>Applications by job</h3>
            </div>
          </div>
          <div className="employer-interest-list">
            {applicationsPerJob.map((item) => (
              <div key={item.id} className="employer-interest-row">
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.applicants} applicants</small>
                </div>
                <span style={{ width: `${Math.max(10, (item.applicants / Math.max(1, applicationsPerJob[0]?.applicants || 1)) * 100)}%` }} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
