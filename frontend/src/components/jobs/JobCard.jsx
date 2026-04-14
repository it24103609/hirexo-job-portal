import { Link } from 'react-router-dom';
import { MapPin, BriefcaseBusiness, BadgeIndianRupee, ArrowRight, Clock3 } from 'lucide-react';
import Badge from '../ui/Badge';

function getLabel(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.name || value.slug || fallback;
}

function formatSalary(job) {
  if (job.salary) return job.salary;
  if (job.salaryMin && job.salaryMax) {
    return `₹${Number(job.salaryMin).toLocaleString()} - ₹${Number(job.salaryMax).toLocaleString()}`;
  }
  return 'Competitive';
}

function getInitials(value = '') {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'HX';
}

function getDaysLeft(job) {
  const target = job.expiresAt ? new Date(job.expiresAt) : null;
  if (!target || Number.isNaN(target.getTime())) return 25;

  const diffMs = target.getTime() - Date.now();
  const diff = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return diff;
}

export default function JobCard({ job, compact = false, variant = 'default' }) {
  const slug = job.slug || job._id;
  const jobTypeLabel = getLabel(job.jobType, job.status || 'Open');
  const locationLabel = getLabel(job.location, 'Remote / Hybrid');
  const experienceLabel = getLabel(job.experienceLevel, 'Mid-Senior');
  const imageUrl = job.image?.url || '';
  const isHome = variant === 'home';

  if (isHome) {
    return (
      <article className="job-card job-card-home">
        <div className="job-home-top">
          <span className="job-home-days"><Clock3 size={14} /> {getDaysLeft(job)} days left</span>
          <Badge tone="success">{jobTypeLabel}</Badge>
        </div>

        <div className="job-home-logo" aria-hidden="true">
          {imageUrl ? <img src={imageUrl} alt={job.image?.alt || job.title} loading="lazy" /> : <span>{getInitials(job.companyName)}</span>}
        </div>

        <p className="job-home-company">{job.companyName || 'Hirexo Hiring'}</p>
        <h3 className="job-home-title">{job.title}</h3>
        <p className="job-home-location"><MapPin size={14} /> {locationLabel}</p>

        <Link className="job-home-apply" to={`/jobs/${slug}`}>
          Apply Now
        </Link>
      </article>
    );
  }

  return (
    <article className={`job-card ${compact ? 'job-card-compact' : ''}`}>
      {imageUrl ? (
        <div className="job-card-image">
          <img src={imageUrl} alt={job.image?.alt || job.title} loading="lazy" />
        </div>
      ) : null}
      <div className="job-card-top">
        <div>
          <h3>{job.title}</h3>
          <p className="job-company">{job.companyName}</p>
        </div>
        <Badge tone={job.reviewStatus === 'approved' ? 'success' : 'neutral'}>
          {jobTypeLabel}
        </Badge>
      </div>

      <p className="job-description">{job.description || 'High-impact role with strong growth potential.'}</p>

      <div className="job-meta-grid">
        <span><MapPin size={16} /> {locationLabel}</span>
        <span><BriefcaseBusiness size={16} /> {experienceLabel}</span>
        <span><BadgeIndianRupee size={16} /> {formatSalary(job)}</span>
      </div>

      <div className="job-card-actions">
        <div className="tag-row">
          {(job.skills || []).slice(0, 3).map((skill) => <Badge key={skill}>{skill}</Badge>)}
        </div>
        <Link className="link-button" to={`/jobs/${slug}`}>
          View details <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
