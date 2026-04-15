import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Sparkles, ArrowRight } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import JobCard from '../../components/jobs/JobCard';
import Card from '../../components/ui/Card';
import { candidateApi } from '../../services/candidate.api';
import { jobsApi } from '../../services/jobs.api';
import Loader from '../../components/ui/Loader';

export default function CandidateSavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([candidateApi.savedJobs(), jobsApi.featured()])
      .then(([savedRes, featuredRes]) => {
        setJobs(savedRes.status === 'fulfilled' ? savedRes.value.data || [] : []);
        setSuggestedJobs(featuredRes.status === 'fulfilled' ? featuredRes.value.data || [] : []);
      })
      .catch(() => {
        setJobs([]);
        setSuggestedJobs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo title="Saved Jobs | Hirexo" description="Review and manage your saved jobs." />
      <DashboardHeader title="Saved Jobs" description="Your curated list of opportunities to revisit and apply at the right time." />

      {loading ? <Loader label="Loading saved jobs..." /> : (
        <>
          {jobs.length ? (
            <section className="candidate-saved-list">
              {jobs.map((job) => <JobCard key={job._id || job.slug} job={job} variant="list" />)}
            </section>
          ) : (
            <Card className="candidate-empty-strong">
              <BookmarkCheck size={26} />
              <h3>No saved jobs yet</h3>
              <p>Save interesting roles while browsing so you can compare and apply later.</p>
              <Link className="btn btn-primary" to="/jobs">Explore jobs</Link>
            </Card>
          )}

          <Card className="mt-1 candidate-recommend-panel">
            <div className="panel-head">
              <h3><Sparkles size={16} /> Suggested roles for you</h3>
              <Link to="/jobs" className="link-button">Browse all <ArrowRight size={14} /></Link>
            </div>
            {suggestedJobs.length ? (
              <div className="candidate-recommended-grid">
                {suggestedJobs.slice(0, 4).map((job) => (
                  <article key={job._id || job.slug} className="candidate-recommended-item">
                    <div>
                      <h4>{job.title}</h4>
                      <p>{job.companyName || 'Hirexo partner'} · {job.location?.name || job.location || 'Remote/Hybrid'}</p>
                    </div>
                    <Link className="btn btn-secondary btn-sm" to={`/jobs/${job.slug || job._id}`}>View</Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="m-0">Suggested opportunities will appear here.</p>
            )}
          </Card>
        </>
      )}
    </>
  );
}
