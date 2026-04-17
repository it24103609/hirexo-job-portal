import { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, Star, Briefcase, Users, Target, Globe, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import SectionHeader from '../../components/ui/SectionHeader';
import JobCard from '../../components/jobs/JobCard';
import BlogCard from '../../components/blog/BlogCard';
import Card from '../../components/ui/Card';
import { siteContent } from '../../data/siteContent';
import { jobsApi } from '../../services/jobs.api';
import { blogApi } from '../../services/blog.api';
import BrandIdentity from '../../components/layout/BrandIdentity';
import './HomePage.css';

export default function HomePage() {
  const [jobs, setJobs] = useState(siteContent.featuredJobs);
  const [blogs, setBlogs] = useState(siteContent.mockBlogs);
  const [activeSwitch, setActiveSwitch] = useState('local');

  const getLabel = (value, fallback = '') => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    return value.name || value.slug || fallback;
  };

  const getCompanyInitials = (value = '') => {
    return String(value)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'HX';
  };

  const getDaysLeft = (job) => {
    const target = job.expiresAt ? new Date(job.expiresAt) : null;
    if (!target || Number.isNaN(target.getTime())) return 23;

    const diffMs = target.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const getJobBadgeLabel = (job) => {
    const jobType = getLabel(job.jobType, '').trim();

    if (job.remoteFriendly) return 'Remote Job';
    if (!jobType) return 'Job';

    const normalized = jobType.toLowerCase();
    if (normalized === 'internship') return 'Internship';
    if (normalized.includes('full time')) return 'Full-time Job';
    if (normalized.includes('part time')) return 'Part-time Job';
    if (normalized.includes('contract')) return 'Contract Job';
    if (normalized.includes('remote')) return 'Remote Job';

    return jobType.toLowerCase().includes('job') ? jobType : `${jobType} Job`;
  };

  // Filter jobs based on Local/Global selection
  const getFilteredJobs = () => {
    const jobsList = Array.isArray(jobs) ? jobs : [];
    const sriLankaCities = [
      'colombo',
      'gampaha',
      'kalutara',
      'kandy',
      'matale',
      'nuwara eliya',
      'galle',
      'matara',
      'hambantota',
      'jaffna',
      'kilinochchi',
      'mannar',
      'mullaitivu',
      'vavuniya',
      'trincomalee',
      'batticaloa',
      'ampara',
      'anuradhapura',
      'kurunegala',
      'puttalam',
      'polonnaruwa',
      'badulla',
      'monaragala',
      'ratnapura',
      'kegalle'
    ];

    if (activeSwitch === 'global') {
      return jobsList;
    }

    // Local tab should show Sri Lanka opportunities only.
    const localJobs = jobsList.filter((job) => {
      const locationName = getLabel(job.location, '').toLowerCase();
      const country = String(job.country || '').toLowerCase();
      const searchable = `${locationName} ${country}`;
      const hasSriLankaCity = sriLankaCities.some((city) => searchable.includes(city));

      return (
        searchable.includes('sri lanka') ||
        searchable.includes('srilanka') ||
        country === 'lk' ||
        country === 'sl' ||
        hasSriLankaCity
      );
    });

    return localJobs;
  };

  const filteredJobs = getFilteredJobs();
  const heroStats = [
    { value: '6+', label: 'CITY PAGES' },
    { value: '4', label: 'CORE SERVICES' },
    { value: '24/7', label: 'TALENT DISCOVERY' }
  ];

  const trustStats = [
    { icon: '💼', value: '250+', label: 'Active roles' },
    { icon: '🤝', value: '120+', label: 'Hiring partners' },
    { icon: '✓', value: '15k+', label: 'Candidate matches' },
    { icon: '🌍', value: '30+', label: 'Cities covered' }
  ];

  const whyChooseDetails = [
    'KPI-backed hiring sprints with transparent progress updates.',
    'Profiles screened for both delivery ability and team chemistry.',
    'Candidate and employer journeys designed for less friction.',
    'Quality checks at each stage before public visibility.'
  ];

  const whyChooseIcons = [Target, Users, Briefcase, Globe];
  const whyChooseMeta = siteContent.whyChooseUs.map((item, index) => {
    const Icon = whyChooseIcons[index % whyChooseIcons.length];
    return {
      title: item,
      detail: whyChooseDetails[index] || 'Execution-focused recruitment support from sourcing to closure.',
      icon: Icon
    };
  });

  useEffect(() => {
    jobsApi.featured().then((res) => setJobs(res.data || siteContent.featuredJobs)).catch(() => setJobs(siteContent.featuredJobs));
    blogApi.list().then((res) => setBlogs(res.data || siteContent.mockBlogs)).catch(() => setBlogs(siteContent.mockBlogs));
  }, []);

  return (
    <>
      <Seo title="Hirexo | Recruitment Platform" description="Corporate recruitment website and job portal for candidates, employers, and admins." />
      <section className="hero section-block">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="section-eyebrow"><Sparkles size={14} className="eyebrow-icon" /> Recruitment partner</p>
            <h1>Hirexo Job Portal & Recruitment Partner</h1>
            <p>
              Hirexo is a modern recruitment platform focused on delivering the right talent fast and with precision.
              We connect businesses with people who drive real impact and long-term success.
            </p>
            <div className="hero-actions">
              <Button as={Link} to="/services">Explore Services <ArrowRight size={16} /></Button>
              <Button as={Link} to="/contact" variant="ghost">Contact Us</Button>
            </div>
            <div className="hero-stats-row">
              {heroStats.map((stat) => (
                <Card key={stat.label} className="hero-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </Card>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-avatar-stack" aria-hidden="true">
              <span>🧑‍💼</span>
              <span>👩‍💻</span>
              <span>🎓</span>
              <span>🧑‍🔧</span>
            </div>
            <Card className="hero-rating-card">
              <div className="hero-rating-stars" aria-label="Rated 4.9 out of 5">
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
              </div>
              <p><strong>4.9/5</strong> from 2,847 users</p>
            </Card>
            <Card className="hero-feature-card">
              <BrandIdentity className="hero-brand" subtitle="Recruitment platform" />
              <p className="hero-brand-copy">
                Built for candidates, employers, and admins with a practical hiring workflow.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Stats Strip */}
      <section className="trust-stats-section">
        <div className="shell">
          <div className="trust-stats-grid">
            {trustStats.map((stat) => (
              <div key={stat.label} className="trust-stat-card">
                <span className="trust-stat-icon">{stat.icon}</span>
                <div className="trust-stat-value">{stat.value}</div>
                <p className="trust-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block recent-jobs-shell">
        <div className="shell">
          <SectionHeader eyebrow="Recent jobs" title="Premium Job Highlights" description="Top opportunities ready for your application or quick review." />
          <div className="jobs-switch-wrap">
            <div className="jobs-switch">
              <button
                type="button"
                className={`jobs-switch-btn ${activeSwitch === 'local' ? 'active' : ''}`}
                onClick={() => setActiveSwitch('local')}
              >
                Local
              </button>
              <button
                type="button"
                className={`jobs-switch-btn ${activeSwitch === 'global' ? 'active' : ''}`}
                onClick={() => setActiveSwitch('global')}
              >
                Global
              </button>
            </div>
          </div>
          <div className="grid-4">
            {filteredJobs.slice(0, 4).map((job) => (
              <div key={job._id || job.slug} className="job-card-home">
                <div className="job-card-top-row">
                  <span className="job-card-days">⏱ {getDaysLeft(job)} days left</span>
                  <span className="job-card-badge">{getJobBadgeLabel(job)}</span>
                </div>

                <div className="job-card-body">
                  <div className="job-card-logo" aria-hidden="true">
                    {job.image?.url ? (
                      <img src={job.image.url} alt={job.image?.alt || `${job.companyName} logo`} loading="lazy" />
                    ) : (
                      <span>{getCompanyInitials(job.companyName)}</span>
                    )}
                  </div>

                  <p className="job-card-company">{job.companyName}</p>
                  <h3 className="job-card-title">{job.title}</h3>
                  <p className="job-card-location"><MapPin size={13} /> {getLabel(job.location, 'Remote / Hybrid')}</p>
                </div>

                <div className="job-card-footer single-action">
                  <Link className="job-card-cta primary" to={`/jobs/${job.slug || job._id}`}>
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}

            {!filteredJobs.length ? (
              <Card>
                <p style={{ margin: 0 }}>
                  No Sri Lanka jobs available right now. Try Global to view all current opportunities.
                </p>
              </Card>
            ) : null}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Button as={Link} to="/jobs">Browse all jobs <ArrowRight size={16} /></Button>
          </div>
        </div>
      </section>

      <section className="section-block why-choose-us-section">
        <div className="shell">
          <div className="why-choose-us-grid">
            <div>
              <div className="why-choose-us-content">
                <p className="section-eyebrow"><CheckCircle size={14} className="eyebrow-icon" /> Why choose us</p>
                <h2>Focused, practical, and ready for business</h2>
                <p>Designed for teams that want a clean process and less hiring noise. We deliver results with precision.</p>
              </div>
              <div className="why-choose-features">
                {whyChooseMeta.map((item) => {
                  const Icon = item.icon;
                  return (
                  <div key={item.title} className="why-choose-feature">
                    <span className="why-feature-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  );
                })}
              </div>
            </div>
            <div className="why-choose-testimonial">
              <div className="why-choose-visual" aria-hidden="true">
                <span className="why-orb" />
                <span className="why-ring" />
                <span className="why-chip why-chip-a"><Users size={14} /> Culture match</span>
                <span className="why-chip why-chip-b"><Target size={14} /> Role fit</span>
              </div>
              <p className="why-testimonial-text">{siteContent.testimonial}</p>
              <div className="testimonial-ctas">
                <Button as={Link} to="/services" className="testimonial-cta-btn primary">
                  See core services
                </Button>
                <Button as={Link} to="/contact" className="testimonial-cta-btn secondary">
                  Talk to our team
                </Button>
              </div>
              <a className="whatsapp-link mt-1" href={`https://wa.me/${siteContent.contact.whatsapp}`} target="_blank" rel="noreferrer">
                <MessageCircle size={16} /> WhatsApp support
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block blog-section">
        <div className="shell">
          <SectionHeader eyebrow="Blog" title="Latest blog posts" description="Content blocks for SEO, employer branding, and career advice." />
          <div className="grid-3">
            {blogs.map((blog) => <BlogCard key={blog.slug} post={blog} />)}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="cta-band-section">
        <div className="shell">
          <div className="cta-band-content">
            <h2>Ready to find the right talent or your next opportunity?</h2>
            <div className="cta-band-actions">
              <Button as={Link} to="/jobs" className="cta-band-btn light">
                Explore Jobs <ArrowRight size={16} />
              </Button>
              <Button as={Link} to="/contact" className="cta-band-btn outline">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
