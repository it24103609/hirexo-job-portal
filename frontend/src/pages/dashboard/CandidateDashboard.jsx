import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Bookmark, BriefcaseBusiness, FileCheck2, Sparkles, ArrowRight, Clock3, Mail, CalendarClock, Bell } from 'lucide-react';
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
  }, []);

  const completion = getProfileCompletion(state.profile);
  const recentApplications = state.applications.slice(0, 4);
  const recommendedJobs = state.recommendedJobs.slice(0, 4);
  const profileImageUrl = useCandidateProfilePicture(state.profile?.profilePicture);
  const displayName = user?.name || 'Candidate';

  if (state.loading) return <Loader label="Loading candidate dashboard..." />;

  return (
    <>
      <Seo title="Candidate Dashboard | Hirexo" description="Track profile completeness, saved jobs, and applications." />
      <DashboardHeader
        title="Candidate Dashboard"
        description="Track your progress, applications, and high-fit opportunities in one workspace."
        actions={(
          <>
            <Link className="btn btn-secondary btn-sm" to="/candidate/applications">
              <Mail size={14} /> Open Messages
            </Link>
            <Link className="btn btn-primary btn-sm" to="/jobs">
              <BriefcaseBusiness size={14} /> Browse Jobs
            </Link>
          </>
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
        <Card className="candidate-completion-card candidate-dashboard-profile-card">
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
          <div className="candidate-quick-actions">
            <Link className="btn btn-secondary btn-sm" to="/candidate/profile">Complete profile</Link>
            <Link className="btn btn-secondary btn-sm" to="/candidate/resume">Upload resume</Link>
            <Link className="btn btn-primary btn-sm" to="/jobs">Browse jobs</Link>
          </div>
        </Card>

        <Card className="candidate-list-card">
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
                    <p>{item.job?.companyName || 'Hirexo partner'}</p>
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
            <p className="m-0">No applications yet. Start exploring opportunities.</p>
          )}
        </Card>

        <Card className="candidate-list-card candidate-list-card-wide">
          <div className="panel-head">
            <h3><Sparkles size={16} /> Recommended roles</h3>
            <Link to="/jobs" className="link-button">Explore all <ArrowRight size={14} /></Link>
          </div>
          {recommendedJobs.length ? (
            <div className="candidate-recommended-grid">
              {recommendedJobs.map((job) => (
                <article key={job._id || job.slug} className="candidate-recommended-item">
                  <div>
                    <Badge tone="success">{job.jobType?.name || job.jobType || 'Role'}</Badge>
                    <h4>{job.title}</h4>
                    <p>{job.companyName || 'Hirexo partner'} · {job.location?.name || job.location || 'Remote/Hybrid'}</p>
                  </div>
                  <Link className="btn btn-secondary btn-sm" to={`/jobs/${job.slug || job._id}`}>View details</Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="m-0">Recommended jobs will appear here as new opportunities are published.</p>
          )}
        </Card>

        <Card className="candidate-list-card">
          <div className="panel-head">
            <h3><Mail size={16} /> Communication & interview updates</h3>
            <Link to="/candidate/notifications" className="link-button">Open alerts <ArrowRight size={14} /></Link>
          </div>
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
        </Card>

        <Card className="candidate-list-card">
          <div className="panel-head">
            <h3>Saved jobs preview</h3>
            <Link to="/candidate/saved-jobs" className="link-button">Open saved <ArrowRight size={14} /></Link>
          </div>
          <div className="tag-row">
            {state.savedJobs.length ? state.savedJobs.slice(0, 6).map((job) => (
              <Badge key={job._id || job.slug}>{job.title || job}</Badge>
            )) : <p className="m-0">No saved jobs yet.</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
