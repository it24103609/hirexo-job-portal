import { useEffect, useMemo, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { contactApi } from '../../services/contact.api';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

export default function AdminInquiriesPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const loadContacts = async (nextStatus = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const res = await contactApi.list(nextStatus ? { status: nextStatus } : {});
      setContacts(res.data || []);
      if (selectedContact) {
        const refreshed = (res.data || []).find((item) => item._id === selectedContact._id);
        if (refreshed) {
          setSelectedContact(refreshed);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load inquiries.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const stats = useMemo(() => ({
    newCount: contacts.filter((item) => item.status === 'new').length,
    readCount: contacts.filter((item) => item.status === 'read').length,
    repliedCount: contacts.filter((item) => item.status === 'replied').length
  }), [contacts]);

  const openContact = async (contact) => {
    try {
      const res = await contactApi.getById(contact._id);
      setSelectedContact(res.data || contact);
      setReplyMessage('');
      await loadContacts();
    } catch (err) {
      toast.error(err.message || 'Failed to load inquiry details.');
    }
  };

  const onReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      toast.error('Reply message is required.');
      return;
    }

    setReplying(true);
    try {
      const res = await contactApi.reply(selectedContact._id, { message: replyMessage.trim() });
      setSelectedContact(res.data);
      setReplyMessage('');
      toast.success('Reply sent successfully.');
      await loadContacts();
    } catch (err) {
      toast.error(err.message || 'Failed to send reply.');
    } finally {
      setReplying(false);
    }
  };

  const onStatusChange = async (contactId, nextStatus) => {
    try {
      await contactApi.updateStatus(contactId, { status: nextStatus });
      toast.success('Status updated.');
      await loadContacts();
      if (selectedContact?._id === contactId) {
        setSelectedContact((current) => current ? { ...current, status: nextStatus } : current);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const onDelete = async (contactId) => {
    const confirmed = window.confirm('Delete this inquiry?');
    if (!confirmed) return;

    setDeletingId(contactId);
    try {
      await contactApi.remove(contactId);
      toast.success('Inquiry deleted.');
      if (selectedContact?._id === contactId) {
        setSelectedContact(null);
      }
      await loadContacts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete inquiry.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <>
      <Seo title="Inquiries | Hirexo" description="Contact and lead inquiry management." />
      <DashboardHeader
        title="Inquiries"
        description="Review contact submissions, reply to leads, and manage status changes."
      />

      <Card>
        <div className="grid-3" style={{ marginBottom: '1rem' }}>
          <Card className="dashboard-panel"><strong>New</strong><h3>{stats.newCount}</h3></Card>
          <Card className="dashboard-panel"><strong>Read</strong><h3>{stats.readCount}</h3></Card>
          <Card className="dashboard-panel"><strong>Replied</strong><h3>{stats.repliedCount}</h3></Card>
        </div>

        <div style={{ maxWidth: '240px', marginBottom: '1rem' }}>
          <Select
            label="Filter by status"
            value={statusFilter}
            onChange={async (e) => {
              const next = e.target.value;
              setStatusFilter(next);
              await loadContacts(next);
            }}
          >
            <option value="">All inquiries</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </Select>
        </div>

        {loading ? <Loader label="Loading inquiries..." /> : null}

        {!loading && error ? (
          <div className="empty-state">
            <h3>Could not load inquiries</h3>
            <p>{error}</p>
            <Button onClick={() => loadContacts()}>Retry</Button>
          </div>
        ) : null}

        {!loading && !error && !contacts.length ? (
          <div className="empty-state">
            <h3>No inquiries found</h3>
            <p>Contact submissions will appear here once users send messages.</p>
          </div>
        ) : null}

        {!loading && !error && contacts.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.subject}</td>
                  <td><Badge tone="neutral">{contact.status}</Badge></td>
                  <td>{formatDate(contact.createdAt)}</td>
                  <td>
                    <div className="form-links">
                      <Button size="sm" variant="secondary" onClick={() => openContact(contact)}>View</Button>
                      <Button size="sm" variant="secondary" onClick={() => onStatusChange(contact._id, 'read')}>Mark read</Button>
                      <Button size="sm" variant="secondary" onClick={() => onStatusChange(contact._id, 'replied')}>Mark replied</Button>
                      <Button size="sm" variant="secondary" disabled={deletingId === contact._id} onClick={() => onDelete(contact._id)}>
                        {deletingId === contact._id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Card>

      {selectedContact ? (
        <Card>
          <h3>Inquiry details</h3>
          <p><strong>{selectedContact.name}</strong> · {selectedContact.email}</p>
          <p>{selectedContact.subject}</p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
          <p>Status: <Badge tone="neutral">{selectedContact.status}</Badge></p>

          <div className="form-grid">
            <Textarea
              label="Reply message"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={5}
              placeholder="Write a helpful response to the inquiry"
            />
            <div className="dashboard-actions">
              <Button onClick={onReply} disabled={replying}>{replying ? 'Sending reply...' : 'Send reply'}</Button>
              <Button variant="secondary" onClick={() => setSelectedContact(null)}>Close</Button>
            </div>
          </div>
        </Card>
      ) : null}
    </>
  );
}
