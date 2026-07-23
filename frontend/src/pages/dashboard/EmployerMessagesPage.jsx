import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Paperclip, Search, Send, Smile, X, FileText } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';
import { applicationsApi } from '../../services/applications.api';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';
import { formatDateTime } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';
import '../../styles/employer-messages.css';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'C';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
}

function truncateName(name = '', maxLength = 12) {
  const str = String(name);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

function truncateJobTitle(title = '', maxLength = 10) {
  const str = String(title);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
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
  if (lastMessage?.attachment?.fileName) return `📎 ${lastMessage.attachment.fileName}`;
  return `Status: ${formatApplicationStatus(thread.status)}`;
}

function hasUnreadForEmployer(messages = []) {
  const lastMessage = messages[messages.length - 1];
  return Boolean(lastMessage && lastMessage.senderUser?.role !== ROLES.EMPLOYER);
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType) {
  if (!mimeType) return <FileText size={18} />;
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('zip')) return '📦';
  return '📎';
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
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
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
  }, [selectedId]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [selectedId, selectedMessages.length, sending]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = useCallback((emojiObject) => {
    setDraft((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10 MB');
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
    event.target.value = '';
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleDownloadAttachment = async (applicationId, messageId, fileName) => {
    try {
      const response = await applicationsApi.downloadMessageAttachment(applicationId, messageId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded: ${fileName}`);
    } catch (error) {
      toast.error(error.message || 'Failed to download attachment');
    }
  };

  const handleSend = async () => {
    const message = draft.trim();
    if (!selectedId || (!message && !selectedFile)) {
      toast.error('Enter a message or select a file first');
      return;
    }

    try {
      setSending(true);
      const permissions = messageMetaByApplication[selectedId] || {};
      const payload = {
        message,
        recipientRole,
        recipientUserId: recipientRole === ROLES.ADMIN ? permissions.adminReplyUserId : undefined
      };

      await applicationsApi.sendMessage(selectedId, payload, selectedFile);
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
      setSelectedFile(null);
      setRecipientRole(refreshed.meta?.permissions?.defaultRecipientRole || recipientRole);
      if (selectedFile) {
        toast.success('File sent successfully');
      } else {
        toast.success(recipientRole === ROLES.ADMIN ? 'Message sent to admin' : 'Message sent to candidate');
      }
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

  const handleThreadClick = (threadId) => {
    setSelectedId(threadId);
    setIsMobileChatOpen(true);
  };

  const handleBackToThreads = () => {
    setIsMobileChatOpen(false);
  };

  const composerPlaceholder = recipientRole === ROLES.ADMIN
    ? 'Reply to admin...'
    : 'Share interview updates or ask for details...';

  if (loading) return <Loader label="Loading employer messages..." />;

  return (
    <>
      <Seo title="Employer Messages | HEXORA" description="Chat with candidates across your applications." />
      <div className="employer-wa-page">
 
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
            <aside className={`employer-wa-sidebar ${isMobileChatOpen ? 'is-hidden' : ''}`} aria-label="Candidate message threads">
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
                      onClick={() => handleThreadClick(item._id)}
                    >
                      <span className="employer-wa-avatar" aria-hidden="true">
                        {getInitials(candidateName)}
                      </span>

                      <span className="employer-wa-thread-body">
                        <span className="employer-wa-thread-top">
                          <strong>{truncateName(candidateName, 12)}</strong>
                        </span>
                        <span className="employer-wa-thread-role">
                          {truncateJobTitle(item.job?.title || 'Application', 10)}
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

            <section className={`employer-wa-chat ${isMobileChatOpen ? 'is-visible' : ''}`}>
              {selectedThread ? (
                <>
                  <header className="employer-wa-chat-header">
                    <button
                      type="button"
                      className="employer-wa-back-btn"
                      onClick={handleBackToThreads}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="employer-wa-chat-identity">
                      <span className="employer-wa-avatar" aria-hidden="true">
                        {getInitials(selectedThread.candidateUser?.name || 'Candidate')}
                      </span>
                      <div className="employer-wa-chat-identity-info">
                        <strong>{truncateName(selectedThread.candidateUser?.name || 'Candidate', 12)}</strong>
                        <span>{truncateJobTitle(selectedThread.job?.title || 'Application', 10)}</span>
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
                      const hasAttachment = item.attachment?.fileName;

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
                              {item.message ? <p>{item.message}</p> : null}
                              {hasAttachment ? (
                                <button
                                  type="button"
                                  className="employer-wa-attachment"
                                  onClick={() => handleDownloadAttachment(selectedId, item._id, item.attachment.fileName)}
                                  aria-label={`Download ${item.attachment.fileName}`}
                                >
                                  <span className="employer-wa-attachment-icon">{getFileIcon(item.attachment.mimeType)}</span>
                                  <span className="employer-wa-attachment-name">{item.attachment.fileName}</span>
                                  <span className="employer-wa-attachment-size">{formatFileSize(item.attachment.size)}</span>
                                </button>
                              ) : null}
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

                    <div className="employer-wa-emoji-wrapper" ref={emojiPickerRef}>
                      <button
                        type="button"
                        className={`employer-wa-icon-btn ${showEmojiPicker ? 'is-active' : ''}`}
                        aria-label={showEmojiPicker ? 'Close emoji picker' : 'Insert emoji'}
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                      >
                        <Smile size={20} />
                      </button>
                      {showEmojiPicker && (
                        <div className="employer-wa-emoji-picker">
                          <EmojiPicker onEmojiClick={onEmojiClick} />
                        </div>
                      )}
                    </div>

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

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="employer-wa-file-input"
                      onChange={handleFileSelect}
                      aria-label="Choose file to attach"
                    />

                    {selectedFile ? (
                      <div className="employer-wa-file-badge">
                        <span className="employer-wa-file-badge-name">{selectedFile.name}</span>
                        <button
                          type="button"
                          className="employer-wa-file-badge-remove"
                          onClick={handleRemoveFile}
                          aria-label="Remove selected file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="employer-wa-icon-btn"
                        aria-label="Attach file"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip size={20} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="employer-wa-send-btn"
                      onClick={handleSend}
                      disabled={sending || (!draft.trim() && !selectedFile)}
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