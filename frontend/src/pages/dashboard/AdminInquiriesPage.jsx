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
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import { contactApi } from '../../services/contact.api';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';
import { Mail, MailOpen, Reply, Users, Search, Archive, Inbox, UserCheck, UserX, Clock, RefreshCw } from 'lucide-react';

export default function AdminInquiriesPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [dateFilter, setDateFilter] = useState('');

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
    // eslint-disable-next-line
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      newCount: contacts.filter((item) => item.status === 'new').length,
      readCount: contacts.filter((item) => item.status === 'read').length,
      repliedCount: contacts.filter((item) => item.status === 'replied').length,
      total: contacts.length,
      today: contacts.filter((item) => (item.createdAt || '').slice(0, 10) === today).length
    };
  }, [contacts]);

  const getStatusTone = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'new': return 'primary';
      case 'read': return 'neutral';
      case 'replied': return 'success';
      case 'archived': return 'danger';
      default: return 'neutral';
    }
  };

  const statCards = [
    { label: 'New', value: stats.newCount, icon: Mail, tone: 'primary' },
    { label: 'Read', value: stats.readCount, icon: MailOpen, tone: 'neutral' },
    { label: 'Replied', value: stats.repliedCount, icon: Reply, tone: 'success' },
    { label: 'Total', value: stats.total, icon: Inbox, tone: 'default' },
    { label: 'Today', value: stats.today, icon: Clock, tone: 'primary' },
  ];

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q)) &&
      (!statusFilter || c.status === statusFilter) &&
      (!dateFilter || (c.createdAt || '').slice(0, 10) === dateFilter)
    );
  }).sort((a, b) => {
    if (sort === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const openContact = async (contact) => {
    try {
      const res = await contactApi.getById(contact._id);
      setSelectedContact(res.data);
    } catch (err) {
      toast.error('Failed to load inquiry details.');
    }
  };

  // Add onStatusChange and onDelete handlers as needed

  return (
    <>
      <Seo title="Inquiries | Hirexo" description="Contact and lead inquiry management." />
      <DashboardHeader
        title="Inquiries"
        description="Review contact submissions, reply to leads, and manage status changes."
        actions={<Button variant="ghost" onClick={() => loadContacts()}><RefreshCw size={16} style={{marginRight: 6}} /> Refresh</Button>}
      />

      {/* Stat cards row */}
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.1rem', marginBottom: '1.5rem' }}>
        {statCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} tone={card.tone} />
        ))}
      </div>

      {/* Main workspace: inbox + preview */}
      <div className="form-grid" style={{ gridTemplateColumns: selectedContact ? '1.7fr 1.3fr' : '1fr', gap: '2.2rem', alignItems: 'start', marginBottom: '2.2rem' }}>
        {/* Inbox/lead list area */}
        <Card style={{ padding: 0, overflow: 'visible' }}>
          {/* Filter toolbar */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '1.1rem 1.2rem 0.5rem', borderBottom: '1px solid var(--border)' }}>
            <div className="input" style={{ display: 'flex', alignItems: 'center', minWidth: 180, background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '0 0.7rem' }}>
              <Search size={16} style={{ marginRight: 6, color: 'var(--muted)' }} />
              <input type="text" placeholder="Search name, email, subject..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%' }} />
            </div>
            <Select label={null} value={statusFilter} onChange={async (e) => { const next = e.target.value; setStatusFilter(next); await loadContacts(next); }} style={{ minWidth: 120 }}>
              <option value="">All</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </Select>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input" style={{ minWidth: 140, maxWidth: 180 }} />
            <Select label={null} value={sort} onChange={e => setSort(e.target.value)} style={{ minWidth: 120 }}>
              <option value="latest">Latest</option>
            </Select>
            <Button variant="ghost" onClick={() => { setSearch(''); setStatusFilter(''); setDateFilter(''); setSort('latest'); }}><Archive size={15} style={{marginRight: 5}} /> Reset</Button>
          </div>

          {/* Inbox table/list */}
          <div className="table-wrap" style={{ minHeight: 220 }}>
            {loading ? <Loader label="Loading inquiries..." /> : null}
            {!loading && error ? (
              <EmptyState title="Could not load inquiries" description={error} actionLabel="Retry" onAction={() => loadContacts()} />
            ) : null}
            {!loading && !error && !filteredContacts.length ? (
              <EmptyState title="No inquiries found" description="Contact submissions will appear here once users send messages." actionLabel={null} />
            ) : null}
            {!loading && !error && filteredContacts.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Preview</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact._id} style={{ background: selectedContact?._id === contact._id ? 'rgba(26,138,86,0.07)' : undefined }}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.subject}</td>
                      <td style={{ maxWidth: 180, color: 'var(--muted)', fontSize: 13 }}>{(contact.message || '').slice(0, 48)}{(contact.message || '').length > 48 ? '…' : ''}</td>
                      <td><Badge tone={getStatusTone(contact.status)}>{contact.status}</Badge></td>
                      <td>{formatDate(contact.createdAt)}</td>
                      <td>
                        <div className="form-links">
                          <Button size="sm" variant="primary" onClick={() => openContact(contact)}><MailOpen size={13} style={{marginRight: 4}} /> View</Button>
                          {/* Add onStatusChange and onDelete handlers as needed */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </Card>

        {/* Inquiry preview/detail panel */}
        {selectedContact ? (
          <Card style={{ padding: '1.5rem 1.2rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <MailOpen size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}>Inquiry Details</h3>
            </div>
            <div style={{ marginBottom: 8 }}><strong>Name:</strong> {selectedContact.name}</div>
            <div style={{ marginBottom: 8 }}><strong>Email:</strong> {selectedContact.email}</div>
            <div style={{ marginBottom: 8 }}><strong>Subject:</strong> {selectedContact.subject}</div>
            <div style={{ marginBottom: 8 }}><strong>Message:</strong> <pre className="pre-wrap-text" style={{ background: '#f8fcf9', borderRadius: 10, padding: 10, fontSize: 15 }}>{selectedContact.message}</pre></div>
            <div style={{ marginBottom: 8 }}><strong>Status:</strong> <Badge tone={getStatusTone(selectedContact.status)}>{selectedContact.status}</Badge></div>
            <div style={{ marginBottom: 8 }}><strong>Received:</strong> {formatDate(selectedContact.createdAt)}</div>
            <div className="form-links mt-1" style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Textarea
                label="Reply"
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                rows={3}
              />
              <Button onClick={() => {}} disabled={replying || !replyMessage.trim()} variant="primary">{replying ? 'Sending...' : <><Reply size={15} style={{marginRight: 5}} /> Send Reply</>}</Button>
            </div>
          </Card>
        ) : null}
      </div>

      {/* Optional: Admin support/insight section */}
      <Card className="mt-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Users size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.13rem' }}>Recent Inquiry Activity</h3>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>
          {contacts.length ? (
            <>
              <span>Last inquiry: <b>{contacts[0]?.name}</b> ({formatDate(contacts[0]?.createdAt)})</span>
              <span style={{ marginLeft: 18 }}>Total: <b>{contacts.length}</b></span>
            </>
          ) : 'No recent activity.'}
        </div>
      </Card>
    </>
  );
}
