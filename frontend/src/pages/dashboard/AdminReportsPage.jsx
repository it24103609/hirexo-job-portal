import { useEffect, useMemo, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Loader from '../../components/ui/Loader';
import { adminApi } from '../../services/admin.api';
import { formatDate } from '../../utils/formatters';

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

  if (loading) return <Loader label="Loading reports..." />;

  return (
    <>
      <Seo title="Reports | Hirexo" description="Platform reports and analytics summary." />
      <DashboardHeader title="Reports" description="Track applications, employer activity, and candidate registration trends." />
      <div className="dashboard-grid grid-3">
        <StatCard label="Candidate registrations" value={report.candidateRegistrations?.total || 0} hint="All-time" />
        <StatCard label="New candidates (this month)" value={report.candidateRegistrations?.thisMonth || 0} hint="Current month" />
        <StatCard label="New candidates (last 30 days)" value={registrationsLast30} hint="Rolling window" />
      </div>
      <Card className="mt-1">
        <h3>Applications per job</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Employer</th>
                <th>Total applications</th>
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
                  <td>{item.applications}</td>
                  <td>{item.shortlisted}</td>
                  <td>{item.rejected}</td>
                  <td>{item.pending}</td>
                </tr>
              )) : (
                <tr><td colSpan="7">No application data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-1">
        <h3>Employer activity</h3>
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
                <tr><td colSpan="7">No employer activity available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-1">
        <h3>Candidate registrations (last 30 days)</h3>
        <div className="tag-row">
          {(report.candidateRegistrations?.last30Days || []).length
            ? report.candidateRegistrations.last30Days.map((entry) => (
              <span key={entry.date} className="badge">{entry.date}: {entry.count}</span>
            ))
            : <span className="badge badge-neutral">No recent registrations</span>}
        </div>
      </Card>
    </>
  );
}
