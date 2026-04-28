import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BriefcaseBusiness, CalendarClock, CircleCheckBig } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import { applicationsApi } from '../../services/applications.api';
import { candidateApi } from '../../services/candidate.api';
import { toast } from 'react-toastify';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

function getStatusMeta(status = '') {
  const key = String(status).toLowerCase();
  if (key === 'hired') return { label: 'Hired', tone: 'success' };
  if (key === 'shortlisted') return { label: 'Shortlisted', tone: 'success' };
  if (key === 'interview' || key === 'interview_scheduled') return { label: 'Interview scheduled', tone: 'success' };
  if (key === 'rejected') return { label: 'Rejected', tone: 'danger' };
  return { label: 'Applied', tone: 'neutral' };
}

export default function CandidateApplicationsPage() {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagePanels, setMessagePanels] = useState({});
  const [slotPanels, setSlotPanels] = useState({});
  const [messagesByApplication, setMessagesByApplication] = useState({});
  const [messageMetaByApplication, setMessageMetaByApplication] = useState({});

  useEffect(() => {
    applicationsApi.mine()
      .then((res) => setApplications(res.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const requestedApplicationId = searchParams.get('applicationId');
    const requestedRecipientRole = searchParams.get('recipientRole');

    if (!requestedApplicationId || !applications.some((item) => item._id === requestedApplicationId)) return;

    setMessagePanels((current) => ({
      ...current,
      [requestedApplicationId]: {
        ...(current[requestedApplicationId] || {}),
        open: true,
        text: current[requestedApplicationId]?.text || ''
      }
    }));

    if (!messagesByApplication[requestedApplicationId]) {
      applicationsApi.messages(requestedApplicationId)
        .then((res) => {
          setMessagesByApplication((current) => ({ ...current, [requestedApplicationId]: res.data?.messages || [] }));
          setMessageMetaByApplication((current) => ({ ...current, [requestedApplicationId]: res.meta?.permissions || {} }));
          setMessagePanels((current) => ({
            ...current,
            [requestedApplicationId]: {
              ...(current[requestedApplicationId] || {}),
              open: true,
              text: current[requestedApplicationId]?.text || '',
              recipientRole: [ROLES.EMPLOYER, ROLES.ADMIN].includes(requestedRecipientRole)
                ? requestedRecipientRole
                : current[requestedApplicationId]?.recipientRole || res.meta?.permissions?.defaultRecipientRole || ROLES.EMPLOYER
            }
          }));
        })
        .catch(() => {});
    }
  }, [applications, messagesByApplication, searchParams]);

  const shortlistedCount = applications.filter((item) => ['shortlisted', 'interview', 'interview_scheduled', 'hired'].includes(String(item.status || '').toLowerCase())).length;
  const openSlotCount = applications.filter((item) => (item.interviewSlots || []).some((slot) => !slot.isBooked)).length;
  const hiredCount = applications.filter((item) => String(item.status || '').toLowerCase() === 'hired').length;
  const offerCount = applications.filter((item) => item.offer && ['sent', 'accepted', 'declined'].includes(String(item.offer.status || '').toLowerCase())).length;

  const reloadApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationsApi.mine();
      setApplications(res.data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMessages = async (applicationId) => {
    const isOpen = Boolean(messagePanels[applicationId]?.open);
    if (isOpen) {
      setMessagePanels((current) => ({
        ...current,
        [applicationId]: { ...(current[applicationId] || {}), open: false }
      }));
      return;
    }

    setMessagePanels((current) => ({
      ...current,
      [applicationId]: { ...(current[applicationId] || {}), open: true, text: current[applicationId]?.text || '' }
    }));

    if (!messagesByApplication[applicationId]) {
      const res = await applicationsApi.messages(applicationId);
      setMessagesByApplication((current) => ({ ...current, [applicationId]: res.data?.messages || [] }));
      setMessageMetaByApplication((current) => ({ ...current, [applicationId]: res.meta?.permissions || {} }));
      setMessagePanels((current) => ({
        ...current,
        [applicationId]: {
          ...(current[applicationId] || {}),
          open: true,
          text: current[applicationId]?.text || '',
          recipientRole: current[applicationId]?.recipientRole || res.meta?.permissions?.defaultRecipientRole || ROLES.EMPLOYER
        }
      }));
    }
  };

  const setMessageText = (applicationId, text) => {
    setMessagePanels((current) => ({
      ...current,
      [applicationId]: { ...(current[applicationId] || {}), open: true, text }
    }));
  };

  const setRecipientRole = (applicationId, recipientRole) => {
    setMessagePanels((current) => ({
      ...current,
      [applicationId]: { ...(current[applicationId] || {}), open: true, recipientRole }
    }));
  };

  const sendMessage = async (applicationId) => {
    const text = String(messagePanels[applicationId]?.text || '').trim();
    const permissions = messageMetaByApplication[applicationId] || {};
    const recipientRole = messagePanels[applicationId]?.recipientRole || permissions.defaultRecipientRole || ROLES.EMPLOYER;
    if (!text) {
      toast.error('Message cannot be empty');
      return;
    }

    await applicationsApi.sendMessage(applicationId, {
      message: text,
      recipientRole,
      recipientUserId: recipientRole === ROLES.ADMIN ? permissions.adminReplyUserId : undefined
    });
    const refreshed = await applicationsApi.messages(applicationId);
    setMessagesByApplication((current) => ({ ...current, [applicationId]: refreshed.data?.messages || [] }));
    setMessageMetaByApplication((current) => ({ ...current, [applicationId]: refreshed.meta?.permissions || {} }));
    setMessagePanels((current) => ({
      ...current,
      [applicationId]: {
        ...(current[applicationId] || {}),
        text: '',
        open: true,
        recipientRole: current[applicationId]?.recipientRole || refreshed.meta?.permissions?.defaultRecipientRole || ROLES.EMPLOYER
      }
    }));
    toast.success(recipientRole === ROLES.ADMIN ? 'Reply sent to admin' : 'Reply sent to employer');
  };

  const toggleSlots = (applicationId) => {
    setSlotPanels((current) => ({
      ...current,
      [applicationId]: { open: !current[applicationId]?.open }
    }));
  };

  const bookSlot = async (applicationId, slotId) => {
    await applicationsApi.bookInterviewSlot(applicationId, { slotId });
    toast.success('Interview slot confirmed');
    await reloadApplications();
  };

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
          <article className="candidate-stat-card">
            <span className="candidate-stat-icon"><CalendarClock size={18} /></span>
            <div>
              <p>Open Slots</p>
              <strong>{openSlotCount}</strong>
            </div>
          </article>
          <article className="candidate-stat-card">
            <span className="candidate-stat-icon"><CircleCheckBig size={18} /></span>
            <div>
              <p>Hired</p>
              <strong>{hiredCount}</strong>
            </div>
          </article>
          <article className="candidate-stat-card">
            <span className="candidate-stat-icon"><CircleCheckBig size={18} /></span>
            <div>
              <p>Offers</p>
              <strong>{offerCount}</strong>
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
                  <tr><th>Job</th><th>Company</th><th>Status</th><th>Interview</th><th>Applied</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {applications.map((item) => {
                    const status = getStatusMeta(item.status);
                    const availableSlots = (item.interviewSlots || []).filter((slot) => !slot.isBooked);
                    const bookedSlot = (item.interviewSlots || []).find((slot) => slot.isBooked);
                    const offer = item.offer;
                    return (
                      <tr key={item._id}>
                        <td>
                          <strong>{item.job?.title || 'Job'}</strong>
                        </td>
                        <td>{item.job?.companyName || '-'}</td>
                        <td><Badge tone={status.tone}>{status.label}</Badge></td>
                        <td>{item.interviewScheduledAt ? formatDateTime(item.interviewScheduledAt) : '-'}</td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td>
                          <div className="candidate-quick-actions">
                            {availableSlots.length ? (
                              <Button size="sm" variant="secondary" onClick={() => toggleSlots(item._id)}>
                                {slotPanels[item._id]?.open ? 'Hide slots' : `Book slot (${availableSlots.length})`}
                              </Button>
                            ) : null}
                            <Button size="sm" variant="secondary" onClick={async () => { await toggleMessages(item._id); }}>
                              {messagePanels[item._id]?.open ? 'Hide' : 'Messages'}
                            </Button>
                          </div>

                          {bookedSlot && !availableSlots.length ? (
                            <div className="mt-1" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, minWidth: 240 }}>
                              <small>Confirmed slot</small>
                              <div><strong>{formatDateTime(bookedSlot.startsAt)}</strong></div>
                              <div>{bookedSlot.mode || 'video'}{bookedSlot.location ? ` · ${bookedSlot.location}` : ''}</div>
                            </div>
                          ) : null}

                          {offer ? (
                            <div className="mt-1" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, minWidth: 260, display: 'grid', gap: 6 }}>
                              <small>Offer status</small>
                              <div><strong>{offer.title || item.job?.title || 'Offer'}</strong></div>
                              <div>{offer.currency || 'LKR'} {offer.salary || 0}{offer.joiningDate ? ` · Join ${formatDate(offer.joiningDate)}` : ''}</div>
                              <Badge tone={offer.status === 'accepted' ? 'success' : offer.status === 'declined' ? 'danger' : 'neutral'}>{offer.status}</Badge>
                              {offer.notes ? <small>{offer.notes}</small> : null}
                              {offer.status === 'sent' ? (
                                <div className="dashboard-actions">
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      await candidateApi.respondToOffer(offer._id, { status: 'accepted' });
                                      toast.success('Offer accepted');
                                      await reloadApplications();
                                    }}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={async () => {
                                      await candidateApi.respondToOffer(offer._id, { status: 'declined' });
                                      toast.info('Offer declined');
                                      await reloadApplications();
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {(item.screeningAnswers || []).length ? (
                            <div className="mt-1" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, minWidth: 260, display: 'grid', gap: 6 }}>
                              <strong>Screening answers</strong>
                              {(item.screeningAnswers || []).slice(0, 2).map((answer, index) => (
                                <div key={`${item._id}-${answer.questionId || index}`}>
                                  <small>{answer.question}</small>
                                  <div>{answer.answer || 'No answer submitted'}</div>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {slotPanels[item._id]?.open ? (
                            <div className="mt-1" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, minWidth: 260, display: 'grid', gap: 8 }}>
                              <strong>Available interview slots</strong>
                              {availableSlots.length ? availableSlots.map((slot) => (
                                <button
                                  key={slot._id}
                                  type="button"
                                  className="candidate-slot-option"
                                  onClick={async () => { await bookSlot(item._id, slot._id); }}
                                >
                                  <span>{formatDateTime(slot.startsAt)}</span>
                                  <small>{slot.mode || 'video'}{slot.location ? ` · ${slot.location}` : ''}</small>
                                </button>
                              )) : <small>No open slots right now.</small>}
                            </div>
                          ) : null}

                          {messagePanels[item._id]?.open ? (
                            <div className="mt-1" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, minWidth: 240 }}>
                              <div style={{ maxHeight: 160, overflow: 'auto', display: 'grid', gap: 6, marginBottom: 8 }}>
                                {(messagesByApplication[item._id] || []).length ? (messagesByApplication[item._id] || []).map((message) => (
                                  <div
                                    key={message._id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: message.senderUser?.role === 'candidate' ? 'flex-end' : 'flex-start'
                                    }}
                                  >
                                    <div
                                      style={{
                                        background: message.senderUser?.role === 'candidate' ? 'rgba(15,118,110,0.14)' : 'rgba(26,138,86,0.06)',
                                        borderRadius: 8,
                                        padding: '6px 8px',
                                        maxWidth: '85%',
                                        width: 'fit-content'
                                      }}
                                    >
                                      <strong>
                                        {message.senderUser?.role === 'candidate'
                                          ? 'You'
                                          : message.senderUser?.role === 'admin'
                                            ? 'Admin'
                                            : (message.senderUser?.name || 'Employer')}
                                      </strong>
                                      <div>{message.message}</div>
                                    </div>
                                  </div>
                                )) : <small>No messages yet.</small>}
                              </div>
                              {(messageMetaByApplication[item._id]?.allowedRecipientRoles || []).length > 1 ? (
                                <Select
                                  label="Send to"
                                  value={messagePanels[item._id]?.recipientRole || messageMetaByApplication[item._id]?.defaultRecipientRole || ROLES.EMPLOYER}
                                  onChange={(event) => setRecipientRole(item._id, event.target.value)}
                                >
                                  {(messageMetaByApplication[item._id]?.allowedRecipientRoles || []).map((role) => (
                                    <option key={role} value={role}>
                                      {role === ROLES.ADMIN ? 'Admin' : 'Employer'}
                                    </option>
                                  ))}
                                </Select>
                              ) : null}
                              <input
                                className="input"
                                value={messagePanels[item._id]?.text || ''}
                                onChange={(event) => setMessageText(item._id, event.target.value)}
                                onKeyDown={async (event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    await sendMessage(item._id);
                                  }
                                }}
                                placeholder={(messagePanels[item._id]?.recipientRole || messageMetaByApplication[item._id]?.defaultRecipientRole) === ROLES.ADMIN ? 'Type a message to admin' : 'Type a message to employer'}
                              />
                              <div className="dashboard-actions">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  disabled={!String(messagePanels[item._id]?.text || '').trim()}
                                  onClick={async () => { await sendMessage(item._id); }}
                                >
                                  Send
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </td>
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
