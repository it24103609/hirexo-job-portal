import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { candidateApi } from '../../services/candidate.api';
import { applicationsApi } from '../../services/applications.api';
import Loader from '../../components/ui/Loader';

export default function CandidateDashboard() {
  const [state, setState] = useState({ loading: true, profile: null, applications: [], savedJobs: [] });

  useEffect(() => {
    Promise.allSettled([candidateApi.profile(), candidateApi.savedJobs(), applicationsApi.mine()])
      .then(([profileRes, savedRes, appsRes]) => {
        setState({
          loading: false,
          profile: profileRes.status === 'fulfilled' ? profileRes.value.data : null,
          applications: appsRes.status === 'fulfilled' ? appsRes.value.data || [] : [],
          savedJobs: savedRes.status === 'fulfilled' ? savedRes.value.data || [] : []
        });
      })
      .catch(() => setState({ loading: false, profile: null, applications: [], savedJobs: [] }));
  }, []);

  if (state.loading) return <Loader label="Loading candidate dashboard..." />;

  return (
    <>
      <Seo title="Candidate Dashboard | Hirexo" description="Track profile completeness, saved jobs, and applications." />
      <DashboardHeader title="Candidate Dashboard" description="Track your profile, resume, saved jobs, and applications." />
      <div className="dashboard-grid grid-4">
        <StatCard label="Profile" value={state.profile ? 'Ready' : 'Incomplete'} />
        <StatCard label="Saved jobs" value={state.savedJobs.length} />
        <StatCard label="Applications" value={state.applications.length} />
        <StatCard label="Resume" value={state.profile?.resume ? 'Uploaded' : 'Missing'} />
      </div>
      <div className="dashboard-grid grid-2 mt-1">
        <Card>
          <h3>Profile status</h3>
          <p>{state.profile?.headline || 'Add a headline and summary to improve profile visibility.'}</p>
        </Card>
        <Card>
          <h3>Saved jobs</h3>
          <div className="tag-row">
            {state.savedJobs.slice(0, 3).map((job) => <Badge key={job._id || job.slug}>{job.title || job}</Badge>)}
          </div>
        </Card>
      </div>
    </>
  );
}
