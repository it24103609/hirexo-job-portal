import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CalendarClock, Sparkles, Mail, BriefcaseBusiness, ShieldCheck, HandCoins } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import { notificationsApi } from '../../services/notifications.api';
import { formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    notifications: [],
    unreadCount: 0,
    unreadByCategory: {},
    preferences: {
      emailEnabled: true,
      digestFrequency: 'instant',
      categories: {
        applications: true,
        interviews: true,
        offers: true,
        approvals: true,
        messages: true,
        system: true
      }
    }
  });
  const [filter, setFilter] = useState('all');

  const loadNotifications = async () => {
    try {
      const res = await notificationsApi.mine({ limit: 100 });
      setState({
        loading: false,
        notifications: res.data || [],
        unreadCount: res.meta?.unreadCount || 0,
        unreadByCategory: res.meta?.unreadByCategory || {},
        preferences: res.meta?.preferences || state.preferences
      });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, notifications: [], unreadCount: 0, unreadByCategory: {} }));
      toast.error(error.message || 'Failed to load notifications');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (state.loading) return <Loader label="Loading notifications..." />;

  const iconByCategory = {
    interviews: CalendarClock,
    applications: BriefcaseBusiness,
    approvals: ShieldCheck,
    offers: HandCoins,
    messages: Mail,
    system: Sparkles
  };

  const normalized = state.notifications.map((item) => ({ ...item, category: item.category || 'system', priority: item.priority || 'low' }));

  const filteredNotifications = normalized.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !item.isRead;
    if (filter === 'high_priority') return item.priority === 'high';
    return item.category === filter;
  });

  const highPriorityCount = useMemo(
    () => normalized.filter((item) => item.priority === 'high' && !item.isRead).length,
    [normalized]
  );

  return (
    <>
      <Seo title="Notifications | Hirexo" description="Track job approvals, application updates, and interview schedules." />
      <DashboardHeader
        title="Notifications"
        description="Job approval alerts, application updates, and interview schedules."
        actions={(
          <div className="dashboard-actions">
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  const res = await notificationsApi.processReminders();
                  toast.success(`${res.data?.created || 0} reminder notifications processed`);
                  await loadNotifications();
                } catch (error) {
                  toast.error(error.message || 'Failed to process reminders');
                }
              }}
            >
              Run reminders
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await notificationsApi.markAllRead();
                  await loadNotifications();
                } catch (error) {
                  toast.error(error.message || 'Failed to mark notifications as read');
                }
              }}
            >
              Mark all as read
            </Button>
          </div>
        )}
      />

      <Card className="candidate-notification-wrap">
        <div className="candidate-notification-toolbar">
          <p>Unread: <strong>{state.unreadCount}</strong></p>
          <div className="candidate-filter-tabs" role="tablist" aria-label="Notification filters">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: `Unread (${state.unreadCount})` },
              { key: 'high_priority', label: `Priority (${highPriorityCount})` },
              { key: 'interviews', label: `Interviews (${state.unreadByCategory.interviews || 0})` },
              { key: 'applications', label: `Applications (${state.unreadByCategory.applications || 0})` },
              { key: 'offers', label: `Offers (${state.unreadByCategory.offers || 0})` },
              { key: 'approvals', label: `Approvals (${state.unreadByCategory.approvals || 0})` },
              { key: 'messages', label: `Messages (${state.unreadByCategory.messages || 0})` }
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

        <div className="grid-2" style={{ marginBottom: 16 }}>
          <Card>
            <div className="panel-head">
              <div>
                <p className="section-eyebrow">Preferences</p>
                <h3>Notification settings</h3>
              </div>
            </div>
            <div className="form-grid">
              <label className="field">
                <span className="field-label">Email notifications</span>
                <input
                  type="checkbox"
                  checked={Boolean(state.preferences?.emailEnabled)}
                  onChange={async (event) => {
                    const next = {
                      ...state.preferences,
                      emailEnabled: event.target.checked
                    };
                    setState((current) => ({ ...current, preferences: next }));
                    await notificationsApi.updatePreferences(next);
                    toast.success('Preferences updated');
                  }}
                />
              </label>
              <Select
                label="Digest frequency"
                value={state.preferences?.digestFrequency || 'instant'}
                onChange={async (event) => {
                  const next = {
                    ...state.preferences,
                    digestFrequency: event.target.value
                  };
                  setState((current) => ({ ...current, preferences: next }));
                  await notificationsApi.updatePreferences(next);
                  toast.success('Preferences updated');
                }}
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </Select>
            </div>
          </Card>

          <Card>
            <div className="panel-head">
              <div>
                <p className="section-eyebrow">Unread by type</p>
                <h3>Work queue</h3>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {['applications', 'interviews', 'offers', 'approvals', 'messages', 'system'].map((category) => (
                <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ textTransform: 'capitalize' }}>{category.replace(/_/g, ' ')}</span>
                  <Badge tone={(state.unreadByCategory[category] || 0) > 0 ? 'warning' : 'neutral'}>{state.unreadByCategory[category] || 0}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {filteredNotifications.length ? (
          <div className="candidate-notification-list">
            {filteredNotifications.map((item) => (
              <article key={item._id} className={`candidate-notification-card ${item.isRead ? '' : 'is-unread'}`}>
                <div className="candidate-notification-head">
                  <div className="candidate-notification-tags">
                    <Badge tone={item.isRead ? 'neutral' : 'success'}>{item.type || 'notification'}</Badge>
                    <Badge tone="neutral">
                      {(() => {
                        const Icon = iconByCategory[item.category] || Sparkles;
                        return <Icon size={12} />;
                      })()} {item.category}
                    </Badge>
                    <Badge tone={item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'neutral'}>{item.priority}</Badge>
                  </div>
                  <small>{formatDateTime(item.createdAt)}</small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.message}</p>
                <div className="dashboard-actions">
                  {!item.isRead ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await notificationsApi.markRead(item._id);
                          await loadNotifications();
                        } catch (error) {
                          toast.error(error.message || 'Failed to mark notification as read');
                        }
                      }}
                    >
                      Mark read
                    </Button>
                  ) : null}
                  {item.action?.to ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        navigate(item.action.to);
                      }}
                    >
                      {item.action.label || 'Open'}
                    </Button>
                  ) : null}
                </div>
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
