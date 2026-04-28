import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { employerApi } from '../../services/employer.api';
import { formatDateTime } from '../../utils/formatters';

const emptyRoundForm = {
  roundName: '',
  mode: 'video',
  scheduledAt: '',
  durationMinutes: 45,
  location: '',
  meetingLink: '',
  notes: '',
  panelInterviewersText: '',
  communication: '',
  technicalSkills: '',
  confidence: '',
  cultureFit: '',
  recommendation: 'maybe',
  summary: '',
  noShowReason: ''
};

const scorecardOptions = [
  { value: 'strong_yes', label: 'Strong yes' },
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' }
];

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function parsePanelInterviewers(text) {
  return String(text || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

function getRoundStatusTone(status = '') {
  const key = String(status).toLowerCase();
  if (['completed', 'confirmed'].includes(key)) return 'success';
  if (['cancelled', 'no_show'].includes(key)) return 'danger';
  if (['reschedule_requested', 'pending'].includes(key)) return 'warning';
  return 'neutral';
}

function eventTone(event) {
  if (event.type === 'slot') return 'neutral';
  if (event.status === 'no_show') return 'danger';
  if (event.status === 'completed') return 'success';
  return 'warning';
}

function primeRoundForm(round) {
  return {
    roundName: round.roundName || '',
    mode: round.mode || 'video',
    scheduledAt: toDateTimeLocal(round.scheduledAt),
    durationMinutes: round.durationMinutes || 45,
    location: round.location || '',
    meetingLink: round.meetingLink || '',
    notes: round.notes || '',
    panelInterviewersText: (round.panelInterviewers || []).map((item) => item.name || item.email || '').filter(Boolean).join(', '),
    communication: round.feedback?.communication ?? '',
    technicalSkills: round.feedback?.technicalSkills ?? '',
    confidence: round.feedback?.confidence ?? '',
    cultureFit: round.feedback?.cultureFit ?? '',
    recommendation: round.feedback?.recommendation || 'maybe',
    summary: round.feedback?.summary || '',
    noShowReason: round.noShowReason || ''
  };
}

function groupCalendarEvents(events) {
  const grouped = (events || []).reduce((accumulator, event) => {
    const key = event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 10) : 'unscheduled';
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(event);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, items]) => ({
      date,
      label: date === 'unscheduled' ? 'Unscheduled' : new Date(date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      items: items.sort((left, right) => new Date(left.startsAt || 0) - new Date(right.startsAt || 0))
    }));
}

export default function EmployerInterviewsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [newRoundForms, setNewRoundForms] = useState({});
  const [editRoundForms, setEditRoundForms] = useState({});
  const [workingKey, setWorkingKey] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [hubRes, calendarRes] = await Promise.all([employerApi.interviewHub(), employerApi.interviewCalendar()]);
      setApplications(hubRes.data || []);
      setCalendarEvents(calendarRes.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load interview hub');
      setApplications([]);
      setCalendarEvents([]);
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
      rounds: rounds.length,
      scheduled: rounds.filter((round) => round.status === 'scheduled').length,
      requests: rounds.filter((round) => round.rescheduleRequestedAt).length,
      noShows: rounds.filter((round) => round.status === 'no_show').length
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = String(search || '').trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = statusFilter === 'all'
        || (application.interviewRounds || []).some((round) => String(round.status || '').toLowerCase() === statusFilter);
      const roundText = (application.interviewRounds || []).flatMap((round) => [
        round.roundName,
        round.status,
        round.notes,
        round.location,
        round.meetingLink,
        ...(round.panelInterviewers || []).flatMap((item) => [item.name, item.email, item.title])
      ]);

      return [
        application.candidateUser?.name,
        application.candidateUser?.email,
        application.job?.title,
        application.job?.companyName,
        application.status,
        ...roundText
      ].some((value) => String(value || '').toLowerCase().includes(query));

      return matchesStatus && (!query || matchesQuery);
    });
  }, [applications, search, statusFilter]);

  const groupedCalendar = useMemo(() => groupCalendarEvents(calendarEvents), [calendarEvents]);

  const setNewRoundField = (applicationId, key, value) => {
    setNewRoundForms((current) => ({
      ...current,
      [applicationId]: { ...emptyRoundForm, ...(current[applicationId] || {}), [key]: value }
    }));
  };

  const setEditRoundField = (round, key, value) => {
    setEditRoundForms((current) => ({
      ...current,
      [round._id]: { ...(current[round._id] || primeRoundForm(round)), [key]: value }
    }));
  };

  const createRound = async (applicationId) => {
    const form = { ...emptyRoundForm, ...(newRoundForms[applicationId] || {}) };
    if (!String(form.roundName || '').trim()) {
      toast.error('Round name is required');
      return;
    }
    setWorkingKey(`create-${applicationId}`);
    try {
      await employerApi.createInterviewRound(applicationId, {
        roundName: form.roundName,
        mode: form.mode,
        scheduledAt: form.scheduledAt || undefined,
        durationMinutes: Number(form.durationMinutes || 45),
        location: form.location,
        meetingLink: form.meetingLink,
        notes: form.notes,
        panelInterviewers: parsePanelInterviewers(form.panelInterviewersText)
      });
      toast.success('Interview round created');
      setNewRoundForms((current) => ({ ...current, [applicationId]: emptyRoundForm }));
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to create interview round');
    } finally {
      setWorkingKey('');
    }
  };

  const updateRound = async (applicationId, roundId, payload, successMessage) => {
    setWorkingKey(`${payload.action || 'update'}-${roundId}`);
    try {
      await employerApi.updateInterviewRound(applicationId, roundId, payload);
      toast.success(successMessage);
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update interview round');
    } finally {
      setWorkingKey('');
    }
  };

  const saveRound = async (applicationId, round) => {
    const form = editRoundForms[round._id] || primeRoundForm(round);
    await updateRound(applicationId, round._id, {
      action: 'update',
      roundName: form.roundName,
      mode: form.mode,
      durationMinutes: Number(form.durationMinutes || 45),
      location: form.location,
      meetingLink: form.meetingLink,
      notes: form.notes,
      panelInterviewers: parsePanelInterviewers(form.panelInterviewersText)
    }, 'Interview round updated');
  };

  const scheduleRound = async (applicationId, round) => {
    const form = editRoundForms[round._id] || primeRoundForm(round);
    if (!form.scheduledAt) {
      toast.error('Schedule time is required');
      return;
    }
    await updateRound(applicationId, round._id, {
      action: round.rescheduleRequestedAt ? 'reschedule' : 'schedule',
      scheduledAt: form.scheduledAt,
      roundName: form.roundName,
      mode: form.mode,
      durationMinutes: Number(form.durationMinutes || 45),
      location: form.location,
      meetingLink: form.meetingLink,
      notes: form.notes,
      panelInterviewers: parsePanelInterviewers(form.panelInterviewersText)
    }, round.rescheduleRequestedAt ? 'Interview round rescheduled' : 'Interview round scheduled');
  };

  const saveScorecard = async (applicationId, round) => {
    const form = editRoundForms[round._id] || primeRoundForm(round);
    await updateRound(applicationId, round._id, {
      action: 'update',
      feedback: {
        communication: Number(form.communication || 0),
        technicalSkills: Number(form.technicalSkills || 0),
        confidence: Number(form.confidence || 0),
        cultureFit: Number(form.cultureFit || 0),
        recommendation: form.recommendation,
        summary: form.summary
      }
    }, 'Interview scorecard saved');
  };

  const markNoShow = async (applicationId, round) => {
    const form = editRoundForms[round._id] || primeRoundForm(round);
    await updateRound(applicationId, round._id, {
      action: 'no_show',
      reason: form.noShowReason || 'Candidate did not attend'
    }, 'Candidate marked as no-show');
  };

  const sendReminders = async () => {
    setWorkingKey('reminders');
    try {
      const res = await employerApi.sendInterviewReminders();
      toast.success(`${res.data?.reminded || 0} reminders processed`);
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to send reminders');
    } finally {
      setWorkingKey('');
    }
  };

  if (loading) return <Loader label="Loading interview hub..." />;

  return (
    <>
      <Seo title="Interview Hub | Hirexo" description="Manage rounds, panel interviewers, scorecards, no-shows, and reminders." />
      <DashboardHeader
        title="Interview Hub"
        description="Run structured multi-round interviews with scheduling, panel coordination, scorecards, no-show tracking, and reminders."
        actions={
          <div style={{ display: 'grid', gap: 10, minWidth: 320 }}>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidate, role, round, panel..." />
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="slots_shared">Slots shared</option>
              <option value="scheduled">Scheduled</option>
              <option value="reschedule_requested">Reschedule requested</option>
              <option value="completed">Completed</option>
              <option value="no_show">No-show</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        }
      />

      <div className="candidate-stat-grid mb-1">
        <article className="candidate-stat-card"><div><p>Total Rounds</p><strong>{stats.rounds}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Scheduled</p><strong>{stats.scheduled}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Reschedule Requests</p><strong>{stats.requests}</strong></div></article>
        <article className="candidate-stat-card"><div><p>No-shows</p><strong>{stats.noShows}</strong></div></article>
      </div>

      <Card className="mb-1">
        <div className="panel-head">
          <div>
            <p className="section-eyebrow">Calendar view</p>
            <h3>Interview timeline</h3>
          </div>
          <Button size="sm" onClick={sendReminders} disabled={workingKey === 'reminders'}>
            {workingKey === 'reminders' ? 'Sending...' : 'Send reminders'}
          </Button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {groupedCalendar.length ? groupedCalendar.map((group) => (
            <div key={group.date} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
              <strong>{group.label}</strong>
              <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                {group.items.map((event) => (
                  <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                    <div>
                      <div><strong>{event.candidateName}</strong> · {event.roundName || event.jobTitle}</div>
                      <small>{event.startsAt ? formatDateTime(event.startsAt) : 'Time not set'} · {event.mode || 'video'}{event.location ? ` · ${event.location}` : ''}</small>
                    </div>
                    <Badge tone={eventTone(event)}>{event.type === 'slot' ? 'Open slot' : event.status || 'scheduled'}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )) : <p className="m-0">No calendar events yet. Scheduled rounds and shared slots will appear here.</p>}
        </div>
      </Card>

      <div style={{ display: 'grid', gap: 16 }}>
        {filteredApplications.length ? filteredApplications.map((application) => (
          <Card key={application._id}>
            <div className="panel-head">
              <div>
                <p className="section-eyebrow">Candidate interview workflow</p>
                <h3>{application.candidateUser?.name || 'Candidate'} · {application.job?.title || 'Role'}</h3>
                <p className="m-0">{application.candidateUser?.email || ''}</p>
              </div>
              <Badge>{(application.interviewRounds || []).length} rounds</Badge>
            </div>

            <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
              {(application.interviewRounds || []).map((round) => {
                const form = editRoundForms[round._id] || primeRoundForm(round);
                return (
                  <article key={round._id} style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'grid', gap: 12 }}>
                    <div className="panel-head" style={{ marginBottom: 0 }}>
                      <div>
                        <strong>{round.roundName || `Round ${round.order || 1}`}</strong>
                        <p className="m-0">{round.scheduledAt ? formatDateTime(round.scheduledAt) : 'Not scheduled yet'}</p>
                      </div>
                      <Badge tone={getRoundStatusTone(round.status)}>{round.status || 'pending'}</Badge>
                    </div>

                    {round.rescheduleRequestReason ? (
                      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                        <small>Candidate asked to reschedule</small>
                        <div>{round.rescheduleRequestReason}</div>
                      </div>
                    ) : null}

                    {round.noShowReason ? (
                      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                        <small>No-show note</small>
                        <div>{round.noShowReason}</div>
                      </div>
                    ) : null}

                    <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                      <Input label="Round name" value={form.roundName} onChange={(event) => setEditRoundField(round, 'roundName', event.target.value)} />
                      <Select label="Mode" value={form.mode} onChange={(event) => setEditRoundField(round, 'mode', event.target.value)}>
                        <option value="video">Video</option>
                        <option value="phone">Phone</option>
                        <option value="onsite">Onsite</option>
                      </Select>
                      <Input label="Schedule" type="datetime-local" value={form.scheduledAt} onChange={(event) => setEditRoundField(round, 'scheduledAt', event.target.value)} />
                      <Input label="Duration (minutes)" type="number" min="15" value={form.durationMinutes} onChange={(event) => setEditRoundField(round, 'durationMinutes', event.target.value)} />
                      <Input label="Location / platform" value={form.location} onChange={(event) => setEditRoundField(round, 'location', event.target.value)} />
                      <Input label="Meeting link" value={form.meetingLink} onChange={(event) => setEditRoundField(round, 'meetingLink', event.target.value)} />
                    </div>

                    <Input
                      label="Panel interviewers"
                      value={form.panelInterviewersText}
                      onChange={(event) => setEditRoundField(round, 'panelInterviewersText', event.target.value)}
                      placeholder="Priya, Nimal, Hiring Manager"
                    />
                    <Textarea label="Notes" value={form.notes} onChange={(event) => setEditRoundField(round, 'notes', event.target.value)} placeholder="Agenda, evaluation focus, prep notes" />

                    {round.feedback?.submittedAt ? (
                      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                        <small>Latest scorecard</small>
                        <div>
                          Comm {round.feedback.communication || 0} · Tech {round.feedback.technicalSkills || 0} · Confidence {round.feedback.confidence || 0} · Culture {round.feedback.cultureFit || 0}
                        </div>
                        <div>{round.feedback.recommendation ? round.feedback.recommendation.replace(/_/g, ' ') : 'No recommendation'}</div>
                        {round.feedback.summary ? <small>{round.feedback.summary}</small> : null}
                      </div>
                    ) : null}

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'grid', gap: 10 }}>
                      <h4 className="m-0">Interview scorecard</h4>
                      <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                        <Input label="Communication" type="number" min="1" max="5" value={form.communication} onChange={(event) => setEditRoundField(round, 'communication', event.target.value)} />
                        <Input label="Technical" type="number" min="1" max="5" value={form.technicalSkills} onChange={(event) => setEditRoundField(round, 'technicalSkills', event.target.value)} />
                        <Input label="Confidence" type="number" min="1" max="5" value={form.confidence} onChange={(event) => setEditRoundField(round, 'confidence', event.target.value)} />
                        <Input label="Culture fit" type="number" min="1" max="5" value={form.cultureFit} onChange={(event) => setEditRoundField(round, 'cultureFit', event.target.value)} />
                        <Select label="Recommendation" value={form.recommendation} onChange={(event) => setEditRoundField(round, 'recommendation', event.target.value)}>
                          {scorecardOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </Select>
                      </div>
                      <Textarea label="Summary" value={form.summary} onChange={(event) => setEditRoundField(round, 'summary', event.target.value)} placeholder="What stood out in this round?" />
                    </div>

                    <div className="dashboard-actions">
                      <Button size="sm" variant="secondary" disabled={workingKey === `update-${round._id}`} onClick={() => saveRound(application._id, round)}>
                        {workingKey === `update-${round._id}` ? 'Saving...' : 'Save details'}
                      </Button>
                      <Button size="sm" disabled={workingKey === `${round.rescheduleRequestedAt ? 'reschedule' : 'schedule'}-${round._id}`} onClick={() => scheduleRound(application._id, round)}>
                        {workingKey === `${round.rescheduleRequestedAt ? 'reschedule' : 'schedule'}-${round._id}` ? 'Saving...' : (round.rescheduleRequestedAt ? 'Approve reschedule' : 'Schedule round')}
                      </Button>
                      <Button size="sm" variant="secondary" disabled={workingKey === `update-${round._id}`} onClick={() => saveScorecard(application._id, round)}>
                        {workingKey === `update-${round._id}` ? 'Saving...' : 'Save scorecard'}
                      </Button>
                      <Button size="sm" variant="secondary" disabled={workingKey === `complete-${round._id}`} onClick={() => updateRound(application._id, round._id, { action: 'complete' }, 'Interview round marked complete')}>
                        {workingKey === `complete-${round._id}` ? 'Saving...' : 'Mark complete'}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={workingKey === `no_show-${round._id}`} onClick={() => markNoShow(application._id, round)}>
                        {workingKey === `no_show-${round._id}` ? 'Saving...' : 'Mark no-show'}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={workingKey === `cancel-${round._id}`} onClick={() => updateRound(application._id, round._id, { action: 'cancel', reason: 'Cancelled by hiring team' }, 'Interview round cancelled')}>
                        {workingKey === `cancel-${round._id}` ? 'Saving...' : 'Cancel round'}
                      </Button>
                    </div>

                    <Input
                      label="No-show note"
                      value={form.noShowReason}
                      onChange={(event) => setEditRoundField(round, 'noShowReason', event.target.value)}
                      placeholder="Candidate unreachable, joined late, technical issue"
                    />
                  </article>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'grid', gap: 10 }}>
              <h4 className="m-0">Add another round</h4>
              <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <Input label="Round name" value={newRoundForms[application._id]?.roundName || ''} onChange={(event) => setNewRoundField(application._id, 'roundName', event.target.value)} placeholder="Technical Round" />
                <Select label="Mode" value={newRoundForms[application._id]?.mode || 'video'} onChange={(event) => setNewRoundField(application._id, 'mode', event.target.value)}>
                  <option value="video">Video</option>
                  <option value="phone">Phone</option>
                  <option value="onsite">Onsite</option>
                </Select>
                <Input label="Schedule" type="datetime-local" value={newRoundForms[application._id]?.scheduledAt || ''} onChange={(event) => setNewRoundField(application._id, 'scheduledAt', event.target.value)} />
                <Input label="Duration (minutes)" type="number" min="15" value={newRoundForms[application._id]?.durationMinutes || 45} onChange={(event) => setNewRoundField(application._id, 'durationMinutes', event.target.value)} />
                <Input label="Location / platform" value={newRoundForms[application._id]?.location || ''} onChange={(event) => setNewRoundField(application._id, 'location', event.target.value)} />
                <Input label="Meeting link" value={newRoundForms[application._id]?.meetingLink || ''} onChange={(event) => setNewRoundField(application._id, 'meetingLink', event.target.value)} />
              </div>
              <Input label="Panel interviewers" value={newRoundForms[application._id]?.panelInterviewersText || ''} onChange={(event) => setNewRoundField(application._id, 'panelInterviewersText', event.target.value)} placeholder="Asha, Tech Lead, Product Manager" />
              <Textarea label="Notes" value={newRoundForms[application._id]?.notes || ''} onChange={(event) => setNewRoundField(application._id, 'notes', event.target.value)} placeholder="What this round will evaluate" />
              <div className="dashboard-actions">
                <Button size="sm" disabled={workingKey === `create-${application._id}`} onClick={() => createRound(application._id)}>
                  {workingKey === `create-${application._id}` ? 'Creating...' : 'Create round'}
                </Button>
              </div>
            </div>
          </Card>
        )) : (
          <Card>
            <h3>{applications.length ? 'No interviews match your search' : 'No interviews in motion'}</h3>
            <p className="m-0">
              {applications.length
                ? 'Try another candidate name, role, round name, or interviewer keyword.'
                : 'As soon as candidates reach interview stage, their multi-round workflow will show up here.'}
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
