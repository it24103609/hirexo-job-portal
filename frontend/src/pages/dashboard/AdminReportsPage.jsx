import { useEffect, useMemo, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { adminApi } from '../../services/admin.api';
import { formatDate } from '../../utils/formatters';
import { Users, UserPlus, TrendingUp, Briefcase, CheckCircle, FileText, RefreshCw, BarChart2, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({
    applicationsPerJob: [],
    employerActivity: [],
    candidateRegistrations: { total: 0, thisMonth: 0, last30Days: [] }
  });

  useEffect(() => {
    adminApi.reports()
      .then((res) => {
        setReport(res.data || {
          applicationsPerJob: [],
          employerActivity: [],
          candidateRegistrations: { total: 0, thisMonth: 0, last30Days: [] }
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const registrationsLast30 = useMemo(
    () => (report.candidateRegistrations?.last30Days || []).reduce((sum, item) => sum + Number(item.count || 0), 0),
    [report.candidateRegistrations]
  );

  if (loading) return <Loader label="Loading analytics dashboard..." />;

  // KPI stat cards
  const statCards = [
    { label: 'Total Candidates', value: report.candidateRegistrations?.total || 0, icon: Users, tone: 'default', hint: 'All-time' },
    { label: 'New This Month', value: report.candidateRegistrations?.thisMonth || 0, icon: UserPlus, tone: 'primary', hint: 'Current month' },
    { label: 'Last 30 Days', value: registrationsLast30, icon: TrendingUp, tone: 'success', hint: 'Rolling window' },
    { label: 'Active Employers', value: report.employerActivity?.length || 0, icon: Briefcase, tone: 'default', hint: 'Employers with activity' },
    { label: 'Active Jobs', value: report.applicationsPerJob?.length || 0, icon: FileText, tone: 'primary', hint: 'Jobs with applications' },
  ];

  return (
    <>
      <Seo title="Reports | Hirexo" description="Platform reports and analytics summary." />
      <DashboardHeader
        title="Reports"
        description="Track applications, employer activity, and candidate registration trends."
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost"><Calendar size={16} style={{marginRight: 6}} /> Date Range</Button>
            <Button variant="ghost"><RefreshCw size={16} style={{marginRight: 6}} /> Refresh</Button>
            <Button variant="primary"><BarChart2 size={16} style={{marginRight: 6}} /> Export Report</Button>
          </div>
        }
      />

      {/* KPI stat cards row */}
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.1rem', marginBottom: '1.5rem' }}>
        {statCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} tone={card.tone} hint={card.hint} />
        ))}
      </div>

      {/* Charts section (placeholder) */}
      <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '2.2rem', marginBottom: '2.2rem' }}>
        <Card style={{ minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <BarChart2 size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}>Candidate Registrations Over Time</h3>
          </div>
          <div style={{ width: '100%', height: 180, background: 'linear-gradient(90deg, #e8f7ee 0%, #c6f0d6 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 18 }}>
            {/* Chart placeholder */}
            <span>Chart coming soon</span>
          </div>
        </Card>
        <Card style={{ minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <PieChart size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}>Application Status Distribution</h3>
          </div>
          <div style={{ width: '100%', height: 180, background: 'linear-gradient(90deg, #e8f7ee 0%, #c6f0d6 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 18 }}>
            {/* Chart placeholder */}
            <span>Chart coming soon</span>
          </div>
        </Card>
      </div>

      {/* Applications per Job section */}
      <Card className="mt-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}>Applications per Job</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Employer</th>
                <th>Total</th>
                <th>Shortlisted</th>
                <th>Rejected</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {report.applicationsPerJob?.length ? report.applicationsPerJob.map((item) => (
                <tr key={item.jobId}>
                  <td>{item.title}</td>
                  <td>{item.companyName}</td>
                  <td>{item.employerName}</td>
                  <td><Badge tone="primary">{item.applications}</Badge></td>
                  <td><Badge tone="success">{item.shortlisted}</Badge></td>
                  <td><Badge tone="danger">{item.rejected}</Badge></td>
                  <td><Badge tone="neutral">{item.pending}</Badge></td>
                </tr>
              )) : (
                <tr><td colSpan="7"><EmptyState title="No application data" description="No application data available for this period." actionLabel={null} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Employer Activity section */}
      <Card className="mt-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Briefcase size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}>Employer Activity</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Employer</th>
                <th>Jobs posted</th>
                <th>Approved jobs</th>
                <th>Active jobs</th>
                <th>Pending review</th>
                <th>Applications received</th>
                <th>Last login</th>
              </tr>
            </thead>
            <tbody>
              {report.employerActivity?.length ? report.employerActivity.map((item) => (
                <tr key={item.employerUserId}>
                  <td>
                    <div>{item.name}</div>
                    <small>{item.email}</small>
                  </td>
                  <td>{item.jobsPosted}</td>
                  <td>{item.approvedJobs}</td>
                  <td>{item.activeJobs}</td>
                  <td>{item.pendingReviewJobs}</td>
                  <td>{item.totalApplicationsReceived}</td>
                  <td>{formatDate(item.lastLoginAt)}</td>
                </tr>
              )) : (
                <tr><td colSpan="7"><EmptyState title="No employer activity" description="No employer activity available for this period." actionLabel={null} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Registrations section */}
      <Card className="mt-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <UserPlus size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}>Recent Candidate Registrations</h3>
        </div>
        <div className="tag-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(report.candidateRegistrations?.last30Days || []).length
            ? report.candidateRegistrations.last30Days.map((entry) => (
              <span key={entry.date} className="badge" style={{ fontSize: 14, background: 'rgba(26,138,86,0.09)' }}>{entry.date}: <b>{entry.count}</b></span>
            ))
            : <EmptyState title="No recent registrations" description="No candidate registrations in the last 30 days." actionLabel={null} />}
        </div>
      </Card>
    </>
  );
}
