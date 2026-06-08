import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Paperclip, Search, Send, Smile } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';
import { applicationsApi } from '../../services/applications.api';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';
import '../../styles/employer-messages.css';

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
  return `Status: ${formatApplicationStatus(thread.status)}`;
}

function hasUnreadForEmployer(messages = []) {
  const lastMessage = messages[messages.length - 1];
  return Boolean(lastMessage && lastMessage.senderUser?.role !== ROLES.EMPLOYER);
}

export default function EmployerMessagesPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messagesByApplication, setMessagesByApplication] = useState({});
  const [messageMetaByApplication, setMessageMetaByApplication] = useState({});
  const [draft, setDraft] = useState('');
  const [recipientRole, setRecipientRole] = useState(ROLES.CANDIDATE);
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
      const candidate = String(item.candidateUser?.name || '').toLowerCase();
      const job = String(item.job?.title || '').toLowerCase();
      const company = String(item.job?.companyName || '').toLowerCase();
      const status = String(item.status || '').toLowerCase();
      return candidate.includes(query) || job.includes(query) || company.includes(query) || status.includes(query);
    });
  }, [searchQuery, threads]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const jobsRes = await employerApi.jobs();
      const jobs = jobsRes.data || [];
      const applicationResponses = await Promise.allSettled(
        jobs.map((job) => employerApi.applicants(job._id, { sortBy: 'recent' }))
      );

      const nextThreads = applicationResponses
        .flatMap((response) => (
          response.status === 'fulfilled'
            ? (response.value.data?.applications || []).map((application) => ({
              ...application,
              job: application.job || response.value.data?.job || null
            }))
            : []
        ))
        .map((application) => ({
          ...application,
          job: application.job || null
        }))
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

      setThreads(nextThreads);
      setSelectedId((current) => (
        nextThreads.some((item) => item._id === current)
          ? current
          : nextThreads[0]?._id || ''
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
      setMessagesByApplication((current) => ({
        ...current,
        [applicationId]: res.data?.messages || []
      }));
      setMessageMetaByApplication((current) => ({
        ...current,
        [applicationId]: res.meta?.permissions || {}
      }));
      if (applicationId === selectedId) {
        setRecipientRole(res.meta?.permissions?.defaultRecipientRole || ROLES.CANDIDATE);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load messages');
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

    if ([ROLES.CANDIDATE, ROLES.ADMIN].includes(requestedRecipientRole)) {
      setRecipientRole(requestedRecipientRole);
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
      toast.success(recipientRole === ROLES.ADMIN ? 'Message sent to admin' : 'Message sent to candidate');
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
    : 'Share interview updates or ask for details...';

  if (loading) return <Loader label="Loading employer messages..." />;

  return (
    <>
      <Seo title="Employer Messages | HEXORA" description="Chat with candidates across your applications." />
      <div className="employer-wa-page">
        <DashboardHeader title="Messages" description="Follow up with candidates from one shared employer inbox." />

        {!threads.length ? (
          <Card>
            <EmptyState
              title="No conversations yet"
              description="Candidate message threads will appear here once applications start coming in."
              actionLabel={null}
            />
          </Card>
        ) : (
          <div className="employer-wa-messenger">
            <aside className="employer-wa-sidebar" aria-label="Candidate message threads">
              <div className="employer-wa-sidebar-top">
                <div className="employer-wa-sidebar-head">
                  <h2>Inbox</h2>
                  <span className="employer-wa-sidebar-count">{threads.length} threads</span>
                </div>

                <label className="employer-wa-search" aria-label="Search conversations">
                  <Search size={16} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search chat"
                  />
                </label>
              </div>

              <div className="employer-wa-thread-list">
                {filteredThreads.length ? filteredThreads.map((item) => {
                  const threadMessages = messagesByApplication[item._id] || [];
                  const preview = getThreadPreview(item, threadMessages);
                  const unread = hasUnreadForEmployer(threadMessages);
                  const candidateName = item.candidateUser?.name || 'Candidate';

                  return (
                    <button
                      key={item._id}
                      type="button"
                      className={`employer-wa-thread ${item._id === selectedId ? 'is-active' : ''}`}
                      onClick={() => setSelectedId(item._id)}
                    >
                      <span className="employer-wa-avatar" aria-hidden="true">
                        {getInitials(candidateName)}
                      </span>

                      <span className="employer-wa-thread-body">
                        <span className="employer-wa-thread-top">
                          <strong>{candidateName}</strong>
                        </span>
                        <span className="employer-wa-thread-role">
                          {item.job?.title || 'Application'}
                        </span>
                        <span className="employer-wa-thread-preview">{preview}</span>
                      </span>

                      <span className="employer-wa-thread-meta-col">
                        <time className="employer-wa-thread-time">
                          {formatThreadTime(item.updatedAt || item.createdAt)}
                        </time>
                        {unread ? <span className="employer-wa-unread" aria-label="Unread messages">1</span> : null}
                      </span>
                    </button>
                  );
                }) : (
                  <div className="employer-wa-empty">
                    <EmptyState
                      title="No chats found"
                      description="Try another candidate name, job title, or status."
                      actionLabel={null}
                    />
                  </div>
                )}
              </div>
            </aside>

            <section className="employer-wa-chat">
              {selectedThread ? (
                <>
                  <header className="employer-wa-chat-header">
                    <div className="employer-wa-chat-identity">
                      <span className="employer-wa-avatar" aria-hidden="true">
                        {getInitials(selectedThread.candidateUser?.name || 'Candidate')}
                      </span>
                      <div className="employer-wa-chat-identity-info">
                        <strong>{selectedThread.candidateUser?.name || 'Candidate'}</strong>
                        <span>{selectedThread.job?.title || 'Application'}</span>
                      </div>
                    </div>
                    <span className="employer-wa-status">
                      {formatApplicationStatus(selectedThread.status)}
                    </span>
                  </header>

                  <div className="employer-wa-messages" ref={messagesContainerRef}>
                    {selectedMessages.length ? selectedMessages.map((item) => {
                      const isEmployer = item.senderUser?.role === ROLES.EMPLOYER;
                      const isAdmin = item.senderUser?.role === ROLES.ADMIN;
                      const senderLabel = isEmployer
                        ? 'You'
                        : isAdmin
                          ? 'Admin'
                          : (item.senderUser?.name || 'Candidate');

                      return (
                        <div
                          key={item._id}
                          className={`employer-wa-message-row ${isEmployer ? 'is-outgoing' : 'is-incoming'}`}
                        >
                          <div className="employer-wa-bubble-wrap">
                            <article
                              className={`employer-wa-bubble ${isEmployer ? 'is-outgoing' : 'is-incoming'} ${isAdmin ? 'is-admin' : ''}`}
                            >
                              {!isEmployer ? <span className="employer-wa-bubble-label">{senderLabel}</span> : null}
                              <p>{item.message}</p>
                            </article>
                            <time className="employer-wa-bubble-timestamp">{formatDateTime(item.createdAt)}</time>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="employer-wa-empty">
                        <span className="employer-wa-empty-icon" aria-hidden="true">
                          <MessageSquare size={28} />
                        </span>
                        <h3>No messages yet</h3>
                        <p>Start the conversation with your candidate from here. Replies and interview updates will appear in this thread.</p>
                      </div>
                    )}
                  </div>

                  <footer className="employer-wa-composer">
                    {allowedRecipientRoles.length > 1 ? (
                      <select
                        id="employer-message-recipient"
                        className="employer-wa-recipient-select"
                        value={recipientRole}
                        onChange={(event) => setRecipientRole(event.target.value)}
                        aria-label="Send message to"
                      >
                        {allowedRecipientRoles.map((role) => (
                          <option key={role} value={role}>
                            {role === ROLES.ADMIN ? 'Admin' : 'Candidate'}
                          </option>
                        ))}
                      </select>
                    ) : null}

                    <button type="button" className="employer-wa-icon-btn" aria-label="Insert emoji">
                      <Smile size={20} />
                    </button>

                    <div className="employer-wa-input-bar">
                      <input
                        type="text"
                        className="employer-wa-input"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder={composerPlaceholder}
                        aria-label="Reply message"
                      />
                    </div>

                    <button type="button" className="employer-wa-icon-btn" aria-label="Attach file">
                      <Paperclip size={20} />
                    </button>

                    <button
                      type="button"
                      className="employer-wa-send-btn"
                      onClick={handleSend}
                      disabled={sending}
                      aria-label={sending ? 'Sending message' : 'Send message'}
                    >
                      <Send size={18} />
                    </button>
                  </footer>
                </>
              ) : (
                <div className="employer-wa-empty employer-wa-empty-shell">
                  <span className="employer-wa-empty-icon" aria-hidden="true">
                    <MessageSquare size={32} />
                  </span>
                  <h3>Select a conversation</h3>
                  <p>Choose a candidate thread from the inbox to view and reply to messages.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
