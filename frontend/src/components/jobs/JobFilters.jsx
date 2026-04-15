import { Sliders, X } from 'lucide-react';
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
          <label className="jobs-filter-label">Industry</label>
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
          <label className="jobs-filter-label">Location</label>
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
          <label className="jobs-filter-label">Work Mode</label>
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
        <div className="jobs-filters-featured-icon">✨</div>
        <h4>Premium Roles</h4>
        <p>Explore vetted leadership and specialized positions from top-tier companies.</p>
      </div>
    </div>
  );
}
