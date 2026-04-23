import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarClock, CircleAlert, Download, Grip, Mail, Sparkles, Target } from 'lucide-react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import Textarea from '../../components/ui/Textarea';
import { employerApi } from '../../services/employer.api';
import { applicationsApi } from '../../services/applications.api';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { REJECTION_REASON_OPTIONS } from '../../utils/applicationMeta';

const PIPELINE_COLUMNS = [
  { key: 'pending', label: 'Pending', tone: 'neutral' },
  { key: 'reviewed', label: 'Reviewed', tone: 'neutral' },
  { key: 'shortlisted', label: 'Shortlisted', tone: 'success' },
  { key: 'interview_scheduled', label: 'Interview', tone: 'success' },
  { key: 'hired', label: 'Hired', tone: 'success' },
  { key: 'rejected', label: 'Rejected', tone: 'danger' }
];

function buildDefaultSlot(offsetDays = 1, offsetHours = 10) {
  const start = new Date();
  start.setDate(start.getDate() + offsetDays);
  start.setHours(offsetHours, 0, 0, 0);
  const end = new Date(start.getTime() + (45 * 60 * 1000));

  return {
    startsAt: start.toISOString().slice(0, 16),
    endsAt: end.toISOString().slice(0, 16)
  };
}

function createSlotPlanner(seed = {}) {
  return {
    open: true,
    mode: seed.mode || 'video',
    location: seed.location || '',
    meetingLink: seed.meetingLink || '',
    notes: seed.notes || '',
    slots: seed.slots?.length ? seed.slots : [
      buildDefaultSlot(1, 10),
      buildDefaultSlot(1, 14),
      buildDefaultSlot(2, 11)
    ]
  };
}

function eventTone(event) {
  if (event.type === 'scheduled' || event.type === 'booked_slot') return 'success';
  return 'neutral';
}

export default function EmployerApplicantsPage() {
  const { jobId } = useParams();
  const [state, setState] = useState({ loading: true, job: null, applications: [], calendarEvents: [] });
  const [filters, setFilters] = useState({ keyword: '', skills: '', minExperience: '', education: '', sortBy: 'ai' });
  const [slotPlanners, setSlotPlanners] = useState({});
  const [messagePanels, setMessagePanels] = useState({});
  const [messagesByApplication, setMessagesByApplication] = useState({});
  const [rejectionModal, setRejectionModal] = useState({ open: false, applicationId: '', reason: 'Skills mismatch', notes: '' });
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    applicationId: '',
    communication: 4,
    technicalSkills: 4,
    confidence: 4,
    cultureFit: 4,
    recommendation: 'yes',
    summary: ''
  });
  const [draggingId, setDraggingId] = useState('');

  const loadApplicants = async (nextFilters = filters) => {
    const [applicantsRes, calendarRes] = await Promise.all([
      employerApi.applicants(jobId, nextFilters),
      employerApi.interviewCalendar()
    ]);

    setState({
      loading: false,
      job: applicantsRes.data?.job || null,
      applications: applicantsRes.data?.applications || [],
      calendarEvents: calendarRes.data || []
    });
  };

  const refreshApplicants = async (nextFilters = filters) => {
    setState((current) => ({ ...current, loading: true }));
    await loadApplicants(nextFilters);
  };

  useEffect(() => {
    loadApplicants().catch(() => {
      setState({ loading: false, job: null, applications: [], calendarEvents: [] });
      toast.error('Unable to load applicants right now.');
    });
  }, [jobId]);

  const currentJobEvents = useMemo(() => (
    state.calendarEvents
      .filter((event) => String(event.jobId) === String(jobId))
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
  ), [jobId, state.calendarEvents]);

  const groupedApplications = useMemo(() => (
    PIPELINE_COLUMNS.reduce((accumulator, column) => ({
      ...accumulator,
      [column.key]: state.applications.filter((application) => application.status === column.key)
    }), {})
  ), [state.applications]);

  const selectedRejectionApplication = rejectionModal.open
    ? state.applications.find((item) => item._id === rejectionModal.applicationId)
    : null;

  const toggleMessagePanel = async (applicationId) => {
    const isOpen = Boolean(messagePanels[applicationId]?.open);

    setMessagePanels((current) => ({
      ...current,
      [applicationId]: {
        ...(current[applicationId] || {}),
        open: !isOpen,
        text: current[applicationId]?.text || ''
      }
    }));

    if (!isOpen && !messagesByApplication[applicationId]) {
      const res = await applicationsApi.messages(applicationId);
      setMessagesByApplication((current) => ({ ...current, [applicationId]: res.data?.messages || [] }));
    }
  };

  const sendMessage = async (applicationId) => {
    const text = String(messagePanels[applicationId]?.text || '').trim();
    if (!text) {
      toast.error('Message cannot be empty');
      return;
    }

    await applicationsApi.sendMessage(applicationId, { message: text });
    const refreshed = await applicationsApi.messages(applicationId);
    setMessagesByApplication((current) => ({ ...current, [applicationId]: refreshed.data?.messages || [] }));
    setMessagePanels((current) => ({
      ...current,
      [applicationId]: { ...(current[applicationId] || {}), open: true, text: '' }
    }));
    toast.success('Message sent to candidate');
  };

  const openSlotPlanner = (application) => {
    const bookedSlot = (application.interviewSlots || []).find((item) => item.isBooked);
    const slots = (application.interviewSlots || []).map((slot) => ({
      startsAt: slot.startsAt ? new Date(slot.startsAt).toISOString().slice(0, 16) : '',
      endsAt: slot.endsAt ? new Date(slot.endsAt).toISOString().slice(0, 16) : ''
    }));

    setSlotPlanners((current) => ({
      ...current,
      [application._id]: createSlotPlanner({
        mode: bookedSlot?.mode || application.interviewMode,
        location: bookedSlot?.location || application.interviewLocation,
        meetingLink: bookedSlot?.meetingLink || application.interviewMeetingLink,
        notes: bookedSlot?.notes || application.interviewNotes,
        slots
      })
    }));
  };

  const closeSlotPlanner = (applicationId) => {
    setSlotPlanners((current) => ({
      ...current,
      [applicationId]: { ...(current[applicationId] || {}), open: false }
    }));
  };

  const updateSlotPlanner = (applicationId, key, value) => {
    setSlotPlanners((current) => ({
      ...current,
      [applicationId]: {
        ...(current[applicationId] || createSlotPlanner()),
        open: true,
        [key]: value
      }
    }));
  };

  const updateSlotValue = (applicationId, index, key, value) => {
    setSlotPlanners((current) => {
      const next = { ...(current[applicationId] || createSlotPlanner()) };
      next.slots = next.slots.map((slot, slotIndex) => (slotIndex === index ? { ...slot, [key]: value } : slot));
      return { ...current, [applicationId]: next };
    });
  };

  const addSlotRow = (applicationId) => {
    setSlotPlanners((current) => {
      const next = { ...(current[applicationId] || createSlotPlanner()) };
      next.slots = [...next.slots, buildDefaultSlot(next.slots.length + 1, 10)];
      return { ...current, [applicationId]: next };
    });
  };

  const removeSlotRow = (applicationId, index) => {
    setSlotPlanners((current) => {
      const next = { ...(current[applicationId] || createSlotPlanner()) };
      next.slots = next.slots.filter((_, slotIndex) => slotIndex !== index);
      return { ...current, [applicationId]: next };
    });
  };

  const saveSlots = async (applicationId) => {
    const planner = slotPlanners[applicationId];
    const slots = (planner?.slots || [])
      .filter((slot) => slot.startsAt)
      .map((slot) => ({
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        mode: planner.mode,
        location: planner.location,
        meetingLink: planner.meetingLink,
        notes: planner.notes
      }));

    if (!slots.length) {
      toast.error('Add at least one valid slot');
      return;
    }

    await employerApi.saveInterviewSlots(applicationId, { slots });
    toast.success('Interview slots saved');
    await refreshApplicants(filters);
  };

  const bookSlot = async (applicationId, slotId) => {
    await employerApi.bookInterviewSlot(applicationId, { slotId });
    toast.success('Interview slot booked');
    await refreshApplicants(filters);
  };

  const updateStatus = async (applicationId, nextStatus) => {
    if (nextStatus === 'interview_scheduled') {
      const application = state.applications.find((item) => item._id === applicationId);
      if (application) openSlotPlanner(application);
      toast.info('Create or book a slot to move this candidate into interview.');
      return;
    }

    if (nextStatus === 'rejected') {
      const application = state.applications.find((item) => item._id === applicationId);
      setRejectionModal({
        open: true,
        applicationId,
        reason: REJECTION_REASON_OPTIONS.includes(application?.rejectionReason) ? application.rejectionReason : 'Skills mismatch',
        notes: application?.rejectionReason && !REJECTION_REASON_OPTIONS.includes(application.rejectionReason) ? application.rejectionReason : ''
      });
      return;
    }

    if (nextStatus === 'hired') {
      const application = state.applications.find((item) => item._id === applicationId);
      setFeedbackModal({
        open: true,
        applicationId,
        communication: Number(application?.interviewFeedback?.communication || 4),
        technicalSkills: Number(application?.interviewFeedback?.technicalSkills || 4),
        confidence: Number(application?.interviewFeedback?.confidence || 4),
        cultureFit: Number(application?.interviewFeedback?.cultureFit || 4),
        recommendation: application?.interviewFeedback?.recommendation || 'yes',
        summary: application?.interviewFeedback?.summary || ''
      });
      return;
    }

    await employerApi.updateApplicantStatus(applicationId, { status: nextStatus });
    toast.success('Status updated');
    await refreshApplicants(filters);
  };

  const handleDropStatus = async (targetStatus) => {
    if (!draggingId) return;
    await updateStatus(draggingId, targetStatus);
    setDraggingId('');
  };

  if (state.loading) return <Loader label="Loading applicants..." />;

  return (
    <>
      <Seo title="Applicants | Hirexo" description="Review applicants, book interview slots, and move candidates across your hiring pipeline." />
      <DashboardHeader
        title="Hiring Workspace"
        description={state.job ? `${state.job.title} - calendar, kanban, and AI review` : 'Applicant pipeline for your role'}
      />

      <section className="employer-hiring-hero">
        <div>
          <Badge className="employer-hiring-badge"><Sparkles size={12} /> Hiring ops</Badge>
          <h2>{state.job?.title || 'Applicant pipeline'} in one workspace</h2>
          <p>Move candidates between stages, publish interview slots, and review AI-backed fit explanations without leaving this page.</p>
        </div>
        <div className="employer-hiring-metrics">
          <span><Target size={14} /> {state.applications.length} applicants</span>
          <span><CalendarClock size={14} /> {currentJobEvents.filter((item) => item.type === 'scheduled' || item.type === 'booked_slot').length} interviews planned</span>
          <span><Sparkles size={14} /> {state.applications.filter((item) => item.status === 'hired').length} hires closed</span>
          <span><Mail size={14} /> Shared candidate messaging</span>
        </div>
      </section>

      <Card className="employer-panel">
        <div className="grid-4">
          <Input label="Keyword" value={filters.keyword} onChange={(e) => setFilters((current) => ({ ...current, keyword: e.target.value }))} placeholder="Name, email, headline" />
          <Input label="Skills" value={filters.skills} onChange={(e) => setFilters((current) => ({ ...current, skills: e.target.value }))} placeholder="React, Node.js" />
          <Input label="Min experience" type="number" value={filters.minExperience} onChange={(e) => setFilters((current) => ({ ...current, minExperience: e.target.value }))} placeholder="2" />
          <Input label="Education keyword" value={filters.education} onChange={(e) => setFilters((current) => ({ ...current, education: e.target.value }))} placeholder="B.Tech, MBA" />
        </div>
        <div className="grid-4">
          <Select label="Sort by" value={filters.sortBy} onChange={(e) => setFilters((current) => ({ ...current, sortBy: e.target.value }))}>
            <option value="ai">AI match score</option>
            <option value="recent">Most recent</option>
          </Select>
        </div>
        <div className="dashboard-actions">
          <Button variant="secondary" onClick={async () => { await refreshApplicants(filters); }}>Apply filters</Button>
          <Button variant="ghost" onClick={async () => {
            const cleared = { keyword: '', skills: '', minExperience: '', education: '', sortBy: 'ai' };
            setFilters(cleared);
            await refreshApplicants(cleared);
          }}>Clear</Button>
          <Button as={Link} to="/employer/messages" variant="ghost">Employer inbox</Button>
        </div>
      </Card>

      <div className="employer-hiring-grid mt-1">
        <Card className="employer-panel">
          <div className="panel-head employer-panel-head">
            <div>
              <p className="section-eyebrow">Interview calendar</p>
              <h3><CalendarClock size={16} /> Upcoming slots and booked interviews</h3>
            </div>
            <Badge tone="neutral">{currentJobEvents.length} entries</Badge>
          </div>
          <div className="employer-calendar-list">
            {currentJobEvents.length ? currentJobEvents.map((event) => (
              <article key={`${event.applicationId}-${event.id}`} className="employer-calendar-item">
                <div>
                  <strong>{event.candidateName}</strong>
                  <p>{event.jobTitle}</p>
                </div>
                <div>
                  <small>{formatDate(event.startsAt)}</small>
                  <p>{formatDateTime(event.startsAt)}</p>
                </div>
                <div>
                  <Badge tone={eventTone(event)}>
                    {event.type === 'slot' ? 'Open slot' : 'Interview booked'}
                  </Badge>
                </div>
              </article>
            )) : (
              <div className="employer-empty-inline">
                <h4>No interview timeline yet</h4>
                <p>Create slots from any candidate card and they will appear here instantly.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="employer-panel">
          <div className="panel-head employer-panel-head">
            <div>
              <p className="section-eyebrow">Kanban pipeline</p>
              <h3><Grip size={16} /> Drag candidates across stages</h3>
            </div>
          </div>
          <p className="m-0" style={{ color: '#5d766a' }}>
            Drag a candidate card into another stage. Dropping into interview opens slot planning instead of silently changing status.
          </p>
        </Card>
      </div>

      <section className="employer-kanban-board mt-1">
        {PIPELINE_COLUMNS.map((column) => (
          <div
            key={column.key}
            className="employer-kanban-column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={async () => { await handleDropStatus(column.key); }}
          >
            <div className="employer-kanban-head">
              <div>
                <strong>{column.label}</strong>
                <small>{groupedApplications[column.key]?.length || 0} candidates</small>
              </div>
              <Badge tone={column.tone}>{column.label}</Badge>
            </div>

            <div className="employer-kanban-stack">
              {(groupedApplications[column.key] || []).length ? groupedApplications[column.key].map((application) => {
                const ai = application.aiMatchExplanation || {};
                const bookedSlot = (application.interviewSlots || []).find((item) => item.isBooked);
                const planner = slotPlanners[application._id];
                const panelOpen = Boolean(planner?.open);

                return (
                  <article
                    key={application._id}
                    className="employer-applicant-card"
                    draggable
                    onDragStart={() => setDraggingId(application._id)}
                    onDragEnd={() => setDraggingId('')}
                  >
                    <div className="employer-applicant-top">
                      <div>
                        <strong>{application.candidateUser?.name || 'Candidate'}</strong>
                        <p>{application.candidateUser?.email || 'No email'}</p>
                      </div>
                      <Badge tone={application.aiMatchScore >= 80 ? 'success' : application.aiMatchScore >= 60 ? 'neutral' : 'danger'}>
                        {application.aiMatchScore ?? 0}%
                      </Badge>
                    </div>

                    <div className="employer-ai-summary">
                      <p>{ai.summary || 'AI summary unavailable.'}</p>
                      <div className="employer-ai-pills">
                        <span>Skills {application.aiMatchBreakdown?.skills ?? 0}</span>
                        <span>Experience {application.aiMatchBreakdown?.experience ?? 0}</span>
                        <span>Profile {application.aiMatchBreakdown?.profile ?? 0}</span>
                      </div>
                    </div>

                    <div className="employer-ai-list">
                      {(ai.highlights || []).slice(0, 2).map((item) => <small key={item}>{item}</small>)}
                      {(ai.concerns || []).slice(0, 1).map((item) => <small key={item} className="is-warning">{item}</small>)}
                    </div>

                    <div className="employer-candidate-meta">
                      <span>{(application.candidateProfile?.skills || []).slice(0, 3).join(', ') || 'Skills not added'}</span>
                      <span>{application.candidateProfile?.experienceYears ?? 0} years exp</span>
                    </div>

                    {application.interviewScheduledAt ? (
                      <div className="employer-booked-slot">
                        <Badge tone={application.status === 'hired' ? 'success' : 'success'}>{application.status === 'hired' ? 'Hired' : 'Interview booked'}</Badge>
                        <small>{formatDateTime(application.interviewScheduledAt)}</small>
                      </div>
                    ) : bookedSlot ? (
                      <div className="employer-booked-slot">
                        <Badge tone="success">Booked slot</Badge>
                        <small>{formatDateTime(bookedSlot.startsAt)}</small>
                      </div>
                    ) : null}

                    <div className="employer-card-actions">
                      <Select value={application.status} onChange={async (e) => { await updateStatus(application._id, e.target.value); }}>
                        {PIPELINE_COLUMNS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                      </Select>
                      <Button size="sm" variant="secondary" onClick={() => openSlotPlanner(application)}>Slots</Button>
                      <Button size="sm" variant="secondary" onClick={async () => { await toggleMessagePanel(application._id); }}>Message</Button>
                      <Button as={Link} to={`/employer/applicants/${application._id}`} size="sm" variant="ghost">Details</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          const blob = await applicationsApi.downloadResume(application._id);
                          const url = URL.createObjectURL(blob);
                          window.open(url, '_blank', 'noopener,noreferrer');
                          setTimeout(() => URL.revokeObjectURL(url), 1000);
                        }}
                      >
                        <Download size={14} /> Resume
                      </Button>
                    </div>

                    {application.interviewFeedback?.submittedAt ? (
                      <div className="employer-ai-summary">
                        <p>
                          Interview feedback: {application.interviewFeedback.recommendation?.replace(/_/g, ' ') || 'not set'}
                          {' · '}
                          {formatDate(application.interviewFeedback.submittedAt)}
                        </p>
                      </div>
                    ) : null}

                    {panelOpen ? (
                      <div className="employer-slot-planner">
                        <div className="panel-head">
                          <div>
                            <h4 style={{ margin: 0 }}>Interview Slot Booking</h4>
                            <p className="m-0">Share options, then confirm one slot when ready.</p>
                          </div>
                          <Badge tone="neutral">{planner.slots.length} slots</Badge>
                        </div>

                        <div className="grid-4">
                          <Select label="Mode" value={planner.mode} onChange={(e) => updateSlotPlanner(application._id, 'mode', e.target.value)}>
                            <option value="phone">Phone</option>
                            <option value="video">Video</option>
                            <option value="onsite">Onsite</option>
                          </Select>
                          <Input label="Location / platform" value={planner.location} onChange={(e) => updateSlotPlanner(application._id, 'location', e.target.value)} placeholder="Google Meet / Office address" />
                          <Input label="Meeting link" value={planner.meetingLink} onChange={(e) => updateSlotPlanner(application._id, 'meetingLink', e.target.value)} placeholder="https://..." />
                        </div>
                        <Textarea label="Notes" value={planner.notes} onChange={(e) => updateSlotPlanner(application._id, 'notes', e.target.value)} placeholder="Agenda, panel, prep notes" />

                        <div className="employer-slot-list">
                          {planner.slots.map((slot, index) => (
                            <div key={`${application._id}-slot-${index}`} className="employer-slot-row">
                              <Input label={`Start ${index + 1}`} type="datetime-local" value={slot.startsAt} onChange={(e) => updateSlotValue(application._id, index, 'startsAt', e.target.value)} />
                              <Input label="End" type="datetime-local" value={slot.endsAt} onChange={(e) => updateSlotValue(application._id, index, 'endsAt', e.target.value)} />
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeSlotRow(application._id, index)}>Remove</Button>
                            </div>
                          ))}
                        </div>

                        <div className="dashboard-actions">
                          <Button size="sm" variant="ghost" onClick={() => addSlotRow(application._id)}>Add slot</Button>
                          <Button size="sm" variant="secondary" onClick={async () => { await saveSlots(application._id); }}>Save slots</Button>
                          <Button size="sm" variant="ghost" onClick={() => closeSlotPlanner(application._id)}>Close</Button>
                        </div>

                        {(application.interviewSlots || []).length ? (
                          <div className="employer-existing-slots">
                            {(application.interviewSlots || []).map((slot) => (
                              <button
                                type="button"
                                key={slot._id}
                                className={`employer-existing-slot ${slot.isBooked ? 'is-booked' : ''}`}
                                onClick={async () => { await bookSlot(application._id, slot._id); }}
                              >
                                <strong>{slot.isBooked ? 'Booked' : 'Book this slot'}</strong>
                                <span>{formatDateTime(slot.startsAt)}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {messagePanels[application._id]?.open ? (
                      <div className="employer-message-panel">
                        <div className="employer-message-list">
                          {(messagesByApplication[application._id] || []).length ? (messagesByApplication[application._id] || []).map((item) => (
                            <div
                              key={item._id}
                              className={`employer-message-bubble ${item.senderUser?.role === 'employer' ? 'is-self' : ''}`}
                            >
                              <strong>{item.senderUser?.role === 'employer' ? 'You' : (item.senderUser?.name || 'Candidate')}</strong>
                              <p>{item.message}</p>
                            </div>
                          )) : <small>No messages yet.</small>}
                        </div>
                        <Textarea
                          label="Message to candidate"
                          value={messagePanels[application._id]?.text || ''}
                          onChange={(e) => setMessagePanels((current) => ({
                            ...current,
                            [application._id]: { ...(current[application._id] || {}), open: true, text: e.target.value }
                          }))}
                          placeholder="Share next steps or ask for details"
                        />
                        <div className="dashboard-actions">
                          <Button size="sm" variant="secondary" onClick={async () => { await sendMessage(application._id); }}>Send message</Button>
                          <Button size="sm" variant="ghost" onClick={async () => { await toggleMessagePanel(application._id); }}>Close</Button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              }) : (
                <div className="employer-empty-inline">
                  <h4>No candidates here</h4>
                  <p>Move cards into this stage or adjust the filters above.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {rejectionModal.open ? (
        <div className="app-modal-backdrop" role="presentation" onClick={() => setRejectionModal({ open: false, applicationId: '', reason: 'Skills mismatch', notes: '' })}>
          <div className="app-modal-card" role="dialog" aria-modal="true" aria-label="Set rejection reason" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <div>
                <p className="section-eyebrow">Candidate decision</p>
                <h3 style={{ margin: 0 }}>Set rejection reason</h3>
              </div>
              <Badge tone="danger"><CircleAlert size={12} /> Required</Badge>
            </div>
            <p style={{ marginTop: 0 }}>
              {selectedRejectionApplication?.candidateUser?.name || 'Candidate'} for {selectedRejectionApplication?.jobTitle || state.job?.title || 'this role'}
            </p>
            <Select label="Reason" value={rejectionModal.reason} onChange={(e) => setRejectionModal((current) => ({ ...current, reason: e.target.value }))}>
              {REJECTION_REASON_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </Select>
            <Textarea
              label="Additional notes"
              value={rejectionModal.notes}
              onChange={(e) => setRejectionModal((current) => ({ ...current, notes: e.target.value }))}
              placeholder="Optional extra detail for reporting clarity"
            />
            <div className="dashboard-actions">
              <Button
                onClick={async () => {
                  const finalReason = rejectionModal.reason === 'Other'
                    ? (rejectionModal.notes.trim() || 'Other')
                    : rejectionModal.reason;
                  await employerApi.updateApplicantStatus(rejectionModal.applicationId, {
                    status: 'rejected',
                    rejectionReason: finalReason
                  });
                  toast.success('Candidate rejected');
                  setRejectionModal({ open: false, applicationId: '', reason: 'Skills mismatch', notes: '' });
                  await refreshApplicants(filters);
                }}
              >
                Save rejection
              </Button>
              <Button variant="ghost" onClick={() => setRejectionModal({ open: false, applicationId: '', reason: 'Skills mismatch', notes: '' })}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {feedbackModal.open ? (
        <div className="app-modal-backdrop" role="presentation" onClick={() => setFeedbackModal({ open: false, applicationId: '', communication: 4, technicalSkills: 4, confidence: 4, cultureFit: 4, recommendation: 'yes', summary: '' })}>
          <div className="app-modal-card" role="dialog" aria-modal="true" aria-label="Interview feedback" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <div>
                <p className="section-eyebrow">Final decision</p>
                <h3 style={{ margin: 0 }}>Interview feedback and hire</h3>
              </div>
              <Badge tone="success">Hiring</Badge>
            </div>
            <div className="grid-4">
              <Input label="Communication" type="number" min="1" max="5" value={feedbackModal.communication} onChange={(e) => setFeedbackModal((current) => ({ ...current, communication: e.target.value }))} />
              <Input label="Technical" type="number" min="1" max="5" value={feedbackModal.technicalSkills} onChange={(e) => setFeedbackModal((current) => ({ ...current, technicalSkills: e.target.value }))} />
              <Input label="Confidence" type="number" min="1" max="5" value={feedbackModal.confidence} onChange={(e) => setFeedbackModal((current) => ({ ...current, confidence: e.target.value }))} />
              <Input label="Culture fit" type="number" min="1" max="5" value={feedbackModal.cultureFit} onChange={(e) => setFeedbackModal((current) => ({ ...current, cultureFit: e.target.value }))} />
            </div>
            <Select label="Recommendation" value={feedbackModal.recommendation} onChange={(e) => setFeedbackModal((current) => ({ ...current, recommendation: e.target.value }))}>
              <option value="strong_yes">Strong yes</option>
              <option value="yes">Yes</option>
              <option value="maybe">Maybe</option>
              <option value="no">No</option>
            </Select>
            <Textarea label="Summary" value={feedbackModal.summary} onChange={(e) => setFeedbackModal((current) => ({ ...current, summary: e.target.value }))} placeholder="Why this candidate is ready to hire" />
            <div className="dashboard-actions">
              <Button
                onClick={async () => {
                  await employerApi.updateApplicantStatus(feedbackModal.applicationId, {
                    status: 'hired',
                    interviewFeedback: {
                      communication: Number(feedbackModal.communication || 0),
                      technicalSkills: Number(feedbackModal.technicalSkills || 0),
                      confidence: Number(feedbackModal.confidence || 0),
                      cultureFit: Number(feedbackModal.cultureFit || 0),
                      recommendation: feedbackModal.recommendation,
                      summary: feedbackModal.summary
                    }
                  });
                  toast.success('Candidate marked as hired');
                  setFeedbackModal({ open: false, applicationId: '', communication: 4, technicalSkills: 4, confidence: 4, cultureFit: 4, recommendation: 'yes', summary: '' });
                  await refreshApplicants(filters);
                }}
              >
                Save and hire
              </Button>
              <Button variant="ghost" onClick={() => setFeedbackModal({ open: false, applicationId: '', communication: 4, technicalSkills: 4, confidence: 4, cultureFit: 4, recommendation: 'yes', summary: '' })}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
