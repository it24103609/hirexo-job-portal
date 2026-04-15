import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, CalendarClock, CircleCheckBig } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { applicationsApi } from '../../services/applications.api';
import { formatDate, formatDateTime } from '../../utils/formatters';

function getStatusMeta(status = '') {
  const key = String(status).toLowerCase();
  if (key === 'shortlisted') return { label: 'Shortlisted', tone: 'success' };
  if (key === 'interview') return { label: 'Interview', tone: 'success' };
  if (key === 'rejected') return { label: 'Rejected', tone: 'danger' };
  return { label: 'Applied', tone: 'neutral' };
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.mine()
      .then((res) => setApplications(res.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const shortlistedCount = applications.filter((item) => ['shortlisted', 'interview'].includes(String(item.status || '').toLowerCase())).length;

  return (
    <>
      <Seo title="Applied Jobs | Hirexo" description="Track your submitted applications." />
      <DashboardHeader title="Applied Jobs" description="See the jobs you’ve applied for and their current status." />

      {!loading ? (
        <div className="candidate-stat-grid mb-1">
          <article className="candidate-stat-card">
            <span className="candidate-stat-icon"><BriefcaseBusiness size={18} /></span>
            <div><p>Total Applications</p><strong>{applications.length}</strong></div>
          </article>
          <article className="candidate-stat-card">
            <span className="candidate-stat-icon"><CircleCheckBig size={18} /></span>
            <div><p>Progressing</p><strong>{shortlistedCount}</strong></div>
          </article>
          <article className="candidate-stat-card">
            <span className="candidate-stat-icon"><CalendarClock size={18} /></span>
            <div>
              <p>Interviews</p>
              <strong>{applications.filter((item) => item.interviewScheduledAt).length}</strong>
            </div>
          </article>
        </div>
      ) : null}

      {loading ? <Loader label="Loading applications..." /> : (
        applications.length ? (
          <Card className="candidate-table-card">
            <div className="table-wrap">
              <table className="table candidate-table">
                <thead>
                  <tr><th>Job</th><th>Company</th><th>Status</th><th>Interview</th><th>Applied</th></tr>
                </thead>
                <tbody>
                  {applications.map((item) => {
                    const status = getStatusMeta(item.status);
                    return (
                      <tr key={item._id}>
                        <td>
                          <strong>{item.job?.title || 'Job'}</strong>
                        </td>
                        <td>{item.job?.companyName || '-'}</td>
                        <td><Badge tone={status.tone}>{status.label}</Badge></td>
                        <td>{item.interviewScheduledAt ? formatDateTime(item.interviewScheduledAt) : '-'}</td>
                        <td>{formatDate(item.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="candidate-empty-strong">
            <BriefcaseBusiness size={26} />
            <h3>No applications yet</h3>
            <p>Start applying to suitable roles and track your progress from this workspace.</p>
            <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
          </Card>
        )
      )}
    </>
  );
}
