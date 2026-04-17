import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart2,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  FolderKanban,
  LineChart,
  ListChecks,
  PieChart,
  PlusSquare,
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';
import { formatDate } from '../../utils/formatters';

const fallbackDashboard = {
  totalJobs: 0,
  pendingJobs: 0,
  activeJobs: 0,
  totalApplications: 0,
  shortlistedApplications: 0
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

export default function EmployerDashboard() {
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

      const analyticsJobs = jobs;
      const applicantResults = await Promise.allSettled(analyticsJobs.map((job) => employerApi.applicants(job._id)));
      const applicationsByJob = {};
      const applications = [];

      analyticsJobs.forEach((job, index) => {
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
  const recentJobs = state.jobs.slice(0, 5);
  const applicantTargetJob = state.jobs.find((job) => job.reviewStatus === 'approved') || state.jobs[0];
  const applicantsRoute = applicantTargetJob ? `/employer/jobs/${applicantTargetJob._id}/applicants` : '/employer/jobs';

  const pipelineCounts = useMemo(() => {
    const counts = {
      applied: 0,
      reviewed: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0
    };

    state.applications.forEach((application) => {
      const status = String(application.status || '').toLowerCase();
      if (status === 'pending') counts.applied += 1;
      else if (status === 'reviewed') counts.reviewed += 1;
      else if (status === 'shortlisted') counts.shortlisted += 1;
      else if (status === 'interview_scheduled') counts.interview += 1;
      else if (status === 'rejected') counts.rejected += 1;
    });

    return counts;
  }, [state.applications]);

  const totalApplications = Math.max(metrics.totalApplications || 0, state.applications.length);
  const shortlistedCount = Math.max(metrics.shortlistedApplications || 0, pipelineCounts.shortlisted);
  const pipelineTotal = Object.values(pipelineCounts).reduce((sum, value) => sum + value, 0);

  const applicationsPerJob = useMemo(() => {
    const rows = state.jobs.slice(0, 8).map((job) => ({
      id: job._id,
      title: job.title,
      createdAt: job.createdAt,
      applicants: state.applicationsByJob[job._id]?.length || 0
    }));

    rows.sort((left, right) => right.applicants - left.applicants || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
    return rows.slice(0, 5);
  }, [state.jobs, state.applicationsByJob]);

  const applicationsPerJobMax = useMemo(
    () => Math.max(1, ...applicationsPerJob.map((item) => item.applicants)),
    [applicationsPerJob]
  );

  const jobStatusDistribution = useMemo(() => {
    const counts = {
      active: 0,
      pending: 0,
      rejected: 0,
      other: 0
    };

    state.jobs.forEach((job) => {
      const reviewStatus = String(job.reviewStatus || '').toLowerCase();
      const lifecycleStatus = String(job.status || '').toLowerCase();

      if (reviewStatus === 'pending') counts.pending += 1;
      else if (reviewStatus === 'rejected') counts.rejected += 1;
      else if (lifecycleStatus === 'active') counts.active += 1;
      else counts.other += 1;
    });

    const total = state.jobs.length || 1;
    return [
      { key: 'active', label: 'Active', value: counts.active, percent: Math.round((counts.active / total) * 100) },
      { key: 'pending', label: 'Pending review', value: counts.pending, percent: Math.round((counts.pending / total) * 100) },
      { key: 'rejected', label: 'Rejected', value: counts.rejected, percent: Math.round((counts.rejected / total) * 100) },
      { key: 'other', label: 'Inactive / expired', value: counts.other, percent: Math.round((counts.other / total) * 100) }
    ];
  }, [state.jobs]);

  const monthlyTrend = useMemo(() => {
    const windowSize = 6;
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
      const date = new Date(application.createdAt);
      const key = getMonthKey(date);
      const bucket = bucketMap.get(key);
      if (bucket) bucket.count += 1;
    });

    return buckets;
  }, [state.applications]);

  const monthlyTrendMax = useMemo(
    () => Math.max(1, ...monthlyTrend.map((item) => item.count)),
    [monthlyTrend]
  );

  const statCards = [
    {
      label: 'Total jobs',
      value: metrics.totalJobs,
      hint: `${metrics.activeJobs} active listings are live`,
      trend: `${metrics.pendingJobs} currently waiting for review`,
      icon: BriefcaseBusiness
    },
    {
      label: 'Pending review',
      value: metrics.pendingJobs,
      hint: 'Jobs in moderation queue',
      trend: 'Speed up review-to-live conversion',
      icon: Clock3
    },
    {
      label: 'Active jobs',
      value: metrics.activeJobs,
      hint: 'Open roles visible to candidates',
      trend: 'Keep quality and freshness high',
      icon: Sparkles
    },
    {
      label: 'Total applications',
      value: totalApplications,
      hint: 'Applications across all open roles',
      trend: `${pipelineCounts.applied} newly applied candidates`,
      icon: TrendingUp
    },
    {
      label: 'Shortlisted candidates',
      value: shortlistedCount,
      hint: 'Candidates moved to shortlist',
      trend: `${pipelineCounts.reviewed} reviewed so far`,
      icon: UserCheck
    },
    {
      label: 'Interviews scheduled',
      value: pipelineCounts.interview,
      hint: 'Candidates in interview stage',
      trend: `${pipelineCounts.rejected} rejected after review`,
      icon: CalendarClock
    }
  ];

  const pipelineSteps = [
    { key: 'applied', label: 'Applied', value: pipelineCounts.applied, icon: ListChecks },
    { key: 'reviewed', label: 'Reviewed', value: pipelineCounts.reviewed, icon: BriefcaseBusiness },
    { key: 'shortlisted', label: 'Shortlisted', value: pipelineCounts.shortlisted, icon: UserCheck },
    { key: 'interview', label: 'Interview', value: pipelineCounts.interview, icon: CalendarClock },
    { key: 'rejected', label: 'Rejected', value: pipelineCounts.rejected, icon: Clock3 }
  ];

  const quickActions = [
    {
      title: 'Post a new job',
      description: 'Launch a role with job details, skills, and salary bands.',
      to: '/employer/jobs/new',
      icon: PlusSquare,
      cta: 'Create job'
    },
    {
      title: 'Edit company profile',
      description: 'Keep branding, website, and contact details up to date.',
      to: '/employer/company-profile',
      icon: FolderKanban,
      cta: 'Open profile'
    },
    {
      title: 'Review applications',
      description: 'Move candidates through review, shortlist, and interview.',
      to: applicantsRoute,
      icon: UserCheck,
      cta: 'Open applicants'
    },
    {
      title: 'Open notifications',
      description: 'Track status updates and candidate communications.',
      to: '/employer/notifications',
      icon: Bell,
      cta: 'View alerts'
    }
  ];

  if (state.loading) return <Loader label="Loading employer dashboard..." />;

  return (
    <>
      <Seo title="Employer Dashboard | Hirexo" description="Manage company profile, jobs, and applicants." />
      <DashboardHeader
        className="employer-workspace-header"
        title="Employer Dashboard"
        description="Monitor your jobs, pending reviews, and applicant flow. Run hiring from one premium control center."
        actions={(
          <>
            <Button as={Link} to="/employer/jobs/new" size="sm">
              <PlusSquare size={16} />
              Post New Job
            </Button>
            <Button as={Link} to="/employer/jobs" size="sm" variant="secondary">
              <FolderKanban size={16} />
              Manage Jobs
            </Button>
            <Button as={Link} to={applicantsRoute} size="sm" variant="ghost">
              <UserCheck size={16} />
              View Applicants
            </Button>
          </>
        )}
      />

      <section className="employer-hero-strip">
        <div>
          <span className="employer-hero-badge"><Sparkles size={14} /> Hiring workspace</span>
          <h2>Premium hiring control for modern employer teams.</h2>
          <p>Stay close to job performance, applicant quality, and interview pipeline with live dashboard signals in one place.</p>
        </div>
        <div className="employer-hero-pills">
          <span><BriefcaseBusiness size={14} /> {metrics.activeJobs} active jobs</span>
          <span><UserCheck size={14} /> {shortlistedCount} shortlisted</span>
          <span><CalendarClock size={14} /> {pipelineCounts.interview} interviews</span>
        </div>
      </section>

      <div className="dashboard-grid employer-stat-grid">
        {statCards.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            trend={item.trend}
            icon={item.icon}
            className="employer-stat-card"
          />
        ))}
      </div>

      <section className="employer-dashboard-layout mt-1">
        <Card className="employer-panel employer-panel-wide">
          <div className="panel-head employer-panel-head">
            <div>
              <p className="section-eyebrow">Latest postings</p>
              <h3>Recent jobs</h3>
            </div>
            <Button as={Link} to="/employer/jobs" size="sm" variant="secondary">View all jobs</Button>
          </div>

          {recentJobs.length ? (
            <div className="employer-job-list">
              {recentJobs.map((job) => {
                const badge = getJobBadge(job);
                const applicantCount = state.applicationsByJob[job._id]?.length || 0;

                return (
                  <article key={job._id} className="employer-job-item">
                    <div>
                      <div className="employer-job-title-row">
                        <h4>{job.title}</h4>
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </div>
                      <div className="employer-job-meta">
                        <span>Posted {formatDate(job.createdAt)}</span>
                        <span>{applicantCount} applicant{applicantCount === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                    <div className="employer-job-actions">
                      <Button as={Link} to={`/employer/jobs/${job._id}/edit`} size="sm" variant="ghost">Edit</Button>
                      <Button as={Link} to={`/employer/jobs/${job._id}/applicants`} size="sm" variant="secondary">Applicants</Button>
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
                <p>Create your first job to start receiving applications and unlock hiring analytics on this dashboard.</p>
                <Button as={Link} to="/employer/jobs/new" size="sm">Post your first job</Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="employer-panel">
          <div className="panel-head employer-panel-head">
            <div>
              <p className="section-eyebrow">Fast navigation</p>
              <h3>Quick actions</h3>
            </div>
            <Badge tone="success">Productive mode</Badge>
          </div>

          <div className="employer-quick-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <article key={action.title} className="employer-quick-action-card">
                  <span className="employer-quick-action-icon"><Icon size={18} /></span>
                  <strong>{action.title}</strong>
                  <p>{action.description}</p>
                  <Link to={action.to} className="employer-quick-action-link">{action.cta} <ArrowRight size={14} /></Link>
                </article>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="employer-analytics-grid mt-1">
        <Card className="employer-panel">
          <div className="panel-head employer-panel-head">
            <div>
              <p className="section-eyebrow">Analytics</p>
              <h3><BarChart2 size={16} /> Applications per job</h3>
            </div>
          </div>

          {applicationsPerJob.length ? (
            <div className="employer-chart">
              {applicationsPerJob.map((item) => {
                const width = `${Math.max(10, (item.applicants / applicationsPerJobMax) * 100)}%`;

                return (
                  <div key={item.id} className="employer-chart-row">
                    <div className="employer-chart-label">
                      <span>{item.title}</span>
                      <strong>{item.applicants}</strong>
                    </div>
                    <div className="employer-chart-track">
                      <span className="employer-chart-fill" style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="employer-empty-inline">
              <h4>Application chart will appear here</h4>
              <p>As applications arrive, this chart will rank jobs by candidate interest.</p>
            </div>
          )}
        </Card>

        <Card className="employer-panel">
          <div className="panel-head employer-panel-head">
            <div>
              <p className="section-eyebrow">Distribution</p>
              <h3><PieChart size={16} /> Job status mix</h3>
            </div>
          </div>

          {state.jobs.length ? (
            <div className="employer-status-summary">
              <div className="employer-status-stack" role="img" aria-label="Job status distribution">
                {jobStatusDistribution.map((item) => (
                  <span
                    key={item.key}
                    className={`employer-status-segment employer-status-${item.key}`}
                    style={{ width: `${Math.max(item.value ? 8 : 0, item.percent)}%` }}
                  />
                ))}
              </div>
              <div className="employer-status-list">
                {jobStatusDistribution.map((item) => (
                  <div key={item.key} className="employer-status-item">
                    <span className={`employer-status-dot employer-status-${item.key}`} />
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="employer-empty-inline">
              <h4>Status distribution unavailable</h4>
              <p>Publish jobs to get a live split of active, pending review, and closed roles.</p>
            </div>
          )}
        </Card>

        <Card className="employer-panel employer-panel-wide">
          <div className="panel-head employer-panel-head">
            <div>
              <p className="section-eyebrow">Trend</p>
              <h3><LineChart size={16} /> Monthly application trend</h3>
            </div>
            <Badge tone="neutral">Last 6 months</Badge>
          </div>

          {pipelineTotal ? (
            <div className="employer-trend-chart">
              {monthlyTrend.map((item) => {
                const height = `${Math.max(item.count ? 16 : 8, (item.count / monthlyTrendMax) * 100)}%`;

                return (
                  <div key={item.key} className="employer-trend-column">
                    <small className="employer-trend-value">{item.count}</small>
                    <span className="employer-trend-bar" style={{ height }} />
                    <small className="employer-trend-label">{item.label}</small>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="employer-empty-inline">
              <h4>No application trend yet</h4>
              <p>Once candidates start applying, you will see hiring momentum month by month.</p>
            </div>
          )}
        </Card>
      </section>

      <Card className="employer-panel employer-pipeline mt-1">
        <div className="panel-head employer-panel-head">
          <div>
            <p className="section-eyebrow">Hiring workflow</p>
            <h3>Hiring pipeline</h3>
          </div>
          <Badge tone="neutral">{pipelineTotal} total tracked</Badge>
        </div>

        {pipelineTotal ? (
          <div className="employer-pipeline-grid">
            {pipelineSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.key} className="employer-pipeline-card">
                  <span className="employer-pipeline-icon"><Icon size={16} /></span>
                  <small>{step.label}</small>
                  <strong>{step.value}</strong>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="employer-empty-state">
            <div className="employer-empty-icon"><ListChecks size={22} /></div>
            <div>
              <h4>Pipeline data is empty right now</h4>
              <p>As applications are reviewed and moved across stages, your hiring funnel will populate here.</p>
              <Button as={Link} to="/employer/jobs/new" size="sm" variant="secondary">Publish a role</Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
