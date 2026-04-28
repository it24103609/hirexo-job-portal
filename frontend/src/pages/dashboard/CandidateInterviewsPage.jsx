import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import { applicationsApi } from '../../services/applications.api';
import { formatDateTime } from '../../utils/formatters';

function getRoundStatusTone(status = '') {
  const key = String(status).toLowerCase();
  if (['completed', 'confirmed'].includes(key)) return 'success';
  if (['cancelled', 'no_show'].includes(key)) return 'danger';
  if (['reschedule_requested', 'pending'].includes(key)) return 'warning';
  return 'neutral';
}

function collectInterviewApplications(applications) {
  return (applications || [])
    .map((application) => ({
      ...application,
      interviewRounds: (application.interviewRounds || []).length
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
            interviewSlots: application.interviewSlots || [],
            panelInterviewers: []
          }]
          : [])
    }))
    .filter((application) => (application.interviewRounds || []).length);
}

export default function CandidateInterviewsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [rescheduleForms, setRescheduleForms] = useState({});
  const [workingKey, setWorkingKey] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await applicationsApi.mine();
      setApplications(collectInterviewApplications(res.data || []));
    } catch (error) {
      toast.error(error.message || 'Failed to load interviews');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const rounds = applications.flatMap((application) => application.interviewRounds || []);
    return {
      total: rounds.length,
      upcoming: rounds.filter((round) => round.scheduledAt && new Date(round.scheduledAt) > new Date() && round.status !== 'cancelled').length,
      reschedule: rounds.filter((round) => round.rescheduleRequestedAt).length
    };
  }, [applications]);

  const setReason = (roundId, value) => {
    setRescheduleForms((current) => ({ ...current, [roundId]: value }));
  };

  const requestReschedule = async (applicationId, roundId) => {
    const reason = String(rescheduleForms[roundId] || '').trim();
    if (!reason) {
      toast.error('Please share a reason for rescheduling');
      return;
    }
    setWorkingKey(`reschedule-${roundId}`);
    try {
      await applicationsApi.requestReschedule(applicationId, { roundId, reason });
      toast.success('Reschedule request sent');
      setRescheduleForms((current) => ({ ...current, [roundId]: '' }));
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to request reschedule');
    } finally {
      setWorkingKey('');
    }
  };

  const bookSlot = async (applicationId, roundId, slotId) => {
    setWorkingKey(`slot-${slotId}`);
    try {
      await applicationsApi.bookInterviewSlot(applicationId, { roundId, slotId });
      toast.success('Interview slot booked');
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to book interview slot');
    } finally {
      setWorkingKey('');
    }
  };

  if (loading) return <Loader label="Loading interviews..." />;

  return (
    <>
      <Seo title="My Interviews | Hirexo" description="Track interview rounds, book slots, and request changes." />
      <DashboardHeader title="My Interviews" description="Stay on top of interview rounds, panel details, reminders, and any reschedule requests." />

      <div className="candidate-stat-grid mb-1">
        <article className="candidate-stat-card"><div><p>Interview Rounds</p><strong>{stats.total}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Upcoming</p><strong>{stats.upcoming}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Reschedule Requests</p><strong>{stats.reschedule}</strong></div></article>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {applications.length ? applications.map((application) => (
          <Card key={application._id}>
            <div className="panel-head">
              <div>
                <p className="section-eyebrow">Interview journey</p>
                <h3>{application.job?.title || 'Role'} · {application.job?.companyName || 'Company'}</h3>
              </div>
              <Badge>{application.interviewRounds.length} rounds</Badge>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {(application.interviewRounds || []).map((round) => {
                const openSlots = (round.interviewSlots || []).filter((slot) => !slot.isBooked);
                return (
                  <article key={round._id} style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'grid', gap: 10 }}>
                    <div className="panel-head" style={{ marginBottom: 0 }}>
                      <div>
                        <strong>{round.roundName || `Round ${round.order || 1}`}</strong>
                        <p className="m-0">
                          {round.scheduledAt ? formatDateTime(round.scheduledAt) : 'Not scheduled yet'}
                          {round.mode ? ` · ${round.mode}` : ''}
                          {round.location ? ` · ${round.location}` : ''}
                        </p>
                      </div>
                      <Badge tone={getRoundStatusTone(round.status)}>{round.status || 'pending'}</Badge>
                    </div>

                    {(round.panelInterviewers || []).length ? (
                      <div>
                        <small>Panel</small>
                        <div>{round.panelInterviewers.map((item) => item.name || item.email || 'Interviewer').join(', ')}</div>
                      </div>
                    ) : null}

                    {round.meetingLink ? (
                      <div>
                        <small>Meeting link</small>
                        <div><a href={round.meetingLink} target="_blank" rel="noreferrer">{round.meetingLink}</a></div>
                      </div>
                    ) : null}

                    {round.notes ? (
                      <div>
                        <small>Notes</small>
                        <div>{round.notes}</div>
                      </div>
                    ) : null}

                    {round.status === 'no_show' ? (
                      <div>
                        <small>No-show status</small>
                        <div>{round.noShowReason || 'This round was marked as no-show.'}</div>
                      </div>
                    ) : null}

                    {round.rescheduleRequestReason ? (
                      <div>
                        <small>Pending reschedule request</small>
                        <div>{round.rescheduleRequestReason}</div>
                      </div>
                    ) : null}

                    {round.feedback?.submittedAt ? (
                      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                        <small>Interview scorecard summary</small>
                        <div>
                          Comm {round.feedback.communication || 0} · Tech {round.feedback.technicalSkills || 0} · Confidence {round.feedback.confidence || 0} · Culture {round.feedback.cultureFit || 0}
                        </div>
                        <div>{round.feedback.recommendation ? round.feedback.recommendation.replace(/_/g, ' ') : 'No recommendation'}</div>
                        {round.feedback.summary ? <small>{round.feedback.summary}</small> : null}
                      </div>
                    ) : null}

                    {openSlots.length ? (
                      <div style={{ display: 'grid', gap: 8 }}>
                        <small>Available slots</small>
                        {openSlots.map((slot) => (
                          <div key={slot._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                            <div>
                              <div>{formatDateTime(slot.startsAt)}</div>
                              <small>{slot.mode || round.mode || 'video'}{slot.location ? ` · ${slot.location}` : ''}</small>
                            </div>
                            <Button
                              size="sm"
                              disabled={workingKey === `slot-${slot._id}`}
                              onClick={() => bookSlot(application._id, round._id, slot._id)}
                            >
                              {workingKey === `slot-${slot._id}` ? 'Booking...' : 'Book slot'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {!['completed', 'cancelled'].includes(String(round.status || '').toLowerCase()) ? (
                      <div style={{ display: 'grid', gap: 8 }}>
                        <Input
                          label="Need a different time?"
                          value={rescheduleForms[round._id] || ''}
                          onChange={(event) => setReason(round._id, event.target.value)}
                          placeholder="Share your reason for rescheduling"
                        />
                        <div className="dashboard-actions">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={workingKey === `reschedule-${round._id}`}
                            onClick={() => requestReschedule(application._id, round._id)}
                          >
                            {workingKey === `reschedule-${round._id}` ? 'Sending...' : 'Request reschedule'}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </Card>
        )) : (
          <Card>
            <h3>No interviews yet</h3>
            <p className="m-0">When an employer schedules a round, it will show up here with slot booking and reschedule support.</p>
          </Card>
        )}
      </div>
    </>
  );
}
