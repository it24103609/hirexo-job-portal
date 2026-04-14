import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

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
    <aside className="filters-panel card">
      <div className="panel-head">
        <h3>Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>
      </div>
      <div className="filters-grid">
        <Input label="Keyword" value={filters.keyword} onChange={(e) => onChange('keyword', e.target.value)} placeholder="Search jobs" />
        <Select label="Category" value={filters.category} onChange={(e) => onChange('category', e.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={getOptionValue(item)} value={getOptionValue(item)}>{getOptionLabel(item)}</option>)}
        </Select>
        <Select label="Location" value={filters.location} onChange={(e) => onChange('location', e.target.value)}>
          <option value="">All locations</option>
          {locations.map((item) => <option key={getOptionValue(item)} value={getOptionValue(item)}>{getOptionLabel(item)}</option>)}
        </Select>
        <Select label="Job type" value={filters.jobType} onChange={(e) => onChange('jobType', e.target.value)}>
          <option value="">All types</option>
          {jobTypes.map((item) => <option key={getOptionValue(item)} value={getOptionValue(item)}>{getOptionLabel(item)}</option>)}
        </Select>
      </div>
    </aside>
  );
}
