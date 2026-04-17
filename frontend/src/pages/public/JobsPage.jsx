import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { jobsApi } from '../../services/jobs.api';
import { siteContent } from '../../data/siteContent';
import './JobsPage.css';

const defaultFilters = { keyword: '', category: '', location: '', jobType: '' };

const quickCategories = [
  { label: 'Leadership', tag: 'leadership' },
  { label: 'Design', tag: 'design' },
  { label: 'Product Management', tag: 'product' },
  { label: 'Engineering', tag: 'engineering' }
];

export default function JobsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

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
  const featuredJob = useMemo(() => jobs[0], [jobs]);
  const regularJobs = useMemo(() => jobs.slice(1), [jobs]);
  
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

  const handleQuickSearch = (tag) => {
    setFilters((current) => ({ ...current, category: tag }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((current) => ({
      ...current,
      keyword: searchInput,
      location: locationInput
    }));
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setLocationInput('');
    setFilters(defaultFilters);
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    if (window.innerWidth <= 768) {
      setMobileFiltersOpen(false);
    }
  };

  return (
    <>
      <Seo title="Find Jobs | Hirexo" description="Explore top recruitment opportunities with premium companies and consulting firms." />
      
      <section className="jobs-hero-shell">
        <div className="jobs-hero-ambient jobs-hero-ambient-a" aria-hidden="true" />
        <div className="jobs-hero-ambient jobs-hero-ambient-b" aria-hidden="true" />
        
        <div className="shell">
          <div className="jobs-hero-content">
            <p className="jobs-eyebrow">Opportunities</p>
            <h1>Find your next opportunity</h1>
            <p className="jobs-subtitle">Discover roles that match your skills and career ambitions. Curated positions from leading companies.</p>

            <form className="jobs-search-bar" onSubmit={handleSearch}>
              <div className="jobs-search-input-group">
                <span className="jobs-search-icon"><Search size={18} /></span>
                <input
                  type="text"
                  placeholder="Job title, keyword..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="jobs-search-input"
                />
              </div>
              <div className="jobs-search-input-group">
                <span className="jobs-search-icon"><MapPin size={18} /></span>
                <input
                  type="text"
                  placeholder="Location..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="jobs-search-input"
                />
              </div>
              <button type="submit" className="jobs-search-btn">Search</button>
            </form>

            <div className="jobs-quick-filters">
              {quickCategories.map((category) => (
                <button
                  key={category.tag}
                  type="button"
                  onClick={() => handleQuickSearch(category.tag)}
                  className={`jobs-quick-chip ${filters.category === category.tag ? 'active' : ''}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="jobs-listing-shell">
        <div className="shell jobs-listing-grid">
          <button
            type="button"
            className={`jobs-mobile-filter-btn ${mobileFiltersOpen ? 'is-open' : ''}`}
            onClick={() => setMobileFiltersOpen((value) => !value)}
          >
            {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>

          <aside className={`jobs-sidebar ${mobileFiltersOpen ? 'is-open' : ''}`}>
            <JobFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearSearch}
              categories={filterOptions.categories}
              locations={filterOptions.locations}
              jobTypes={filterOptions.jobTypes}
            />
          </aside>

          <div className="jobs-results-area">
            {loading ? (
              <Loader label="Loading opportunities..." />
            ) : (
              <>
                {featuredJob && (
                  <div className="jobs-featured-wrapper">
                    <JobCard job={featuredJob} variant="featured" />
                  </div>
                )}

                <div className="jobs-list">
                  {regularJobs.length ? (
                    regularJobs.map((job) => (
                      <JobCard key={job._id || job.slug} job={job} variant="list" />
                    ))
                  ) : (
                    <EmptyState
                      title="No opportunities found"
                      description="Try adjusting your search criteria or explore our quick categories."
                    />
                  )}
                </div>

                <Pagination
                  page={page}
                  totalPages={meta.totalPages || 1}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
