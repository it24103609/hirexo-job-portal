import { useEffect, useMemo, useState } from 'react';
import Seo from '../../components/ui/Seo';
import SectionHeader from '../../components/ui/SectionHeader';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { jobsApi } from '../../services/jobs.api';
import { siteContent } from '../../data/siteContent';

const defaultFilters = { keyword: '', category: '', location: '', jobType: '' };

export default function JobsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  useEffect(() => {
    setLoading(true);
    jobsApi.list({ ...filters, page, limit: 9 })
      .then((res) => {
        const list = res.data?.length ? res.data : siteContent.mockJobs;
        setJobs(list);
        setMeta(res.meta || { totalPages: 1 });
      })
      .catch(() => {
        setJobs(siteContent.mockJobs);
        setMeta({ totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  const visibleJobs = useMemo(() => jobs, [jobs]);
  const filterOptions = useMemo(() => {
    const unique = (items, selector) => {
      const seen = new Set();
      return items.reduce((accumulator, item) => {
        const value = selector(item);
        const key = typeof value === 'string' ? value : value?._id || value?.slug || value?.name;
        if (!key || seen.has(key)) return accumulator;
        seen.add(key);
        accumulator.push(value);
        return accumulator;
      }, []);
    };

    return {
      categories: unique(jobs, (job) => job.category),
      locations: unique(jobs, (job) => job.location),
      jobTypes: unique(jobs, (job) => job.jobType)
    };
  }, [jobs]);

  return (
    <>
      <Seo title="Jobs | Hirexo" description="Search and filter open jobs across industries and locations." />
      <section className="section-block">
        <div className="shell">
          <SectionHeader eyebrow="Jobs" title="Explore active job listings" description="Search by keyword, industry, location, or job type." />
          <JobFilters
            filters={filters}
            onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
            onClear={() => { setFilters(defaultFilters); setPage(1); }}
            categories={filterOptions.categories}
            locations={filterOptions.locations}
            jobTypes={filterOptions.jobTypes}
          />
          {loading ? <Loader label="Loading jobs..." /> : (
            <>
              <div className="grid-3 mt-1">
                {visibleJobs.length ? visibleJobs.map((job) => <JobCard key={job._id || job.slug} job={job} />) : <EmptyState title="No jobs found" description="Try adjusting filters or check back later." />}
              </div>
              <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
