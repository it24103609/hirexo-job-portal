import { ArrowRight, BriefcaseBusiness, Building2, Crown, Laptop, MapPin, Sliders, X } from 'lucide-react';
import './JobFilters.css';

function getOptionLabel(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.name || item.slug || '';
}

function getOptionValue(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item._id || item.slug || item.name || '';
}

export default function JobFilters({ filters, onChange, onClear, categories = [], locations = [], jobTypes = [] }) {
  return (
    <div className="jobs-filters-sidebar">
      <div className="jobs-filters-header">
        <h3><Sliders size={18} /> Refine Search</h3>
        <button className="jobs-filters-clear" onClick={onClear} title="Clear all filters">
          <X size={16} />
        </button>
      </div>

      <div className="jobs-filters-groups">
        {/* Industry / Category Filter */}
        <div className="jobs-filter-group">
          <label className="jobs-filter-label"><Building2 size={14} /> Industry</label>
          <div className="jobs-filter-options">
            <select
              value={filters.category || ''}
              onChange={(e) => onChange('category', e.target.value)}
              className="jobs-filter-select"
            >
              <option value="">All industries</option>
              {categories.map((item) => (
                <option key={getOptionValue(item)} value={getOptionValue(item)}>
                  {getOptionLabel(item)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Filter */}
        <div className="jobs-filter-group">
          <label className="jobs-filter-label"><MapPin size={14} /> Location</label>
          <div className="jobs-filter-options">
            <select
              value={filters.location || ''}
              onChange={(e) => onChange('location', e.target.value)}
              className="jobs-filter-select"
            >
              <option value="">All locations</option>
              {locations.map((item) => (
                <option key={getOptionValue(item)} value={getOptionValue(item)}>
                  {getOptionLabel(item)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Work Mode / Job Type Filter */}
        <div className="jobs-filter-group">
          <label className="jobs-filter-label"><Laptop size={14} /> Work Mode</label>
          <div className="jobs-filter-options">
            <select
              value={filters.jobType || ''}
              onChange={(e) => onChange('jobType', e.target.value)}
              className="jobs-filter-select"
            >
              <option value="">All types</option>
              {jobTypes.map((item) => (
                <option key={getOptionValue(item)} value={getOptionValue(item)}>
                  {getOptionLabel(item)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Selection Card */}
      <div className="jobs-filters-featured">
        <div className="premium-role-art" aria-hidden="true">
          <span className="premium-chair"><BriefcaseBusiness size={34} /></span>
          <span className="premium-crown"><Crown size={18} /></span>
        </div>
        <h4>Premium Roles</h4>
        <p>Explore hand-picked roles and personalized positions from top-tier companies.</p>
        <button type="button" className="premium-role-btn">
          Explore Premium <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
