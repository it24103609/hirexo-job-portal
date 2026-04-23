import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/formatters';
import { REJECTION_REASON_OPTIONS } from '../../utils/applicationMeta';

export default function EmployerApplicantsPage() {
  const { jobId } = useParams();
  const [state, setState] = useState({ loading: true, job: null, applications: [] });
  const [filters, setFilters] = useState({ keyword: '', skills: '', minExperience: '', education: '', sortBy: 'ai' });
  const [scheduleForms, setScheduleForms] = useState({});
  const [messagePanels, setMessagePanels] = useState({});
  const [messagesByApplication, setMessagesByApplication] = useState({});
  const [rejectionModal, setRejectionModal] = useState({ open: false, applicationId: '', reason: 'Skills mismatch', notes: '' });

  const toggleScheduleForm = (applicationId) => {
    setScheduleForms((current) => {
      const existing = current[applicationId];
      if (existing?.open) {
        return { ...current, [applicationId]: { ...existing, open: false } };
      }

      return {
        ...current,
        [applicationId]: {
          open: true,
          interviewScheduledAt: existing?.interviewScheduledAt || '',
          interviewMode: existing?.interviewMode || 'video',
          interviewLocation: existing?.interviewLocation || '',
          interviewMeetingLink: existing?.interviewMeetingLink || '',
          interviewNotes: existing?.interviewNotes || ''
        }
      };
    });
  };

  const updateScheduleField = (applicationId, key, value) => {
    setScheduleForms((current) => ({
      ...current,
      [applicationId]: {
        ...(current[applicationId] || {}),
        open: true,
        [key]: value
      }
    }));
  };

  const toggleMessagePanel = async (applicationId) => {
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
    }
  };

  const setMessageText = (applicationId, value) => {
    setMessagePanels((current) => ({
      ...current,
      [applicationId]: { ...(current[applicationId] || {}), open: true, text: value }
    }));
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

  const loadApplicants = async (nextFilters = filters) => {
    const res = await employerApi.applicants(jobId, nextFilters);
    setState({ loading: false, job: res.data?.job || null, applications: res.data?.applications || [] });
  };

  const refreshApplicants = async (nextFilters = filters) => {
    setState((current) => ({ ...current, loading: true }));
    await loadApplicants(nextFilters);
  };

  useEffect(() => {
    loadApplicants().catch(() => setState({ loading: false, job: null, applications: [] }));
  }, [jobId]);

  if (state.loading) return <Loader label="Loading applicants..." />;

  const selectedRejectionApplication = rejectionModal.open
    ? state.applications.find((item) => item._id === rejectionModal.applicationId)
    : null;

  return (
    <>
      <Seo title="Applicants | Hirexo" description="Review applicants for your job." />
      <DashboardHeader title="Applicants" description={state.job ? `${state.job.title} - applicant pool` : 'Applicant pool for your job'} />
      <Card>
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
        </div>
      </Card>
      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Candidate</th><th>Profile</th><th>AI Match</th><th>Status</th><th>Resume</th><th>Action</th></tr></thead>
            <tbody>
              {state.applications.length ? state.applications.map((application) => (
                <tr key={application._id}>
                  <td>{application.candidateUser?.name || 'Candidate'}</td>
                  <td>
                    <small>
                      Skills: {(application.candidateProfile?.skills || []).slice(0, 4).join(', ') || '-'}
                      <br />
                      Experience: {application.candidateProfile?.experienceYears ?? 0} years
                    </small>
                  </td>
                  <td>
                    <Badge tone={application.aiMatchScore >= 80 ? 'success' : application.aiMatchScore >= 60 ? 'neutral' : 'danger'}>
                      {application.aiMatchScore ?? 0}%
                    </Badge>
                    <div><small>{application.aiMatchLabel || 'Fit unknown'}</small></div>
                  </td>
                  <td><Badge tone={application.status === 'shortlisted' ? 'success' : 'neutral'}>{application.status}</Badge></td>
                  <td>{application.resumeSnapshot?.fileName || '-'}</td>
                  <td>
                    <div className="form-links">
                      <Select defaultValue={application.status} onChange={async (e) => {
                        const nextStatus = e.target.value;
                        if (nextStatus === 'interview_scheduled') {
                          toast.info('Use the schedule interview form to set date and time.');
                          toggleScheduleForm(application._id);
                          return;
                        }

                        if (nextStatus === 'rejected') {
                          setRejectionModal({
                            open: true,
                            applicationId: application._id,
                            reason: REJECTION_REASON_OPTIONS.includes(application.rejectionReason) ? application.rejectionReason : 'Skills mismatch',
                            notes: application.rejectionReason && !REJECTION_REASON_OPTIONS.includes(application.rejectionReason) ? application.rejectionReason : ''
                          });
                          return;
                        }

                        await employerApi.updateApplicantStatus(application._id, { status: nextStatus });
                        toast.success('Status updated');
                        await loadApplicants(filters);
                      }}>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                      <Button variant="secondary" size="sm" onClick={() => toggleScheduleForm(application._id)}>Schedule interview</Button>
                      <Button variant="secondary" size="sm" onClick={async () => { await toggleMessagePanel(application._id); }}>Message</Button>
                      <Button as={Link} to={`/employer/applicants/${application._id}`} variant="secondary" size="sm">Details</Button>
                      <Button variant="secondary" size="sm" onClick={async () => {
                        const blob = await applicationsApi.downloadResume(application._id);
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank', 'noopener,noreferrer');
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}>Resume</Button>
                    </div>
                    {scheduleForms[application._id]?.open ? (
                      <div className="mt-1" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                        <div className="grid-4">
                          <Input
                            label="Date & time"
                            type="datetime-local"
                            value={scheduleForms[application._id]?.interviewScheduledAt || ''}
                            onChange={(e) => updateScheduleField(application._id, 'interviewScheduledAt', e.target.value)}
                          />
                          <Select
                            label="Mode"
                            value={scheduleForms[application._id]?.interviewMode || 'video'}
                            onChange={(e) => updateScheduleField(application._id, 'interviewMode', e.target.value)}
                          >
                            <option value="phone">Phone</option>
                            <option value="video">Video</option>
                            <option value="onsite">Onsite</option>
                          </Select>
                          <Input
                            label="Location / platform"
                            value={scheduleForms[application._id]?.interviewLocation || ''}
                            onChange={(e) => updateScheduleField(application._id, 'interviewLocation', e.target.value)}
                            placeholder="Google Meet / Office address"
                          />
                          <Input
                            label="Meeting link"
                            value={scheduleForms[application._id]?.interviewMeetingLink || ''}
                            onChange={(e) => updateScheduleField(application._id, 'interviewMeetingLink', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <Textarea
                          label="Interview notes"
                          value={scheduleForms[application._id]?.interviewNotes || ''}
                          onChange={(e) => updateScheduleField(application._id, 'interviewNotes', e.target.value)}
                          placeholder="Agenda, panel members, preparation notes"
                        />
                        <div className="dashboard-actions">
                          <Button variant="secondary" size="sm" onClick={async () => {
                            const schedule = scheduleForms[application._id] || {};
                            if (!schedule.interviewScheduledAt) {
                              toast.error('Interview date and time is required');
                              return;
                            }

                            await employerApi.updateApplicantStatus(application._id, {
                              status: 'interview_scheduled',
                              interviewScheduledAt: schedule.interviewScheduledAt,
                              interviewMode: schedule.interviewMode || 'video',
                              interviewLocation: schedule.interviewLocation || '',
                              interviewMeetingLink: schedule.interviewMeetingLink || '',
                              interviewNotes: schedule.interviewNotes || ''
                            });
                            toast.success('Interview scheduled');
                            await loadApplicants(filters);
                            toggleScheduleForm(application._id);
                          }}>Save interview</Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleScheduleForm(application._id)}>Cancel</Button>
                        </div>
                      </div>
                    ) : null}
                    {messagePanels[application._id]?.open ? (
                      <div className="mt-1" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                        <div style={{ maxHeight: 180, overflow: 'auto', marginBottom: 10, display: 'grid', gap: 8 }}>
                          {(messagesByApplication[application._id] || []).length ? (messagesByApplication[application._id] || []).map((item) => (
                            <div
                              key={item._id}
                              style={{
                                display: 'flex',
                                justifyContent: item.senderUser?.role === 'employer' ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <div
                                style={{
                                  background: item.senderUser?.role === 'employer' ? 'rgba(15,118,110,0.14)' : 'rgba(26,138,86,0.06)',
                                  borderRadius: 10,
                                  padding: '8px 10px',
                                  maxWidth: '85%',
                                  width: 'fit-content'
                                }}
                              >
                                <strong>{item.senderUser?.role === 'employer' ? 'You' : (item.senderUser?.name || 'Candidate')}</strong>
                                <div>{item.message}</div>
                              </div>
                            </div>
                          )) : <small>No messages yet.</small>}
                        </div>
                        <Textarea
                          label="Message to candidate"
                          value={messagePanels[application._id]?.text || ''}
                          onChange={(e) => setMessageText(application._id, e.target.value)}
                          placeholder="Share next steps or ask for details"
                        />
                        <div className="dashboard-actions">
                          <Button variant="secondary" size="sm" onClick={async () => { await sendMessage(application._id); }}>Send message</Button>
                          <Button variant="ghost" size="sm" onClick={async () => { await toggleMessagePanel(application._id); }}>Close</Button>
                        </div>
                      </div>
                    ) : null}
                    {application.interviewScheduledAt ? <small>Interview: {formatDateTime(application.interviewScheduledAt)}</small> : null}
                  </td>
                </tr>
              )) : <tr><td colSpan="6">No applicants found for current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      {rejectionModal.open ? (
        <div className="app-modal-backdrop" role="presentation" onClick={() => setRejectionModal({ open: false, applicationId: '', reason: 'Skills mismatch', notes: '' })}>
          <div className="app-modal-card" role="dialog" aria-modal="true" aria-label="Set rejection reason" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <div>
                <p className="section-eyebrow">Candidate decision</p>
                <h3 style={{ margin: 0 }}>Set rejection reason</h3>
              </div>
              <Badge tone="danger">Required</Badge>
            </div>
            <p style={{ marginTop: 0 }}>
              {selectedRejectionApplication?.candidateUser?.name || 'Candidate'} for {selectedRejectionApplication?.jobTitle || state.job?.title || 'this role'}
            </p>
            <Select
              label="Reason"
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal((current) => ({ ...current, reason: e.target.value }))}
            >
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
                  await loadApplicants(filters);
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
    </>
  );
}
