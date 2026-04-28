import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, ChartColumnBig, Filter, Users, XCircle } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';
import Select from '../../components/ui/Select';
import {
  getDonutStyle,
  getPipelineCounts,
  getRejectionBreakdown,
  getSourceBreakdown,
  groupDailyApplications,
  getRangeMeta
} from '../../utils/overviewAnalytics';
import { OVERVIEW_RANGE_OPTIONS } from '../../utils/applicationMeta';

function percent(value, total) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export default function EmployerOverviewPage() {
  const [state, setState] = useState({
    loading: true,
    jobs: [],
    applications: []
  });
  const [range, setRange] = useState('30d');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const jobsRes = await employerApi.jobs();
      const jobs = jobsRes.data || [];
      const applicantResults = await Promise.allSettled(jobs.map((job) => employerApi.applicants(job._id)));
      const applications = [];

      jobs.forEach((job, index) => {
        const result = applicantResults[index];
        const list = result?.status === 'fulfilled' ? result.value.data?.applications || [] : [];
        list.forEach((application) => {
          applications.push({ ...application, jobTitle: job.title });
        });
      });

      if (!isMounted) return;
      setState({
        loading: false,
        jobs,
        applications
      });
    };

    load().catch(() => {
      if (!isMounted) return;
      setState({ loading: false, jobs: [], applications: [] });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const timeline = useMemo(() => groupDailyApplications(state.applications, range), [state.applications, range]);
  const dailyPipeline = timeline.buckets;
  const rangeMeta = useMemo(() => getRangeMeta(range), [range]);
  const pipelineCounts = useMemo(() => getPipelineCounts(state.applications, range), [state.applications, range]);
  const sources = useMemo(() => getSourceBreakdown(state.applications, range), [state.applications, range]);
  const rejectionReasons = useMemo(() => getRejectionBreakdown(state.applications, range), [state.applications, range]);

  const conversionStages = [
    { label: 'Applied', value: pipelineCounts.applied },
    { label: 'Reviewed', value: pipelineCounts.reviewed },
    { label: 'Shortlisted', value: pipelineCounts.shortlisted },
    { label: 'Interview', value: pipelineCounts.interview },
    { label: 'Hired', value: pipelineCounts.hired },
    { label: 'Rejected', value: pipelineCounts.rejected }
  ];

  const maxVolume = Math.max(1, ...dailyPipeline.map((item) => Math.max(item.applied, item.shortlisted)));
  const maxPipeline = Math.max(1, ...dailyPipeline.map((item) => item.reviewed + item.shortlisted + item.interview + item.hired + item.rejected || item.applied));
  const maxReason = Math.max(1, ...rejectionReasons.map((item) => item.value), 1);
  const sourceTotal = sources.reduce((sum, item) => sum + item.value, 0);

  if (state.loading) return <Loader label="Loading employer overview..." />;

  return (
    <>
      <Seo title="Employer Overview | Hirexo" description="Track hiring pipeline, conversions, and candidate sources." />
      <DashboardHeader
        className="employer-workspace-header"
        title="Overview"
        description="Hiring pipeline, candidate flow, conversion rates, source mix, and rejection insights in one place."
        actions={(
          <>
            <Button as={Link} to="/employer/dashboard" size="sm" variant="secondary">
              <ChartColumnBig size={16} />
              Dashboard
            </Button>
            <Button as={Link} to="/employer/jobs" size="sm" variant="ghost">
              <BriefcaseBusiness size={16} />
              Manage Jobs
            </Button>
          </>
        )}
      />

      <div className="overview-metric-strip">
        <article className="overview-metric-card">
          <small>Total applications</small>
          <strong>{pipelineCounts.applied}</strong>
          <span>Across {state.jobs.length} job postings</span>
        </article>
        <article className="overview-metric-card">
          <small>Review rate</small>
          <strong>{percent(pipelineCounts.reviewed, pipelineCounts.applied)}</strong>
          <span>{pipelineCounts.reviewed} candidates reviewed</span>
        </article>
        <article className="overview-metric-card">
          <small>Interview rate</small>
          <strong>{percent(pipelineCounts.interview, pipelineCounts.applied)}</strong>
          <span>{pipelineCounts.interview} moved to interview</span>
        </article>
        <article className="overview-metric-card">
          <small>Hire rate</small>
          <strong>{percent(pipelineCounts.hired, pipelineCounts.applied)}</strong>
          <span>{pipelineCounts.hired} converted to hired</span>
        </article>
        <article className="overview-metric-card">
          <small>Top source</small>
          <strong>{sources[0]?.label || 'No data'}</strong>
          <span>{sources[0]?.value || 0} applications</span>
        </article>
      </div>

      <section className="overview-grid mt-1">
        <Card className="overview-card overview-card-wide">
          <div className="overview-card-head">
            <div>
              <p className="section-eyebrow">Overview</p>
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
            <span className="tone-shortlisted">Hired {pipelineCounts.hired}</span>
            <span className="tone-rejected">Rejected {pipelineCounts.rejected}</span>
          </div>
          <div className={`overview-pipeline-chart ${timeline.granularity === 'month' ? 'is-monthly' : ''}`} role="img" aria-label={`Hiring pipeline for ${rangeMeta.label}`}>
            {dailyPipeline.map((item) => {
              const total = item.reviewed + item.shortlisted + item.interview + item.hired + item.rejected;
              const reviewHeight = total ? `${(item.reviewed / maxPipeline) * 100}%` : '0%';
              const shortlistHeight = total ? `${(item.shortlisted / maxPipeline) * 100}%` : '0%';
              const interviewHeight = total ? `${(item.interview / maxPipeline) * 100}%` : '0%';
              const hiredHeight = total ? `${(item.hired / maxPipeline) * 100}%` : '0%';
              const rejectHeight = total ? `${(item.rejected / maxPipeline) * 100}%` : '0%';

              return (
                <div key={item.key} className="overview-pipeline-day">
                  <div className="overview-pipeline-stack">
                    <span className="segment-reviewed" style={{ height: reviewHeight }} />
                    <span className="segment-shortlisted" style={{ height: shortlistHeight }} />
                    <span className="segment-interview" style={{ height: interviewHeight }} />
                    <span className="segment-hired" style={{ height: hiredHeight }} />
                    <span className="segment-rejected" style={{ height: rejectHeight }} />
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
              <p className="section-eyebrow">Demand</p>
              <h3>Candidate volume</h3>
            </div>
            <Badge tone="success">{rangeMeta.label}</Badge>
          </div>
          <div className="overview-legend">
            <span className="tone-applied">Applied {pipelineCounts.applied}</span>
            <span className="tone-shortlisted">Shortlisted {pipelineCounts.shortlisted}</span>
            <span className="tone-screening">Hired {pipelineCounts.hired}</span>
          </div>
          <div className={`overview-volume-chart ${timeline.granularity === 'month' ? 'is-monthly' : ''}`} role="img" aria-label={`Candidate volume for ${rangeMeta.label}`}>
            {dailyPipeline.map((item) => (
              <div key={item.key} className="overview-volume-day">
                <div className="overview-volume-bars">
                  <span className="bar-applied" style={{ height: `${Math.max(item.applied ? 14 : 4, (item.applied / maxVolume) * 100)}%` }} />
                  <span className="bar-shortlisted" style={{ height: `${Math.max(item.shortlisted ? 12 : 4, (item.shortlisted / maxVolume) * 100)}%` }} />
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
            <Badge tone="neutral">Stage to stage</Badge>
          </div>
          <div className="overview-conversion-list">
            {conversionStages.map((stage, index) => {
              const previous = index === 0 ? stage.value : conversionStages[index - 1].value;
              const width = `${Math.max(stage.value ? 18 : 8, (stage.value / Math.max(1, pipelineCounts.applied)) * 100)}%`;
              return (
                <div key={stage.label} className="overview-conversion-row">
                  <div className="overview-conversion-label">
                    <strong>{stage.label}</strong>
                    <span>{stage.value}</span>
                  </div>
                  <div className="overview-conversion-track">
                    <span style={{ width }} />
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
              <p className="section-eyebrow">Quality insights</p>
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
                <strong>No rejection reasons yet</strong>
                <p>When you reject a candidate, add a short reason so this overview can show why applicants are dropping off.</p>
              </div>
            </div>
          )}
        </Card>
      </section>

      <Card className="overview-note-card mt-1">
        <div className="overview-note-copy">
          <Filter size={18} />
          <div>
            <strong>How this works</strong>
            <p>`Candidate source` defaults to `Hirexo Portal`. `Rejection reason` gets saved when you reject a candidate from the applicants page.</p>
          </div>
        </div>
        <Link to={state.jobs[0]?._id ? `/employer/jobs/${state.jobs[0]._id}/applicants` : '/employer/jobs'} className="link-button">
          Open applicant workflow <ArrowRight size={14} />
        </Link>
      </Card>
    </>
  );
}
