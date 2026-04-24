import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import { adminApi } from '../../services/admin.api';
import { formatDateTime } from '../../utils/formatters';

function getRoundStatusTone(status = '') {
  const key = String(status).toLowerCase();
  if (['completed', 'confirmed'].includes(key)) return 'success';
  if (['cancelled', 'no_show'].includes(key)) return 'danger';
  if (['reschedule_requested', 'pending'].includes(key)) return 'warning';
  return 'neutral';
}

function collectRows(applications) {
  return (applications || []).flatMap((application) => {
    const rounds = (application.interviewRounds || []).length
      ? application.interviewRounds
      : (application.interviewScheduledAt
        ? [{
          _id: `${application._id}-legacy`,
          roundName: 'Interview',
          order: 1,
          status: application.interviewStatus || 'scheduled',
          scheduledAt: application.interviewScheduledAt,
          mode: application.interviewMode,
          location: application.interviewLocation,
          meetingLink: application.interviewMeetingLink,
          notes: application.interviewNotes,
          panelInterviewers: []
        }]
        : []);

    return rounds.map((round) => ({ application, round }));
  });
}

export default function AdminInterviewsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.applications({ status: 'all' });
      setApplications(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load interview oversight');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(() => {
    const query = String(search || '').trim().toLowerCase();
    return collectRows(applications).filter(({ application, round }) => {
      if (!query) return Boolean(round);
      return [
        application.candidateUser?.name,
        application.candidateUser?.email,
        application.employerUser?.name,
        application.job?.title,
        application.job?.companyName,
        round.roundName,
        round.status
      ].some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [applications, search]);

  const stats = useMemo(() => ({
    total: rows.length,
    scheduled: rows.filter(({ round }) => round.status === 'scheduled').length,
    reschedules: rows.filter(({ round }) => round.rescheduleRequestedAt).length,
    cancelled: rows.filter(({ round }) => round.status === 'cancelled').length
  }), [rows]);

  if (loading) return <Loader label="Loading interview oversight..." />;

  return (
    <>
      <Seo title="Admin Interviews | Hirexo" description="Monitor multi-round interviews, reschedules, and hiring coordination." />
      <DashboardHeader title="Interview Oversight" description="Review interview activity across the platform, including round health, panel setup, and reschedule requests." />

      <div className="candidate-stat-grid mb-1">
        <article className="candidate-stat-card"><div><p>Total Rounds</p><strong>{stats.total}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Scheduled</p><strong>{stats.scheduled}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Reschedules</p><strong>{stats.reschedules}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Cancelled</p><strong>{stats.cancelled}</strong></div></article>
      </div>

      <Card>
        <div className="panel-head">
          <div>
            <p className="section-eyebrow">Platform workflow</p>
            <h3>Interview tracker</h3>
          </div>
          <div style={{ minWidth: 260 }}>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidate, employer, company, round..." />
          </div>
        </div>

        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Employer</th>
                  <th>Job</th>
                  <th>Round</th>
                  <th>Status</th>
                  <th>Schedule</th>
                  <th>Panel</th>
                  <th>Scorecard</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ application, round }) => (
                  <tr key={`${application._id}-${round._id}`}>
                    <td>
                      <strong>{application.candidateUser?.name || '-'}</strong>
                      <div>{application.candidateUser?.email || '-'}</div>
                    </td>
                    <td>
                      <strong>{application.employerUser?.name || '-'}</strong>
                      <div>{application.job?.companyName || '-'}</div>
                    </td>
                    <td>{application.job?.title || '-'}</td>
                    <td>
                      <strong>{round.roundName || `Round ${round.order || 1}`}</strong>
                      {round.notes ? <div>{round.notes}</div> : null}
                      {round.rescheduleRequestReason ? <small>Reschedule: {round.rescheduleRequestReason}</small> : null}
                    </td>
                    <td><Badge tone={getRoundStatusTone(round.status)}>{round.status || 'pending'}</Badge></td>
                    <td>{round.scheduledAt ? formatDateTime(round.scheduledAt) : 'Not scheduled'}</td>
                    <td>{(round.panelInterviewers || []).length ? round.panelInterviewers.map((item) => item.name || item.email || 'Interviewer').join(', ') : '-'}</td>
                    <td>
                      {round.feedback?.submittedAt ? (
                        <div>
                          <div>{round.feedback.recommendation ? round.feedback.recommendation.replace(/_/g, ' ') : 'Scored'}</div>
                          <small>Comm {round.feedback.communication || 0} · Tech {round.feedback.technicalSkills || 0}</small>
                        </div>
                      ) : round.noShowReason ? (
                        <small>{round.noShowReason}</small>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="m-0">No interview activity found for the current search.</p>
        )}
      </Card>
    </>
  );
}
