import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Bookmark,
  BriefcaseBusiness,
  FileCheck2,
  ArrowRight,
  Clock3,
  Mail,
  CalendarClock,
  Bell,
  FileSearch,
  Search,
  CheckCircle2,
  UploadCloud
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { candidateApi } from '../../services/candidate.api';
import { applicationsApi } from '../../services/applications.api';
import { jobsApi } from '../../services/jobs.api';
import Loader from '../../components/ui/Loader';
import { formatDate } from '../../utils/formatters';
import { useCandidateProfilePicture } from '../../hooks/useCandidateProfilePicture';
import { useAuth } from '../../contexts/AuthContext';

function getProfileCompletion(profile) {
  if (!profile) return 15;
  const checks = [
    Boolean(profile.headline),
    Boolean(profile.summary),
    Boolean(profile.phone),
    Boolean(profile.location),
    Boolean(profile.resume),
    Array.isArray(profile.skills) && profile.skills.length > 0,
    Boolean(profile.experienceYears)
  ];
  return Math.max(15, Math.round((checks.filter(Boolean).length / checks.length) * 100));
}

function getAppTone(status = '') {
  const key = String(status).toLowerCase();
  if (key === 'shortlisted' || key === 'interview' || key === 'interview_scheduled') return 'success';
  if (key === 'rejected') return 'danger';
  return 'neutral';
}

function DashboardIllustration({ type = 'profile', className = '' }) {
  const Icon = {
    profile: UserCheck,
    roles: BriefcaseBusiness,
    communication: Bell,
    saved: Bookmark,
    applications: FileSearch
  }[type] || BriefcaseBusiness;

  if (type === 'profile') {
    return (
      <div className={`candidate-3d-illustration candidate-3d-${type} ${className}`.trim()} aria-hidden="true">
        <div className="candidate-3d-shadow" />
        <div className="candidate-3d-stage">
          <div className="candidate-3d-card">
            <span className="candidate-3d-avatar"><UserCheck size={24} /></span>
            <i />
            <i />
            <i />
          </div>
          <span className="candidate-3d-check"><CheckCircle2 size={26} /></span>
        </div>
      </div>
    );
  }

  return (
    <div className={`candidate-compact-illustration candidate-compact-${type} ${className}`.trim()} aria-hidden="true">
      <span className="candidate-compact-icon">
        <Icon size={18} strokeWidth={2} />
      </span>
    </div>
  );
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: true,
    profile: null,
    applications: [],
    savedJobs: [],
    recommendedJobs: []
  });

  useEffect(() => {
    const loadDashboard = () => {
      Promise.allSettled([
        candidateApi.profile(),
        candidateApi.savedJobs(),
        applicationsApi.mine(),
        jobsApi.featured()
      ])
        .then(([profileRes, savedRes, appsRes, featuredRes]) => {
          setState({
            loading: false,
            profile: profileRes.status === 'fulfilled' ? profileRes.value.data : null,
            applications: appsRes.status === 'fulfilled' ? appsRes.value.data || [] : [],
            savedJobs: savedRes.status === 'fulfilled' ? savedRes.value.data || [] : [],
            recommendedJobs: featuredRes.status === 'fulfilled' ? featuredRes.value.data || [] : []
          });
        })
        .catch(() => setState({
          loading: false,
          profile: null,
          applications: [],
          savedJobs: [],
          recommendedJobs: []
        }));
    };

    loadDashboard();
    window.addEventListener('candidate-profile-updated', loadDashboard);
    return () => window.removeEventListener('candidate-profile-updated', loadDashboard);
  }, []);

  const completion = getProfileCompletion(state.profile);
  const recentApplications = state.applications.slice(0, 4);
  const recommendedJobs = state.recommendedJobs.slice(0, 4);
  const profileImageUrl = useCandidateProfilePicture(state.profile?.profilePicture);
  const displayName = user?.name || 'Candidate';
  const profileHeadline = state.profile?.headline || 'Complete your headline, summary, and skills to increase shortlisting quality.';
  const dashboardGreeting = `Welcome back, ${displayName}`;

  if (state.loading) return <Loader label="Loading candidate dashboard..." />;

  return (
    <>
      <Seo title="Candidate Dashboard | HEXORA" description="Track profile completeness, saved jobs, and applications." />
      <div className="candidate-premium-dashboard">
        <DashboardHeader
          title={dashboardGreeting}
          description={profileHeadline}
          className="candidate-premium-header"
          actions={(
            <div className="candidate-hero-side">
            <div className="candidate-hero-summary-card candidate-glass-card">
              <div className="candidate-hero-summary-top">
                <div className="candidate-hero-summary-profile">
                  <div className="candidate-dashboard-profile-visual" aria-hidden="true">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="" />
                    ) : (
                      <span>{displayName.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <strong>{displayName}</strong>
                    <p>{state.profile?.location || 'Candidate profile'}</p>
                  </div>
                </div>
                <span className="candidate-hero-summary-status">Ready</span>
              </div>
            </div>
            <div className="candidate-hero-actions">
              <Link className="btn btn-secondary btn-sm" to="/candidate/applications">
                <Mail size={14} /> Open Messages
              </Link>
              <Link className="btn btn-primary btn-sm" to="/jobs">
                <BriefcaseBusiness size={14} /> Browse Jobs
              </Link>
            </div>
          </div>
        )}
      />

      <div className="candidate-stat-grid">
        <article className="candidate-stat-card">
          <span className="candidate-stat-icon"><UserCheck size={18} /></span>
          <div>
            <p>Profile</p>
            <strong>{completion}% complete</strong>
          </div>
        </article>
        <article className="candidate-stat-card">
          <span className="candidate-stat-icon"><Bookmark size={18} /></span>
          <div>
            <p>Saved Jobs</p>
            <strong>{state.savedJobs.length}</strong>
          </div>
        </article>
        <article className="candidate-stat-card">
          <span className="candidate-stat-icon"><BriefcaseBusiness size={18} /></span>
          <div>
            <p>Applications</p>
            <strong>{state.applications.length}</strong>
          </div>
        </article>
        <article className="candidate-stat-card">
          <span className="candidate-stat-icon"><FileCheck2 size={18} /></span>
          <div>
            <p>Resume</p>
            <strong>{state.profile?.resume ? 'Uploaded' : 'Missing'}</strong>
          </div>
        </article>
      </div>

      <div className="candidate-dashboard-grid mt-1">
        <Card className="candidate-completion-card candidate-dashboard-profile-card candidate-glass-card">
          <div className="panel-head">
            <h3>Profile completion</h3>
            <Badge tone={completion >= 80 ? 'success' : 'neutral'}>{completion >= 80 ? 'Strong' : 'In progress'}</Badge>
          </div>
          <div className="candidate-dashboard-profile-head">
            <div className="candidate-dashboard-profile-visual" aria-hidden="true">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="" />
              ) : (
                <span>{displayName.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <strong>{displayName}</strong>
              <p>{state.profile?.headline || 'Complete your headline, summary, and skills to increase shortlisting quality.'}</p>
            </div>
          </div>
          <div className="candidate-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}>
            <span style={{ width: `${completion}%` }} />
          </div>
          <div className="candidate-progress-caption">
            <span>Profile strength</span>
            <strong>{completion}%</strong>
          </div>
          <div className="candidate-quick-actions">
            <Link className="btn btn-secondary btn-sm" to="/candidate/profile"><Bookmark size={14} /> Complete profile</Link>
            <Link className="btn btn-secondary btn-sm" to="/candidate/resume"><UploadCloud size={14} /> Upload resume</Link>
            <Link className="btn btn-primary btn-sm" to="/jobs"><Search size={14} /> Browse jobs</Link>
          </div>
        </Card>

        <Card className="candidate-list-card candidate-glass-card candidate-recent-card">
          <div className="panel-head">
            <h3>Recent applications</h3>
            <Link to="/candidate/applications" className="link-button">View all <ArrowRight size={14} /></Link>
          </div>
          {recentApplications.length ? (
            <div className="candidate-mini-list">
              {recentApplications.map((item) => (
                <div key={item._id} className="candidate-mini-item">
                  <div>
                    <strong>{item.job?.title || 'Job opportunity'}</strong>
                    <p>{item.job?.companyName || 'HEXORA partner'}</p>
                  </div>
                  <div className="candidate-mini-meta">
                    <Badge tone={getAppTone(item.status)}>{item.status || 'applied'}</Badge>
                    <small><Clock3 size={13} /> {formatDate(item.createdAt)}</small>
                    <Link to={`/candidate/applications?applicationId=${item._id}&recipientRole=employer`} className="link-button">
                      Message <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="candidate-empty-state candidate-empty-applications candidate-frosted-empty">
              <span className="candidate-empty-float candidate-empty-float-a" aria-hidden="true" />
              <span className="candidate-empty-float candidate-empty-float-b" aria-hidden="true" />
              <DashboardIllustration type="applications" />
              <strong>No applications yet.</strong>
              <p>Start exploring opportunities.</p>
            </div>
          )}
        </Card>

        <Card className="candidate-list-card candidate-list-card-wide candidate-recommended-card candidate-glass-card">
          <div className="panel-head candidate-feature-head">
            <div className="candidate-feature-title">
              <span className="candidate-soft-icon"><BriefcaseBusiness size={18} /></span>
              <div>
                <h3>Recommended roles</h3>
                <p>Curated opportunities aligned with your profile signals.</p>
              </div>
            </div>
            <Link to="/jobs" className="link-button candidate-recommended-link">Explore all <ArrowRight size={14} /></Link>
          </div>
          {recommendedJobs.length ? (
            <div className="candidate-recommended-grid">
              {recommendedJobs.map((job) => (
                <article key={job._id || job.slug} className="candidate-recommended-item">
                  <span className="candidate-company-badge" aria-hidden="true">
                    {(job.companyName || 'H').slice(0, 1).toUpperCase()}
                  </span>
                  <div className="candidate-recommended-copy">
                    <Badge tone="success" className="candidate-job-type-badge">{job.jobType?.name || job.jobType || 'Role'}</Badge>
                    <h4>{job.title}</h4>
                    <p>{job.companyName || 'HEXORA partner'} · {job.location?.name || job.location || 'Remote/Hybrid'}</p>
                  </div>
                  <Link className="btn btn-secondary btn-sm candidate-recommended-action" to={`/jobs/${job.slug || job._id}`}>View details</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="candidate-empty-state candidate-empty-recommended candidate-frosted-empty">
              <span className="candidate-empty-float candidate-empty-float-a" aria-hidden="true" />
              <span className="candidate-empty-float candidate-empty-float-b" aria-hidden="true" />
              <DashboardIllustration type="roles" />
              <strong>No recommended roles yet.</strong>
              <p>We will surface new jobs aligned with your profile here.</p>
            </div>
          )}
        </Card>

        <Card className="candidate-list-card candidate-glass-card candidate-communication-card">
          <div className="panel-head">
            <h3><Bell size={16} /> Communication & interview updates</h3>
            <Link to="/candidate/notifications" className="link-button">Open alerts <ArrowRight size={14} /></Link>
          </div>
          <div className="candidate-split-visual">
            <div>
              <div className="candidate-quick-actions">
                <Link className="btn btn-secondary btn-sm" to="/candidate/applications">
                  <BriefcaseBusiness size={14} /> My applications
                </Link>
                <Link className="btn btn-secondary btn-sm" to="/candidate/applications">
                  <Mail size={14} /> New chat
                </Link>
                <Link className="btn btn-secondary btn-sm" to="/candidate/notifications">
                  <Bell size={14} /> Messages & alerts
                </Link>
                <Link className="btn btn-primary btn-sm" to="/jobs">
                  <CalendarClock size={14} /> Browse jobs
                </Link>
              </div>
              <p className="m-0" style={{ marginTop: '0.75rem' }}>
                Interview invites and recruiter messages will appear here through notifications and your application history.
              </p>
            </div>
            <DashboardIllustration type="communication" className="candidate-message-illustration" />
          </div>
        </Card>

        <Card className="candidate-list-card candidate-glass-card candidate-saved-card">
          <div className="panel-head">
            <h3>Saved jobs preview</h3>
            <Link to="/candidate/saved-jobs" className="link-button">Open saved <ArrowRight size={14} /></Link>
          </div>
          <div className="candidate-split-visual">
            <div className="tag-row">
              {state.savedJobs.length ? state.savedJobs.slice(0, 6).map((job) => (
                <Badge key={job._id || job.slug}>{job.title || job}</Badge>
              )) : (
                <div className="candidate-empty-copy candidate-empty-saved candidate-frosted-empty">
                  <span className="candidate-empty-float candidate-empty-float-a" aria-hidden="true" />
                  <span className="candidate-empty-float candidate-empty-float-b" aria-hidden="true" />
                  <DashboardIllustration type="saved" />
                  <strong>No saved jobs yet.</strong>
                  <p>Save roles to review them later.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
}
