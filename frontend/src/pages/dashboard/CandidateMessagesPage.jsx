import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Paperclip, Search, Send, Smile } from 'lucide-react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { applicationsApi } from '../../services/applications.api';
import { formatDateTime } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';
import '../../styles/candidate-messages.css';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'E';
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
  return `Status: ${formatApplicationStatus(thread.status)}`;
}

function hasUnreadForCandidate(messages = []) {
  const lastMessage = messages[messages.length - 1];
  return Boolean(lastMessage && lastMessage.senderUser?.role !== ROLES.CANDIDATE);
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const messagesContainerRef = useRef(null);

  const selectedThread = useMemo(
    () => threads.find((item) => item._id === selectedId) || null,
    [selectedId, threads]
  );
  const selectedMessages = messagesByApplication[selectedId] || [];
  const allowedRecipientRoles = messageMetaByApplication[selectedId]?.allowedRecipientRoles || [];

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return threads;

    return threads.filter((item) => {
      const job = String(item.job?.title || '').toLowerCase();
      const company = String(item.job?.companyName || '').toLowerCase();
      const status = String(item.status || '').toLowerCase();
      return job.includes(query) || company.includes(query) || status.includes(query);
    });
  }, [searchQuery, threads]);

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

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  const composerPlaceholder = recipientRole === ROLES.ADMIN
    ? 'Reply to admin...'
    : 'Ask about next steps or interview details...';

  if (loading) return <Loader label="Loading candidate messages..." />;

  return (
    <>
      <Seo title="Candidate Messages | HEXORA" description="Message employers about your applications." />
      <div className="candidate-wa-page">
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
          <div className="candidate-wa-messenger">
            <aside className="candidate-wa-sidebar" aria-label="Application message threads">
              <div className="candidate-wa-sidebar-top">
                <div className="candidate-wa-sidebar-head">
                  <h2>Inbox</h2>
                  <span className="candidate-wa-sidebar-count">{threads.length} threads</span>
                </div>

                <label className="candidate-wa-search" aria-label="Search conversations">
                  <Search size={16} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search chat"
                  />
                </label>
              </div>

              <div className="candidate-wa-thread-list">
                {filteredThreads.length ? filteredThreads.map((item) => {
                  const threadMessages = messagesByApplication[item._id] || [];
                  const preview = getThreadPreview(item, threadMessages);
                  const unread = hasUnreadForCandidate(threadMessages);
                  const companyName = item.job?.companyName || 'Employer';

                  return (
                    <button
                      key={item._id}
                      type="button"
                      className={`candidate-wa-thread ${item._id === selectedId ? 'is-active' : ''}`}
                      onClick={() => setSelectedId(item._id)}
                    >
                      <span className="candidate-wa-avatar" aria-hidden="true">
                        {getInitials(companyName)}
                      </span>

                      <span className="candidate-wa-thread-body">
                        <span className="candidate-wa-thread-top">
                          <strong>{item.job?.title || 'Application'}</strong>
                        </span>
                        <span className="candidate-wa-thread-role">{companyName}</span>
                        <span className="candidate-wa-thread-preview">{preview}</span>
                      </span>

                      <span className="candidate-wa-thread-meta-col">
                        <time className="candidate-wa-thread-time">
                          {formatThreadTime(item.updatedAt || item.createdAt)}
                        </time>
                        {unread ? <span className="candidate-wa-unread" aria-label="Unread messages">1</span> : null}
                      </span>
                    </button>
                  );
                }) : (
                  <div className="candidate-wa-empty">
                    <EmptyState
                      title="No chats found"
                      description="Try another job title, company, or status."
                      actionLabel={null}
                    />
                  </div>
                )}
              </div>
            </aside>

            <section className="candidate-wa-chat">
              {selectedThread ? (
                <>
                  <header className="candidate-wa-chat-header">
                    <div className="candidate-wa-chat-identity">
                      <span className="candidate-wa-avatar" aria-hidden="true">
                        {getInitials(selectedThread.job?.companyName || 'Employer')}
                      </span>
                      <div className="candidate-wa-chat-identity-info">
                        <strong>{selectedThread.job?.title || 'Application'}</strong>
                        <span>{selectedThread.job?.companyName || 'Employer'}</span>
                      </div>
                    </div>
                    <span className="candidate-wa-status">
                      {formatApplicationStatus(selectedThread.status)}
                    </span>
                  </header>

                  <div className="candidate-wa-messages" ref={messagesContainerRef}>
                    {selectedMessages.length ? selectedMessages.map((item) => {
                      const isCandidate = item.senderUser?.role === ROLES.CANDIDATE;
                      const isAdmin = item.senderUser?.role === ROLES.ADMIN;
                      const senderLabel = isCandidate
                        ? 'You'
                        : isAdmin
                          ? 'Admin'
                          : (item.senderUser?.name || 'Employer');

                      return (
                        <div
                          key={item._id}
                          className={`candidate-wa-message-row ${isCandidate ? 'is-outgoing' : 'is-incoming'}`}
                        >
                          <div className="candidate-wa-bubble-wrap">
                            <article
                              className={`candidate-wa-bubble ${isCandidate ? 'is-outgoing' : 'is-incoming'} ${isAdmin ? 'is-admin' : ''}`}
                            >
                              {!isCandidate ? <span className="candidate-wa-bubble-label">{senderLabel}</span> : null}
                              <p>{item.message}</p>
                            </article>
                            <time className="candidate-wa-bubble-timestamp">{formatDateTime(item.createdAt)}</time>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="candidate-wa-empty">
                        <span className="candidate-wa-empty-icon" aria-hidden="true">
                          <MessageSquare size={28} />
                        </span>
                        <h3>No messages yet</h3>
                        <p>Start the conversation with the employer from here. Interview updates and replies will appear in this thread.</p>
                      </div>
                    )}
                  </div>

                  <footer className="candidate-wa-composer">
                    {allowedRecipientRoles.length > 1 ? (
                      <select
                        id="candidate-message-recipient"
                        className="candidate-wa-recipient-select"
                        value={recipientRole}
                        onChange={(event) => setRecipientRole(event.target.value)}
                        aria-label="Send message to"
                      >
                        {allowedRecipientRoles.map((role) => (
                          <option key={role} value={role}>
                            {role === ROLES.ADMIN ? 'Admin' : 'Employer'}
                          </option>
                        ))}
                      </select>
                    ) : null}

                    <button type="button" className="candidate-wa-icon-btn" aria-label="Insert emoji">
                      <Smile size={20} />
                    </button>

                    <div className="candidate-wa-input-bar">
                      <input
                        type="text"
                        className="candidate-wa-input"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder={composerPlaceholder}
                        aria-label="Reply message"
                      />
                    </div>

                    <button type="button" className="candidate-wa-icon-btn" aria-label="Attach file">
                      <Paperclip size={20} />
                    </button>

                    <button
                      type="button"
                      className="candidate-wa-send-btn"
                      onClick={handleSend}
                      disabled={sending}
                      aria-label={sending ? 'Sending message' : 'Send message'}
                    >
                      <Send size={18} />
                    </button>
                  </footer>
                </>
              ) : (
                <div className="candidate-wa-empty candidate-wa-empty-shell">
                  <span className="candidate-wa-empty-icon" aria-hidden="true">
                    <MessageSquare size={32} />
                  </span>
                  <h3>Select a conversation</h3>
                  <p>Choose an application thread from the inbox to view and reply to messages.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
