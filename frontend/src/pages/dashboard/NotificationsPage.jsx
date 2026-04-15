import { useEffect, useState } from 'react';
import { Bell, CalendarClock, Sparkles } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { notificationsApi } from '../../services/notifications.api';
import { formatDateTime } from '../../utils/formatters';

export default function NotificationsPage() {
  const [state, setState] = useState({ loading: true, notifications: [], unreadCount: 0 });
  const [filter, setFilter] = useState('all');

  const loadNotifications = async () => {
    const res = await notificationsApi.mine({ limit: 100 });
    setState({
      loading: false,
      notifications: res.data || [],
      unreadCount: res.meta?.unreadCount || 0
    });
  };

  useEffect(() => {
    loadNotifications().catch(() => setState({ loading: false, notifications: [], unreadCount: 0 }));
  }, []);

  if (state.loading) return <Loader label="Loading notifications..." />;

  const normalized = state.notifications.map((item) => {
    const source = `${item.type || ''} ${item.title || ''} ${item.message || ''}`.toLowerCase();
    const category = source.includes('interview') ? 'interviews' : 'updates';
    return { ...item, category };
  });

  const filteredNotifications = normalized.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !item.isRead;
    return item.category === filter;
  });

  return (
    <>
      <Seo title="Notifications | Hirexo" description="Track job approvals, application updates, and interview schedules." />
      <DashboardHeader
        title="Notifications"
        description="Job approval alerts, application updates, and interview schedules."
        actions={<Button variant="secondary" onClick={async () => { await notificationsApi.markAllRead(); loadNotifications(); }}>Mark all as read</Button>}
      />

      <Card className="candidate-notification-wrap">
        <div className="candidate-notification-toolbar">
          <p>Unread: <strong>{state.unreadCount}</strong></p>
          <div className="candidate-filter-tabs" role="tablist" aria-label="Notification filters">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'interviews', label: 'Interviews' },
              { key: 'updates', label: 'Updates' }
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={`candidate-filter-tab ${filter === item.key ? 'active' : ''}`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {filteredNotifications.length ? (
          <div className="candidate-notification-list">
            {filteredNotifications.map((item) => (
              <article key={item._id} className={`candidate-notification-card ${item.isRead ? '' : 'is-unread'}`}>
                <div className="candidate-notification-head">
                  <div className="candidate-notification-tags">
                    <Badge tone={item.isRead ? 'neutral' : 'success'}>{item.type || 'notification'}</Badge>
                    <Badge tone="neutral">
                      {item.category === 'interviews' ? <CalendarClock size={12} /> : <Sparkles size={12} />} {item.category}
                    </Badge>
                  </div>
                  <small>{formatDateTime(item.createdAt)}</small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.message}</p>
                {!item.isRead ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await notificationsApi.markRead(item._id);
                      loadNotifications();
                    }}
                  >
                    Mark read
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="candidate-empty-strong">
            <Bell size={24} />
            <h3>No notifications in this view</h3>
            <p>Try another filter or check back later for updates.</p>
          </div>
        )}
      </Card>
    </>
  );
}