import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';

export default function EmployerDashboard() {
  const [state, setState] = useState({ loading: true, dashboard: null, jobs: [] });

  useEffect(() => {
    Promise.allSettled([employerApi.dashboard(), employerApi.jobs()])
      .then(([dashRes, jobsRes]) => {
        setState({
          loading: false,
          dashboard: dashRes.status === 'fulfilled' ? dashRes.value.data : null,
          jobs: jobsRes.status === 'fulfilled' ? jobsRes.value.data || [] : []
        });
      })
      .catch(() => setState({ loading: false, dashboard: null, jobs: [] }));
  }, []);

  if (state.loading) return <Loader label="Loading employer dashboard..." />;

  const metrics = state.dashboard || { totalJobs: 0, pendingJobs: 0, activeJobs: 0, totalApplications: 0, shortlistedApplications: 0 };

  return (
    <>
      <Seo title="Employer Dashboard | Hirexo" description="Manage company profile, jobs, and applicants." />
      <DashboardHeader title="Employer Dashboard" description="Monitor your jobs, pending reviews, and applicant flow." />
      <div className="dashboard-grid grid-4">
        <StatCard label="Total jobs" value={metrics.totalJobs} />
        <StatCard label="Pending review" value={metrics.pendingJobs} />
        <StatCard label="Active jobs" value={metrics.activeJobs} />
        <StatCard label="Applications" value={metrics.totalApplications} />
      </div>
      <Card className="mt-1">
        <h3>Recent jobs</h3>
        <div className="tag-row">{state.jobs.slice(0, 3).map((job) => <span key={job._id} className="badge">{job.title}</span>)}</div>
      </Card>
    </>
  );
}
