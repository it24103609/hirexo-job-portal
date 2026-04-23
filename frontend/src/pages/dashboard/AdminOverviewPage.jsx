import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChartColumnBig, PieChart, ShieldCheck, Users, XCircle } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import { adminApi } from '../../services/admin.api';
import {
  getDonutStyle,
  getPipelineCounts,
  getRejectionBreakdown,
  getSourceBreakdown,
  groupDailyApplications,
  groupRegistrationSeries,
  getRangeMeta
} from '../../utils/overviewAnalytics';
import { OVERVIEW_RANGE_OPTIONS } from '../../utils/applicationMeta';

function percent(value, total) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export default function AdminOverviewPage() {
  const [state, setState] = useState({
    loading: true,
    applications: [],
    dashboard: null,
    reports: { candidateRegistrations: { last30Days: [] } }
  });
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const load = async () => {
      const [dashboardRes, applicationsRes, reportsRes] = await Promise.all([
        adminApi.dashboard(),
        adminApi.applications({ status: 'all' }),
        adminApi.reports()
      ]);

      setState({
        loading: false,
        dashboard: dashboardRes.data || null,
        applications: applicationsRes.data || [],
        reports: reportsRes.data || { candidateRegistrations: { last30Days: [] } }
      });
    };

    load().catch(() => {
      setState({
        loading: false,
        applications: [],
        dashboard: null,
        reports: { candidateRegistrations: { last30Days: [] } }
      });
    });
  }, []);

  const timeline = useMemo(() => groupDailyApplications(state.applications, range), [state.applications, range]);
  const rangeMeta = useMemo(() => getRangeMeta(range), [range]);
  const dailyPipeline = timeline.buckets;
  const pipelineCounts = useMemo(() => getPipelineCounts(state.applications, range), [state.applications, range]);
  const sources = useMemo(() => getSourceBreakdown(state.applications, range), [state.applications, range]);
  const rejectionReasons = useMemo(() => getRejectionBreakdown(state.applications, range), [state.applications, range]);
  const registrationDaily = state.reports?.candidateRegistrations?.last30Days || [];
  const registrationSeries = useMemo(() => groupRegistrationSeries(registrationDaily, range), [registrationDaily, range]);
  const registrationsMap = new Map(registrationSeries.buckets.map((item) => [item.key, Number(item.registrations || 0)]));

  const volumeSeries = dailyPipeline.map((item) => ({ ...item, registrations: registrationsMap.get(item.key) || 0 }));

  const maxVolume = Math.max(1, ...volumeSeries.map((item) => Math.max(item.applied, item.registrations)));
  const maxPipeline = Math.max(1, ...dailyPipeline.map((item) => item.reviewed + item.shortlisted + item.interview + item.rejected || item.applied));
  const maxReason = Math.max(1, ...rejectionReasons.map((item) => item.value), 1);
  const sourceTotal = sources.reduce((sum, item) => sum + item.value, 0);

  const conversionStages = [
    { label: 'Applied', value: pipelineCounts.applied },
    { label: 'Reviewed', value: pipelineCounts.reviewed },
    { label: 'Shortlisted', value: pipelineCounts.shortlisted },
    { label: 'Interview', value: pipelineCounts.interview },
    { label: 'Rejected', value: pipelineCounts.rejected }
  ];

  if (state.loading) return <Loader label="Loading admin overview..." />;

  return (
    <>
      <Seo title="Admin Overview | Hirexo" description="Platform-wide hiring funnel, volume, and rejection analytics." />
      <DashboardHeader
        className="admin-workspace-header"
        title="Overview"
        description="Platform-level hiring pipeline, candidate volume, conversion rates, sources, and rejection analytics."
        actions={(
          <>
            <Button as={Link} to="/admin/dashboard" size="sm" variant="secondary">
              <ChartColumnBig size={16} />
              Dashboard
            </Button>
            <Button as={Link} to="/admin/reports" size="sm" variant="ghost">
              <PieChart size={16} />
              Reports
            </Button>
          </>
        )}
      />

      <div className="overview-metric-strip">
        <article className="overview-metric-card">
          <small>Applications tracked</small>
          <strong>{pipelineCounts.applied}</strong>
          <span>Platform-wide active sample</span>
        </article>
        <article className="overview-metric-card">
          <small>Candidates registered</small>
          <strong>{state.reports?.candidateRegistrations?.total || 0}</strong>
          <span>Total candidate accounts</span>
        </article>
        <article className="overview-metric-card">
          <small>Review conversion</small>
          <strong>{percent(pipelineCounts.reviewed, pipelineCounts.applied)}</strong>
          <span>{pipelineCounts.reviewed} reviewed applications</span>
        </article>
        <article className="overview-metric-card">
          <small>Unread pressure</small>
          <strong>{state.dashboard?.newContacts || 0}</strong>
          <span>New inquiries awaiting action</span>
        </article>
      </div>

      <section className="overview-grid mt-1">
        <Card className="overview-card overview-card-wide">
          <div className="overview-card-head">
            <div>
              <p className="section-eyebrow">Platform overview</p>
              <h3>Hiring pipeline</h3>
            </div>
            <div className="overview-card-tools">
              <Badge tone="neutral">{rangeMeta.label}</Badge>
              <Select value={range} onChange={(e) => setRange(e.target.value)} className="overview-filter-select">
                {OVERVIEW_RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </div>
          </div>
          <div className="overview-legend">
            <span className="tone-screening">Reviewed {pipelineCounts.reviewed}</span>
            <span className="tone-shortlisted">Shortlisted {pipelineCounts.shortlisted}</span>
            <span className="tone-interview">Interviews {pipelineCounts.interview}</span>
            <span className="tone-rejected">Rejected {pipelineCounts.rejected}</span>
          </div>
          <div className={`overview-pipeline-chart ${timeline.granularity === 'month' ? 'is-monthly' : ''}`} role="img" aria-label={`Admin hiring pipeline for ${rangeMeta.label}`}>
            {dailyPipeline.map((item) => {
              const total = item.reviewed + item.shortlisted + item.interview + item.rejected;
              return (
                <div key={item.key} className="overview-pipeline-day">
                  <div className="overview-pipeline-stack">
                    <span className="segment-reviewed" style={{ height: total ? `${(item.reviewed / maxPipeline) * 100}%` : '0%' }} />
                    <span className="segment-shortlisted" style={{ height: total ? `${(item.shortlisted / maxPipeline) * 100}%` : '0%' }} />
                    <span className="segment-interview" style={{ height: total ? `${(item.interview / maxPipeline) * 100}%` : '0%' }} />
                    <span className="segment-rejected" style={{ height: total ? `${(item.rejected / maxPipeline) * 100}%` : '0%' }} />
                  </div>
                  <small>{item.label}</small>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="overview-card">
          <div className="overview-card-head">
            <div>
              <p className="section-eyebrow">Volume</p>
              <h3>Candidate volume</h3>
            </div>
            <Badge tone="success">{rangeMeta.label}</Badge>
          </div>
          <div className="overview-legend">
            <span className="tone-applied">Applications {pipelineCounts.applied}</span>
            <span className="tone-registered">Registrations {registrationDaily.reduce((sum, item) => sum + Number(item.count || 0), 0)}</span>
          </div>
          <div className={`overview-volume-chart ${timeline.granularity === 'month' ? 'is-monthly' : ''}`} role="img" aria-label={`Candidate volume for ${rangeMeta.label}`}>
            {volumeSeries.map((item) => (
              <div key={item.key} className="overview-volume-day">
                <div className="overview-volume-bars">
                  <span className="bar-applied" style={{ height: `${Math.max(item.applied ? 14 : 4, (item.applied / maxVolume) * 100)}%` }} />
                  <span className="bar-registered" style={{ height: `${Math.max(item.registrations ? 12 : 4, (item.registrations / maxVolume) * 100)}%` }} />
                </div>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overview-card">
          <div className="overview-card-head">
            <div>
              <p className="section-eyebrow">Funnel</p>
              <h3>Conversion rates</h3>
            </div>
            <Badge tone="neutral">Across sampled applications</Badge>
          </div>
          <div className="overview-conversion-list">
            {conversionStages.map((stage, index) => {
              const previous = index === 0 ? stage.value : conversionStages[index - 1].value;
              return (
                <div key={stage.label} className="overview-conversion-row">
                  <div className="overview-conversion-label">
                    <strong>{stage.label}</strong>
                    <span>{stage.value}</span>
                  </div>
                  <div className="overview-conversion-track">
                    <span style={{ width: `${Math.max(stage.value ? 18 : 8, (stage.value / Math.max(1, pipelineCounts.applied)) * 100)}%` }} />
                  </div>
                  <small>{percent(stage.value, previous || pipelineCounts.applied)}</small>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="overview-card">
          <div className="overview-card-head">
            <div>
              <p className="section-eyebrow">Attribution</p>
              <h3>Candidate source</h3>
            </div>
            <Badge tone="success">{sourceTotal} total sources</Badge>
          </div>
          <div className="overview-source-layout">
            <div className="overview-donut" style={getDonutStyle(sources)} aria-hidden="true">
              <div>
                <small>Total</small>
                <strong>{sourceTotal}</strong>
              </div>
            </div>
            <div className="overview-source-list">
              {sources.length ? sources.map((item) => (
                <div key={item.label} className="overview-source-item">
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                </div>
              )) : (
                <div className="overview-empty-inline">
                  <Users size={18} />
                  <p>No source data yet.</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="overview-card overview-card-wide">
          <div className="overview-card-head">
            <div>
              <p className="section-eyebrow">Drop-off insight</p>
              <h3>Rejection reasons</h3>
            </div>
            <Badge tone={rejectionReasons.length ? 'neutral' : 'danger'}>
              {rejectionReasons.reduce((sum, item) => sum + item.value, 0)} total
            </Badge>
          </div>
          {rejectionReasons.length ? (
            <div className="overview-reason-list">
              {rejectionReasons.map((item) => (
                <div key={item.label} className="overview-reason-row">
                  <div className="overview-reason-copy">
                    <strong>{item.label}</strong>
                    <span>{item.value} candidates</span>
                  </div>
                  <div className="overview-reason-track">
                    <span style={{ width: `${Math.max(12, (item.value / maxReason) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overview-empty-state">
              <XCircle size={22} />
              <div>
                <strong>No rejection reasons captured yet</strong>
                <p>Employer rejection actions can now save reasons. Once teams start entering them, you’ll see the breakdown here.</p>
              </div>
            </div>
          )}
        </Card>
      </section>

      <Card className="overview-note-card mt-1">
        <div className="overview-note-copy">
          <ShieldCheck size={18} />
          <div>
            <strong>Admin note</strong>
            <p>This overview uses application funnel data plus candidate registration trend data from reports. It’s meant for fast operations, while detailed exports stay in Reports.</p>
          </div>
        </div>
        <Link to="/admin/reports" className="link-button">
          Open detailed reports <ArrowRight size={14} />
        </Link>
      </Card>
    </>
  );
}
