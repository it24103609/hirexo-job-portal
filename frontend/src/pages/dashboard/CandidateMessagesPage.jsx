import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { applicationsApi } from '../../services/applications.api';
import { formatDateTime } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

export default function CandidateMessagesPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messagesByApplication, setMessagesByApplication] = useState({});
  const [messageMetaByApplication, setMessageMetaByApplication] = useState({});
  const [recipientRole, setRecipientRole] = useState(ROLES.EMPLOYER);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const selectedThread = useMemo(
    () => threads.find((item) => item._id === selectedId) || null,
    [selectedId, threads]
  );
  const selectedMessages = messagesByApplication[selectedId] || [];

  const loadThreads = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.mine();
      const applications = res.data || [];
      setThreads(applications);
      setSelectedId((current) => (
        applications.some((item) => item._id === current)
          ? current
          : applications[0]?._id || ''
      ));
    } catch (error) {
      toast.error(error.message || 'Failed to load message inbox');
      setThreads([]);
      setSelectedId('');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (applicationId) => {
    if (!applicationId || messagesByApplication[applicationId]) return;

    try {
      const res = await applicationsApi.messages(applicationId);
      const permissions = res.meta?.permissions || {};
      setMessagesByApplication((current) => ({
        ...current,
        [applicationId]: res.data?.messages || []
      }));
      setMessageMetaByApplication((current) => ({
        ...current,
        [applicationId]: permissions
      }));
      setRecipientRole(permissions.defaultRecipientRole || ROLES.EMPLOYER);
    } catch (error) {
      toast.error(error.message || 'Failed to load messages');
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    const requestedApplicationId = searchParams.get('applicationId');
    if (requestedApplicationId && threads.some((item) => item._id === requestedApplicationId)) {
      setSelectedId(requestedApplicationId);
    }
  }, [searchParams, threads]);

  useEffect(() => {
    loadMessages(selectedId);
  }, [selectedId, messagesByApplication]);

  const handleSend = async () => {
    const message = draft.trim();
    if (!selectedId || !message) {
      toast.error('Enter a message first');
      return;
    }

    try {
      setSending(true);
      const permissions = messageMetaByApplication[selectedId] || {};
      await applicationsApi.sendMessage(selectedId, {
        message,
        recipientRole,
        recipientUserId: recipientRole === ROLES.ADMIN ? permissions.adminReplyUserId : undefined
      });
      const refreshed = await applicationsApi.messages(selectedId);
      setMessagesByApplication((current) => ({
        ...current,
        [selectedId]: refreshed.data?.messages || []
      }));
      setMessageMetaByApplication((current) => ({
        ...current,
        [selectedId]: refreshed.meta?.permissions || {}
      }));
      setDraft('');
      setRecipientRole(refreshed.meta?.permissions?.defaultRecipientRole || recipientRole);
      toast.success(recipientRole === ROLES.ADMIN ? 'Message sent to admin' : 'Message sent to employer');
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Loading candidate messages..." />;

  return (
    <>
      <Seo title="Candidate Messages | Hirexo" description="Message employers about your applications." />
      <DashboardHeader title="Messages" description="Follow up on your applications and interview updates." />

      {!threads.length ? (
        <Card>
          <EmptyState
            title="No conversations yet"
            description="Apply for a job first, then your message threads will appear here."
            actionLabel={null}
          />
        </Card>
      ) : (
        <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)', alignItems: 'start' }}>
          <Card>
            <Select label="Application thread" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {threads.map((item) => (
                <option key={item._id} value={item._id}>
                  {(item.job?.title || 'Application')} - {(item.job?.companyName || 'Employer')}
                </option>
              ))}
            </Select>

            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              {threads.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setSelectedId(item._id)}
                  style={{
                    textAlign: 'left',
                    border: item._id === selectedId ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: item._id === selectedId ? 'rgba(15,118,110,0.08)' : 'var(--surface)',
                    borderRadius: 14,
                    padding: 14,
                    cursor: 'pointer'
                  }}
                >
                  <strong>{item.job?.title || 'Application'}</strong>
                  <div>{item.job?.companyName || 'Employer'}</div>
                  <small>Status: {item.status || 'pending'}</small>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            {selectedThread ? (
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <strong>{selectedThread.job?.title || 'Application'}</strong>
                  <div>{selectedThread.job?.companyName || 'Employer'}</div>
                  <small>Status: {selectedThread.status || 'pending'}</small>
                </div>

                <div style={{ maxHeight: 420, overflow: 'auto', display: 'grid', gap: 10 }}>
                  {selectedMessages.length ? selectedMessages.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        justifySelf: item.senderUser?.role === ROLES.CANDIDATE ? 'end' : 'start',
                        maxWidth: '85%'
                      }}
                    >
                      <div
                        style={{
                          background: item.senderUser?.role === ROLES.CANDIDATE ? 'rgba(15,118,110,0.14)' : 'rgba(26,138,86,0.06)',
                          borderRadius: 14,
                          padding: '10px 12px'
                        }}
                      >
                        <strong>
                          {item.senderUser?.role === ROLES.CANDIDATE
                            ? 'You'
                            : item.senderUser?.role === ROLES.ADMIN
                              ? 'Admin'
                              : (item.senderUser?.name || 'Employer')}
                        </strong>
                        <div>{item.message}</div>
                        <small>{formatDateTime(item.createdAt)}</small>
                      </div>
                    </div>
                  )) : (
                    <EmptyState
                      title="No messages in this thread"
                      description="Start the conversation with the employer from here."
                      actionLabel={null}
                    />
                  )}
                </div>

                {(messageMetaByApplication[selectedId]?.allowedRecipientRoles || []).length > 1 ? (
                  <Select label="Send to" value={recipientRole} onChange={(event) => setRecipientRole(event.target.value)}>
                    {(messageMetaByApplication[selectedId]?.allowedRecipientRoles || []).map((role) => (
                      <option key={role} value={role}>
                        {role === ROLES.ADMIN ? 'Admin' : 'Employer'}
                      </option>
                    ))}
                  </Select>
                ) : null}
                <Textarea
                  label="Reply"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={recipientRole === ROLES.ADMIN ? 'Reply to admin' : 'Ask about next steps or interview details'}
                />
                <div className="dashboard-actions">
                  <Button onClick={handleSend} disabled={sending}>
                    {sending ? 'Sending...' : 'Send message'}
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </>
  );
}
