import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { applicationsApi } from '../../services/applications.api';
import { formatDate, formatDateTime } from '../../utils/formatters';

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.mine()
      .then((res) => setApplications(res.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo title="Applied Jobs | Hirexo" description="Track your submitted applications." />
      <DashboardHeader title="Applied Jobs" description="See the jobs you’ve applied for and their current status." />
      {loading ? <Loader label="Loading applications..." /> : (
        <Card>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Job</th><th>Company</th><th>Status</th><th>Interview</th><th>Applied</th></tr>
              </thead>
              <tbody>
                {applications.length ? applications.map((item) => (
                  <tr key={item._id}>
                    <td>{item.job?.title || 'Job'}</td>
                    <td>{item.job?.companyName || '-'}</td>
                    <td><Badge tone={item.status === 'shortlisted' ? 'success' : 'neutral'}>{item.status}</Badge></td>
                    <td>{item.interviewScheduledAt ? formatDateTime(item.interviewScheduledAt) : '-'}</td>
                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                )) : <tr><td colSpan="5">No applications yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
