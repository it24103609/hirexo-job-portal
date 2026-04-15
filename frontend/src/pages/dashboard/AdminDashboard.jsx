import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { adminApi } from '../../services/admin.api';

export default function AdminDashboard() {
  const [state, setState] = useState({ loading: true, dashboard: null, jobs: [] });

  useEffect(() => {
    Promise.allSettled([adminApi.dashboard(), adminApi.pendingJobs()]).then(([dashRes, jobsRes]) => {
      setState({
        loading: false,
        dashboard: dashRes.status === 'fulfilled' ? dashRes.value.data : null,
        jobs: jobsRes.status === 'fulfilled' ? jobsRes.value.data || [] : []
      });
    }).catch(() => setState({ loading: false, dashboard: null, jobs: [] }));
  }, []);

  if (state.loading) return <Loader label="Loading admin dashboard..." />;

  const metrics = state.dashboard || { totalJobs: 0, activeJobs: 0, pendingJobs: 0, totalEmployers: 0, totalCandidates: 0, totalApplications: 0 };

  return (
    <>
      <Seo title="Admin Dashboard | Hirexo" description="Monitor and moderate the recruitment platform." />
      <DashboardHeader title="Admin Dashboard" description="Monitor activity, review jobs, and manage users." />
      <div className="dashboard-grid grid-3">
        <StatCard label="Total jobs" value={metrics.totalJobs} />
        <StatCard label="Pending jobs" value={metrics.pendingJobs} />
        <StatCard label="Total applications" value={metrics.totalApplications} />
        <StatCard label="Employers" value={metrics.totalEmployers} />
        <StatCard label="Candidates" value={metrics.totalCandidates} />
        <StatCard label="Active jobs" value={metrics.activeJobs} />
      </div>
      <Card className="mt-1">
        <h3>Pending moderation</h3>
        <div className="tag-row">{state.jobs.slice(0, 4).map((job) => <span key={job._id} className="badge">{job.title}</span>)}</div>
      </Card>
    </>
  );
}
