import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Paperclip, Search, Send, Smile } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { adminApi } from '../../services/admin.api';
import { applicationsApi } from '../../services/applications.api';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';
import '../../styles/admin-messages.css';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'C';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
}

function formatApplicationStatus(status = '') {
  const key = String(status).toLowerCase();
  const labels = {
    pending: 'Pending',
    reviewed: 'Under Review',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Stage',
    interview: 'Interview Stage',
    hired: 'Hired',
    rejected: 'Rejected'
  };

  if (labels[key]) return labels[key];
  if (!key) return 'Pending';

  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatThreadTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getThreadPreview(thread, messages = []) {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.message) return lastMessage.message;
  return `${thread.job?.title || 'Application'} · ${thread.job?.companyName || 'HEXORA'}`;
}

function hasUnreadForAdmin(messages = []) {
  const lastMessage = messages[messages.length - 1];
  return Boolean(lastMessage && lastMessage.senderUser?.role !== 'admin');
}

export default function AdminMessagesPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messagesByApplication, setMessagesByApplication] = useState({});
  const [recipientRole, setRecipientRole] = useState(ROLES.CANDIDATE);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const selectedThread = useMemo(
    () => threads.find((item) => item._id === selectedId) || null,
    [selectedId, threads]
  );

  const selectedMessages = messagesByApplication[selectedId] || [];

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return threads;

    return threads.filter((item) => {
      const candidate = String(item.candidateUser?.name || '').toLowerCase();
      const job = String(item.job?.title || '').toLowerCase();
      const company = String(item.job?.companyName || '').toLowerCase();
      return candidate.includes(query) || job.includes(query) || company.includes(query);
    });
  }, [searchQuery, threads]);

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

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [selectedId, selectedMessages.length, sending]);

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

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  if (loading) return <Loader label="Loading admin messages..." />;

  return (
    <>
      <Seo title="Admin Messages | HEXORA" description="Monitor employer and candidate application conversations." />
      <div className="admin-wa-page">
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
        <div className="admin-wa-messenger">
          <aside className="admin-wa-sidebar" aria-label="Message threads">
            <div className="admin-wa-sidebar-top">
              <div className="admin-wa-sidebar-head">
                <h2>Inbox</h2>
                <span className="admin-wa-sidebar-count">{threads.length} threads</span>
              </div>

              <label className="admin-wa-search" aria-label="Search conversations">
                <Search size={16} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search chat"
                />
              </label>
            </div>

            <div className="admin-wa-thread-list">
              {filteredThreads.length ? filteredThreads.map((item) => {
                const threadMessages = messagesByApplication[item._id] || [];
                const preview = getThreadPreview(item, threadMessages);
                const unread = hasUnreadForAdmin(threadMessages);

                return (
                  <button
                    key={item._id}
                    type="button"
                    className={`admin-wa-thread ${item._id === selectedId ? 'is-active' : ''}`}
                    onClick={() => setSelectedId(item._id)}
                  >
                    <span className="admin-wa-avatar" aria-hidden="true">
                      {getInitials(item.candidateUser?.name || 'Candidate')}
                    </span>

                    <span className="admin-wa-thread-body">
                      <span className="admin-wa-thread-top">
                        <strong>{item.candidateUser?.name || 'Candidate'}</strong>
                      </span>
                      <span className="admin-wa-thread-role">
                        {item.job?.title || 'Application'} · {item.job?.companyName || 'HEXORA'}
                      </span>
                      <span className="admin-wa-thread-preview">{preview}</span>
                    </span>

                    <span className="admin-wa-thread-meta-col">
                      <time className="admin-wa-thread-time">
                        {formatThreadTime(item.updatedAt || item.createdAt)}
                      </time>
                      {unread ? <span className="admin-wa-unread" aria-label="Unread messages">1</span> : null}
                    </span>
                  </button>
                );
              }) : (
                <div className="admin-wa-empty">
                  <EmptyState
                    title="No chats found"
                    description="Try another candidate name, job title, or company."
                    actionLabel={null}
                  />
                </div>
              )}
            </div>
          </aside>

          <section className="admin-wa-chat">
            {selectedThread ? (
              <>
                <header className="admin-wa-chat-header">
                  <div className="admin-wa-chat-identity">
                    <span className="admin-wa-avatar" aria-hidden="true">
                      {getInitials(selectedThread.candidateUser?.name || 'Candidate')}
                    </span>
                    <div className="admin-wa-chat-identity-info">
                      <strong>{selectedThread.candidateUser?.name || 'Candidate'}</strong>
                      <span>{selectedThread.job?.title || 'Application'} · {selectedThread.job?.companyName || 'HEXORA'}</span>
                    </div>
                  </div>
                  <span className="admin-wa-status">{formatApplicationStatus(selectedThread.status)}</span>
                </header>

                <div className="admin-wa-messages" ref={messagesContainerRef}>
                  {selectedMessages.length ? selectedMessages.map((item) => {
                    const role = item.senderUser?.role;
                    const isAdmin = role === 'admin';
                    const isEmployer = role === 'employer';
                    const senderLabel = isAdmin
                      ? 'You'
                      : isEmployer
                        ? (item.senderUser?.name || 'Employer')
                        : (item.senderUser?.name || 'Candidate');

                    return (
                      <div
                        key={item._id}
                        className={`admin-wa-message-row ${isAdmin ? 'is-outgoing' : 'is-incoming'}`}
                      >
                        <div className="admin-wa-bubble-wrap">
                          <article
                            className={`admin-wa-bubble ${isAdmin ? 'is-outgoing' : 'is-incoming'} ${isEmployer ? 'is-employer' : ''}`}
                          >
                            {!isAdmin ? <span className="admin-wa-bubble-label">{senderLabel}</span> : null}
                            <p>{item.message}</p>
                          </article>
                          <time className="admin-wa-bubble-timestamp">{formatDateTime(item.createdAt)}</time>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="admin-wa-empty">
                      <span className="admin-wa-empty-icon" aria-hidden="true">
                        <MessageSquare size={28} />
                      </span>
                      <h3>No messages yet</h3>
                      <p>Start the conversation by sending a message below. Candidate and employer replies will appear here.</p>
                    </div>
                  )}
                  <span ref={messagesEndRef} />
                </div>

                <footer className="admin-wa-composer">
                  <select
                    id="admin-message-recipient"
                    className="admin-wa-recipient-select"
                    value={recipientRole}
                    onChange={(event) => setRecipientRole(event.target.value)}
                    aria-label="Send message to"
                  >
                    <option value={ROLES.CANDIDATE}>Candidate</option>
                    <option value={ROLES.EMPLOYER}>Employer</option>
                  </select>

                  <button type="button" className="admin-wa-icon-btn" aria-label="Insert emoji">
                    <Smile size={20} />
                  </button>

                  <div className="admin-wa-input-bar">
                    <input
                      type="text"
                      className="admin-wa-input"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder="Type a message..."
                      aria-label="Admin message"
                    />
                  </div>

                  <button type="button" className="admin-wa-icon-btn" aria-label="Attach file">
                    <Paperclip size={20} />
                  </button>

                  <button
                    type="button"
                    className="admin-wa-send-btn"
                    onClick={handleSend}
                    disabled={sending}
                    aria-label={sending ? 'Sending message' : 'Send message'}
                  >
                    <Send size={20} />
                  </button>
                </footer>
              </>
            ) : (
              <div className="admin-wa-empty admin-wa-empty-shell">
                <span className="admin-wa-empty-icon" aria-hidden="true">
                  <MessageSquare size={32} />
                </span>
                <h3>Select a conversation</h3>
                <p>Choose an application thread from the inbox to view and moderate messages.</p>
              </div>
            )}
          </section>
        </div>
      )}
      </div>
    </>
  );
}
