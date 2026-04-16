import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BriefcaseBusiness, BadgeIndianRupee, ArrowRight, Clock3, Heart, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { candidateApi } from '../../services/candidate.api';
import './JobCard.css';

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

export default function JobCard({ job, variant = 'default' }) {
  const { isAuthenticated, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const slug = job.slug || job._id;
  const jobTypeLabel = getLabel(job.jobType, job.status || 'Open');
  const locationLabel = getLabel(job.location, 'Remote / Hybrid');
  const experienceLabel = getLabel(job.experienceLevel, 'Mid-Senior');
  const imageUrl = job.image?.url || '';

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      toast.info('Please login as a candidate to save jobs.');
      return;
    }

    if (user?.role !== 'candidate') {
      toast.info('Only candidate accounts can save jobs.');
      return;
    }

    if (!job?._id) {
      toast.error('Unable to save this job right now.');
      return;
    }

    if (isSaved) {
      toast.info('This job is already saved.');
      return;
    }

    setIsSaving(true);
    try {
      await candidateApi.saveJob(job._id);
      setIsSaved(true);
      toast.success('Job saved successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  // Home variant (existing small card)
  if (variant === 'home') {
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

  // Featured variant (prominent list card)
  if (variant === 'featured') {
    return (
      <article className="job-card-featured">
        <div className="job-featured-badge">Featured Opportunity</div>
        
        <div className="job-featured-header">
          <div className="job-featured-logo" aria-hidden="true">
            {imageUrl ? (
              <img src={imageUrl} alt={job.image?.alt || job.title} loading="lazy" />
            ) : (
              <span>{getInitials(job.companyName)}</span>
            )}
          </div>
          
          <div className="job-featured-meta">
            <div className="job-featured-tags">
              <Badge tone="success">{jobTypeLabel}</Badge>
              {job.skills && job.skills.slice(0, 2).map((skill) => <span key={skill} className="job-featured-skill-tag">{skill}</span>)}
            </div>
            <h3>{job.title}</h3>
            <p className="job-featured-company">{job.companyName}</p>
          </div>
        </div>

        <p className="job-featured-description">{job.description || 'High-impact leadership role with strategic oversight and team development opportunities.'}</p>

        <div className="job-featured-details">
          <span><MapPin size={16} /> {locationLabel}</span>
          <span><BriefcaseBusiness size={16} /> {experienceLabel}</span>
          <span><BadgeIndianRupee size={16} /> {formatSalary(job)}</span>
        </div>

        <div className="job-featured-actions">
          <button
            className="job-featured-btn job-featured-btn-secondary"
            onClick={handleSaveJob}
            disabled={isSaving || isSaved}
            type="button"
          >
            <Heart size={16} /> {isSaved ? 'Saved' : (isSaving ? 'Saving...' : 'Save')}
          </button>
          <button className="job-featured-btn job-featured-btn-secondary">
            <Download size={16} /> Request Brief
          </button>
          <Link to={`/jobs/${slug}`} className="job-featured-btn job-featured-btn-primary">
            Apply Now <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    );
  }

  // List variant (new horizontal card)
  if (variant === 'list') {
    return (
      <article className="job-card-list">
        <div className="job-list-logo" aria-hidden="true">
          {imageUrl ? (
            <img src={imageUrl} alt={job.image?.alt || job.title} loading="lazy" />
          ) : (
            <span>{getInitials(job.companyName)}</span>
          )}
        </div>

        <div className="job-list-content">
          <div className="job-list-tags">
            <Badge tone={job.reviewStatus === 'approved' ? 'success' : 'neutral'}>
              {jobTypeLabel}
            </Badge>
          </div>
          
          <h3 className="job-list-title">{job.title}</h3>
          <p className="job-list-company">{job.companyName}</p>

          <div className="job-list-meta">
            <span><MapPin size={14} /> {locationLabel}</span>
            <span><BriefcaseBusiness size={14} /> {experienceLabel}</span>
            <span><BadgeIndianRupee size={14} /> {formatSalary(job)}</span>
          </div>
        </div>

        <div className="job-list-actions">
          <button
            className="job-list-btn job-list-btn-outline"
            onClick={handleSaveJob}
            disabled={isSaving || isSaved}
            type="button"
          >
            <Heart size={14} /> {isSaved ? 'Saved' : (isSaving ? 'Saving...' : 'Save')}
          </button>
          <Link to={`/jobs/${slug}`} className="job-list-btn job-list-btn-outline">
            Details
          </Link>
          <Link to={`/jobs/${slug}`} className="job-list-btn job-list-btn-primary">
            Apply
          </Link>
        </div>
      </article>
    );
  }

  // Default variant (existing grid card for backwards compatibility)
  return (
    <article className="job-card">
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
