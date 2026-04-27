import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Code2, MapPin, PenTool, Search, Sparkles, TrendingUp, UsersRound } from 'lucide-react';
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
  { label: 'Leadership', tag: 'leadership', icon: Sparkles },
  { label: 'Design', tag: 'design', icon: PenTool },
  { label: 'Product Management', tag: 'product', icon: UsersRound },
  { label: 'Engineering', tag: 'engineering', icon: Code2 }
];

export default function JobsPage() {
  const [filters, setFilters] = useState(defaultFilters);
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
  };

  return (
    <>
      <Seo title="Find Jobs | Hirexo" description="Explore top recruitment opportunities with premium companies and consulting firms." />
      
      <section className="jobs-hero-shell">
        <div className="jobs-hero-ambient jobs-hero-ambient-a" aria-hidden="true" />
        <div className="jobs-hero-ambient jobs-hero-ambient-b" aria-hidden="true" />
        
        <div className="shell">
          <div className="jobs-hero-content">
            <div className="jobs-hero-visual" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=920&q=85"
                alt=""
              />
              <span className="jobs-float-card jobs-float-stats">
                <strong>10K+</strong>
                <small>Jobs available</small>
                <i />
              </span>
              <span className="jobs-float-card jobs-float-briefcase"><BriefcaseBusiness size={28} /></span>
              <span className="jobs-float-card jobs-float-team"><UsersRound size={28} /></span>
            </div>
            <p className="jobs-eyebrow">Opportunities</p>
            <h1>Find your next <span>opportunity</span></h1>
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
              <button type="submit" className="jobs-search-btn"><Search size={17} /> Search</button>
            </form>

            <div className="jobs-quick-filters">
              {quickCategories.map((category) => {
                const Icon = category.icon;
                return (
                <button
                  key={category.tag}
                  type="button"
                  onClick={() => handleQuickSearch(category.tag)}
                  className={`jobs-quick-chip ${filters.category === category.tag ? 'active' : ''}`}
                >
                  <Icon size={16} /> {category.label}
                </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="jobs-listing-shell">
        <div className="shell jobs-listing-grid">
          <aside className="jobs-sidebar">
            <JobFilters
              filters={filters}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
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
