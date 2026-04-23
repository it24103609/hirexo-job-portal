import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { adminApi } from '../../services/admin.api';
import { applicationsApi } from '../../services/applications.api';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

export default function AdminMessagesPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messagesByApplication, setMessagesByApplication] = useState({});
  const [recipientRole, setRecipientRole] = useState(ROLES.CANDIDATE);
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
      const res = await adminApi.applications({ status: 'all' });
      const nextThreads = (res.data || []).sort(
        (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      );
      setThreads(nextThreads);
      setSelectedId((current) => current || nextThreads[0]?._id || '');
    } catch (error) {
      toast.error(error.message || 'Failed to load admin message threads');
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
      setMessagesByApplication((current) => ({
        ...current,
        [applicationId]: res.data?.messages || []
      }));
      if (applicationId === selectedId) {
        setRecipientRole(res.meta?.permissions?.defaultRecipientRole || ROLES.CANDIDATE);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load application messages');
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    const requestedApplicationId = searchParams.get('applicationId');
    const requestedRecipientRole = searchParams.get('recipientRole');

    if (requestedApplicationId && threads.some((item) => item._id === requestedApplicationId)) {
      setSelectedId(requestedApplicationId);
    }

    if ([ROLES.CANDIDATE, ROLES.EMPLOYER].includes(requestedRecipientRole)) {
      setRecipientRole(requestedRecipientRole);
    }
  }, [searchParams, threads]);

  useEffect(() => {
    loadMessages(selectedId);
  }, [selectedId]);

  const handleSend = async () => {
    const message = draft.trim();
    if (!selectedId || !message) {
      toast.error('Enter a message first');
      return;
    }

    try {
      setSending(true);
      await applicationsApi.sendMessage(selectedId, { message, recipientRole });
      const refreshed = await applicationsApi.messages(selectedId);
      setMessagesByApplication((current) => ({
        ...current,
        [selectedId]: refreshed.data?.messages || []
      }));
      setRecipientRole(refreshed.meta?.permissions?.defaultRecipientRole || recipientRole);
      setDraft('');
      toast.success(recipientRole === ROLES.EMPLOYER ? 'Message sent to employer' : 'Message sent to candidate');
    } catch (error) {
      toast.error(error.message || 'Failed to send admin message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Loading admin messages..." />;

  return (
    <>
      <Seo title="Admin Messages | Hirexo" description="Monitor employer and candidate application conversations." />
      <DashboardHeader title="Messages" description="Read application conversations across the platform." />

      {!threads.length ? (
        <Card>
          <EmptyState
            title="No message threads yet"
            description="Application conversations will appear here once candidates and employers start chatting."
            actionLabel={null}
          />
        </Card>
      ) : (
        <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)', alignItems: 'start' }}>
          <Card>
            <Select
              label="Application thread"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {threads.map((item) => (
                <option key={item._id} value={item._id}>
                  {(item.candidateUser?.name || 'Candidate')} - {(item.job?.title || 'Application')}
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
                  <strong>{item.candidateUser?.name || 'Candidate'}</strong>
                  <div>{item.job?.title || 'Application'}</div>
                  <small>{item.job?.companyName || 'Hirexo'}</small>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            {selectedThread ? (
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <strong>{selectedThread.candidateUser?.name || 'Candidate'}</strong>
                  <div>{selectedThread.job?.title || 'Application'}</div>
                  <small>
                    {selectedThread.job?.companyName || 'Hirexo'} | Status: {selectedThread.status || 'pending'}
                  </small>
                </div>

                <div style={{ maxHeight: 520, overflow: 'auto', display: 'grid', gap: 10 }}>
                  {selectedMessages.length ? selectedMessages.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        justifySelf: item.senderUser?.role === 'employer' ? 'end' : 'start',
                        maxWidth: '85%'
                      }}
                    >
                      <div
                        style={{
                          background: item.senderUser?.role === 'employer' ? 'rgba(15,118,110,0.14)' : 'rgba(26,138,86,0.06)',
                          borderRadius: 14,
                          padding: '10px 12px'
                        }}
                      >
                        <strong>{item.senderUser?.role === 'admin' ? 'You' : (item.senderUser?.name || item.senderUser?.role || 'User')}</strong>
                        <div>{item.message}</div>
                        <small>{formatDateTime(item.createdAt)}</small>
                      </div>
                    </div>
                  )) : (
                    <EmptyState
                      title="No messages in this thread"
                      description="This application has no candidate-employer conversation yet."
                      actionLabel={null}
                    />
                  )}
                </div>

                <Select label="Send to" value={recipientRole} onChange={(event) => setRecipientRole(event.target.value)}>
                  <option value={ROLES.CANDIDATE}>Candidate</option>
                  <option value={ROLES.EMPLOYER}>Employer</option>
                </Select>
                <Textarea
                  label="Admin message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={recipientRole === ROLES.EMPLOYER ? 'Message the employer' : 'Message the candidate'}
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
