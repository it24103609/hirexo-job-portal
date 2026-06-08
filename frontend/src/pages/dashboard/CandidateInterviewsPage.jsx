import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { CalendarClock, Clock3, RotateCcw, PanelTop, Users, Sparkles } from 'lucide-react';
import Seo from '../../components/ui/Seo';
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
      <Seo title="My Interviews | HEXORA" description="Track interview rounds, book slots, and request changes." />
      <section className="candidate-interviews-hero candidate-glass-card">
        <div className="candidate-interviews-hero-copy">
          <p className="candidate-interviews-eyebrow">Candidate</p>
          <h1>My Interviews</h1>
          <p>Stay on top of interview rounds, panel details, reminders, and any reschedule requests.</p>
        </div>
        <div className="candidate-interviews-hero-panel" aria-hidden="true">
          <span className="candidate-interviews-hero-orb candidate-interviews-hero-orb-a" />
          <span className="candidate-interviews-hero-orb candidate-interviews-hero-orb-b" />
          <div className="candidate-interviews-hero-chip">
            <Sparkles size={16} />
            <span>Interview flow</span>
          </div>
          <div className="candidate-interviews-hero-card">
            <div className="candidate-interviews-hero-card-icon"><CalendarClock size={18} /></div>
            <div>
              <strong>{stats.total} rounds</strong>
              <p>{stats.upcoming} upcoming · {stats.reschedule} reschedules</p>
            </div>
          </div>
        </div>
      </section>

      <div className="candidate-interviews-stats">
        <article className="candidate-interviews-stat-card candidate-glass-card">
          <span className="candidate-interviews-stat-icon"><PanelTop size={18} /></span>
          <div>
            <p>Interview Rounds</p>
            <strong>{stats.total}</strong>
          </div>
        </article>
        <article className="candidate-interviews-stat-card candidate-glass-card">
          <span className="candidate-interviews-stat-icon"><Clock3 size={18} /></span>
          <div>
            <p>Upcoming</p>
            <strong>{stats.upcoming}</strong>
          </div>
        </article>
        <article className="candidate-interviews-stat-card candidate-glass-card">
          <span className="candidate-interviews-stat-icon"><RotateCcw size={18} /></span>
          <div>
            <p>Reschedule Requests</p>
            <strong>{stats.reschedule}</strong>
          </div>
        </article>
      </div>

      <div className="candidate-interviews-list">
        {applications.length ? applications.map((application) => (
          <Card key={application._id} className="candidate-interview-application-card candidate-glass-card">
            <div className="panel-head candidate-interview-application-head">
              <div>
                <p className="section-eyebrow">Interview journey</p>
                <h3>{application.job?.title || 'Role'} · {application.job?.companyName || 'Company'}</h3>
                <p className="candidate-interview-application-subtitle">A clean timeline of each scheduled round, panel, and action request.</p>
              </div>
              <Badge>{application.interviewRounds.length} rounds</Badge>
            </div>

            <div className="candidate-interview-rounds-grid">
              {(application.interviewRounds || []).map((round) => {
                const openSlots = (round.interviewSlots || []).filter((slot) => !slot.isBooked);
                return (
                  <article key={round._id} className="candidate-interview-round-card">
                    <div className="panel-head candidate-interview-round-head">
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
                        <div className="candidate-interview-meta-copy">{round.panelInterviewers.map((item) => item.name || item.email || 'Interviewer').join(', ')}</div>
                      </div>
                    ) : null}

                    {round.meetingLink ? (
                      <div className="candidate-interview-meta-block">
                        <small>Meeting link</small>
                        <div><a href={round.meetingLink} target="_blank" rel="noreferrer">{round.meetingLink}</a></div>
                      </div>
                    ) : null}

                    {round.notes ? (
                      <div className="candidate-interview-meta-block">
                        <small>Notes</small>
                        <div className="candidate-interview-meta-copy">{round.notes}</div>
                      </div>
                    ) : null}

                    {round.status === 'no_show' ? (
                      <div className="candidate-interview-meta-block">
                        <small>No-show status</small>
                        <div className="candidate-interview-meta-copy">{round.noShowReason || 'This round was marked as no-show.'}</div>
                      </div>
                    ) : null}

                    {round.rescheduleRequestReason ? (
                      <div className="candidate-interview-meta-block">
                        <small>Pending reschedule request</small>
                        <div className="candidate-interview-meta-copy">{round.rescheduleRequestReason}</div>
                      </div>
                    ) : null}

                    {round.feedback?.submittedAt ? (
                      <div className="candidate-interview-feedback">
                        <small>Interview scorecard summary</small>
                        <div className="candidate-interview-meta-copy">
                          Comm {round.feedback.communication || 0} · Tech {round.feedback.technicalSkills || 0} · Confidence {round.feedback.confidence || 0} · Culture {round.feedback.cultureFit || 0}
                        </div>
                        <div className="candidate-interview-meta-copy">{round.feedback.recommendation ? round.feedback.recommendation.replace(/_/g, ' ') : 'No recommendation'}</div>
                        {round.feedback.summary ? <small>{round.feedback.summary}</small> : null}
                      </div>
                    ) : null}

                    {openSlots.length ? (
                      <div className="candidate-interview-slot-list">
                        <small>Available slots</small>
                        {openSlots.map((slot) => (
                          <div key={slot._id} className="candidate-interview-slot-item">
                            <div className="candidate-interview-slot-copy">
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
                      <div className="candidate-interview-reschedule">
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
          <Card className="candidate-interview-empty candidate-glass-card">
            <div className="candidate-interview-empty-orbit candidate-interview-empty-orbit-a" aria-hidden="true" />
            <div className="candidate-interview-empty-orbit candidate-interview-empty-orbit-b" aria-hidden="true" />
            <div className="candidate-interview-empty-icon" aria-hidden="true">
              <Users size={24} />
            </div>
            <h3>No interviews yet</h3>
            <p className="m-0">When an employer schedules a round, it will show up here with slot booking and reschedule support.</p>
          </Card>
        )}
      </div>
    </>
  );
}
