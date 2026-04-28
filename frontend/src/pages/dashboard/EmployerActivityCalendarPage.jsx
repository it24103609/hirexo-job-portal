import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';
import { formatDateTime } from '../../utils/formatters';

function groupEvents(events = []) {
  const grouped = events.reduce((accumulator, event) => {
    const key = event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 10) : 'unscheduled';
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(event);
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([key, items]) => ({
    key,
    label: key === 'unscheduled' ? 'Unscheduled' : new Date(key).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    items: items.sort((left, right) => new Date(left.startsAt || 0) - new Date(right.startsAt || 0))
  }));
}

function toneFor(event) {
  if (['approved', 'done', 'accepted', 'hired'].includes(String(event.status || '').toLowerCase())) return 'success';
  if (['rejected', 'cancelled', 'declined'].includes(String(event.status || '').toLowerCase())) return 'danger';
  if (['pending', 'upcoming'].includes(String(event.status || '').toLowerCase())) return 'warning';
  return 'neutral';
}

export default function EmployerActivityCalendarPage() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState({ events: [], summary: {} });

  useEffect(() => {
    employerApi.activityCalendar()
      .then((res) => setPayload(res.data || { events: [], summary: {} }))
      .catch((error) => {
        toast.error(error.message || 'Failed to load hiring activity calendar');
        setPayload({ events: [], summary: {} });
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => groupEvents(payload.events || []), [payload.events]);

  if (loading) return <Loader label="Loading hiring calendar..." />;

  return (
    <>
      <Seo title="Hiring Activity Calendar | Hirexo" description="Track interviews, offers, applications, approvals, and deadlines in one hiring calendar." />
      <DashboardHeader title="Hiring Activity Calendar" description="See your hiring motion across interviews, offers, applications, approvals, and role deadlines." />

      <div className="candidate-stat-grid mb-1">
        <article className="candidate-stat-card"><div><p>Total events</p><strong>{payload.summary?.totalEvents || 0}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Upcoming interviews</p><strong>{payload.summary?.interviewsUpcoming || 0}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Pending approvals</p><strong>{payload.summary?.approvalsPending || 0}</strong></div></article>
        <article className="candidate-stat-card"><div><p>Sync mode</p><strong>{payload.summary?.syncMode || 'daily'}</strong></div></article>
      </div>

      <Card>
        <div className="panel-head">
          <div>
            <p className="section-eyebrow">Timeline</p>
            <h3>Activity by date</h3>
          </div>
          <Badge>{(payload.events || []).length} items</Badge>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {grouped.length ? grouped.map((group) => (
            <section key={group.key} style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
              <strong>{group.label}</strong>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {group.items.map((event, index) => (
                  <article key={`${group.key}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                    <div>
                      <div><strong>{event.title}</strong></div>
                      <small>{event.startsAt ? formatDateTime(event.startsAt) : 'No date assigned'}{event.meta?.jobTitle ? ` · ${event.meta.jobTitle}` : ''}</small>
                    </div>
                    <Badge tone={toneFor(event)}>{event.type.replace(/_/g, ' ')}</Badge>
                  </article>
                ))}
              </div>
            </section>
          )) : <p className="m-0">No hiring events yet. Seed data or start using approvals, interviews, and offers to populate the calendar.</p>}
        </div>
      </Card>
    </>
  );
}
