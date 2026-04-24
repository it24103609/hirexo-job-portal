import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';

function downloadCsv(name, rows = []) {
  if (!rows.length) {
    toast.info('No rows available to export');
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => JSON.stringify(row[header] ?? '')).join(','));
  });
  const blob = new Blob([`${lines.join('\n')}\n`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function EmployerReportsCenterPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({ summary: {}, monthly: [], jobPerformance: [], exports: {} });

  useEffect(() => {
    employerApi.exportCenter()
      .then((res) => setReport(res.data || { summary: {}, monthly: [], jobPerformance: [], exports: {} }))
      .catch((error) => {
        toast.error(error.message || 'Failed to load export center');
        setReport({ summary: {}, monthly: [], jobPerformance: [], exports: {} });
      })
      .finally(() => setLoading(false));
  }, []);

  const topJob = useMemo(() => report.jobPerformance?.[0] || null, [report.jobPerformance]);

  if (loading) return <Loader label="Loading export center..." />;

  return (
    <>
      <Seo title="Export & Reporting Center | Hirexo" description="Export hiring data and review job performance, monthly trends, and team activity." />
      <DashboardHeader title="Export & Reporting Center" description="Download hiring data and review trends for applications, interviews, offers, and workload." />

      <div className="candidate-stat-grid mb-1">
        <article className="candidate-stat-card"><div><p>Jobs</p><strong>{report.summary?.jobs || 0}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Applications</p><strong>{report.summary?.applications || 0}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Offers</p><strong>{report.summary?.offers || 0}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Pending approvals</p><strong>{report.summary?.approvalsPending || 0}</strong></div></article>
      </div>

      <div className="grid-2">
        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Exports</p>
              <h3>Download datasets</h3>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <Button onClick={() => downloadCsv('applications-export', report.exports?.applications || [])}>Export applications</Button>
            <Button variant="secondary" onClick={() => downloadCsv('approvals-export', report.exports?.approvals || [])}>Export approvals</Button>
            <Button variant="secondary" onClick={() => downloadCsv('allocations-export', report.exports?.allocations || [])}>Export allocations</Button>
          </div>
        </Card>

        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Highlights</p>
              <h3>Performance snapshot</h3>
            </div>
          </div>
          <p><strong>Top job:</strong> {topJob ? `${topJob.title} (${topJob.applications} applications)` : 'No activity yet'}</p>
          <p><strong>Active allocations:</strong> {report.summary?.activeAllocations || 0}</p>
          <p><strong>Active policies:</strong> {report.summary?.activePolicies || 0}</p>
        </Card>
      </div>

      <Card className="mt-1">
        <div className="panel-head">
          <div>
            <p className="section-eyebrow">Monthly trend</p>
            <h3>Applications, interviews, and offers</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Month</th><th>Applications</th><th>Interviews</th><th>Offers</th></tr>
            </thead>
            <tbody>
              {(report.monthly || []).map((item) => (
                <tr key={item.key}>
                  <td>{item.label}</td>
                  <td><Badge>{item.applications}</Badge></td>
                  <td><Badge tone="success">{item.interviews}</Badge></td>
                  <td><Badge tone="warning">{item.offers}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-1">
        <div className="panel-head">
          <div>
            <p className="section-eyebrow">Job performance</p>
            <h3>Role-wise conversion</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Job</th><th>Applications</th><th>Shortlisted</th><th>Interviews</th><th>Hired</th></tr>
            </thead>
            <tbody>
              {(report.jobPerformance || []).length ? report.jobPerformance.map((item) => (
                <tr key={item.jobId}>
                  <td>{item.title}</td>
                  <td>{item.applications}</td>
                  <td>{item.shortlisted}</td>
                  <td>{item.interviews}</td>
                  <td>{item.hired}</td>
                </tr>
              )) : <tr><td colSpan="5">No job performance data yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
