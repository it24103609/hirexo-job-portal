import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/ui/EmptyState';
import { candidateApi } from '../../services/candidate.api';
import Loader from '../../components/ui/Loader';

export default function CandidateSavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidateApi.savedJobs().then((res) => setJobs(res.data || [])).catch(() => setJobs([])).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo title="Saved Jobs | Hirexo" description="Review and manage your saved jobs." />
      <DashboardHeader title="Saved Jobs" description="Jobs you saved for later." />
      {loading ? <Loader label="Loading saved jobs..." /> : jobs.length ? <div className="grid-2"><>{jobs.map((job) => <JobCard key={job._id || job.slug} job={job} compact />)}</></div> : <EmptyState title="No saved jobs" description="Save interesting jobs while browsing the listings." actionLabel="Browse jobs" actionTo="/jobs" />}
    </>
  );
}
