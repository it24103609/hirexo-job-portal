import { useEffect, useState } from 'react';
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

  return (
    <>
      <Seo title="Notifications | Hirexo" description="Track job approvals, application updates, and interview schedules." />
      <DashboardHeader
        title="Notifications"
        description="Job approval alerts, application updates, and interview schedules."
        actions={<Button variant="secondary" onClick={async () => { await notificationsApi.markAllRead(); loadNotifications(); }}>Mark all as read</Button>}
      />

      <Card>
        <p>Unread: <strong>{state.unreadCount}</strong></p>
        {state.notifications.length ? (
          <div className="form-grid">
            {state.notifications.map((item) => (
              <Card key={item._id} className="dashboard-panel">
                <div className="form-links" style={{ justifyContent: 'space-between' }}>
                  <Badge tone={item.isRead ? 'neutral' : 'success'}>{item.type || 'notification'}</Badge>
                  <small>{formatDateTime(item.createdAt)}</small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.message}</p>
                {!item.isRead ? <Button size="sm" variant="secondary" onClick={async () => { await notificationsApi.markRead(item._id); loadNotifications(); }}>Mark read</Button> : null}
              </Card>
            ))}
          </div>
        ) : (
          <p>No notifications yet.</p>
        )}
      </Card>
    </>
  );
}