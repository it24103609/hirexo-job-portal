import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileCheck2,
  Globe2,
  LineChart,
  LockKeyhole,
  MapPin,
  MessageCircle,
  SearchCheck,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import { siteContent } from '../../data/siteContent';
import { jobsApi } from '../../services/jobs.api';
import { blogApi } from '../../services/blog.api';
import './HomePage.css';

const media = {
  heroVideo: '/hero-video.mp4',
  heroFallback: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85',
  candidate: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=760&q=85',
  teamwork: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85',
  employer: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=760&q=85',
  interview: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=760&q=85',
  blogResume: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=760&q=85',
  blogTrends: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=760&q=85',
  blogDescriptions: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=760&q=85',
  ctaLeft: 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?auto=format&fit=crop&w=760&q=85',
  ctaRight: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=760&q=85'
};

const stats = [
  { value: '250+', label: 'Active Jobs', icon: Briefcase },
  { value: '120+', label: 'Hiring Partners', icon: Building2 },
  { value: '15K+', label: 'Candidates Matched', icon: UserCheck },
  { value: '30+', label: 'Cities Covered', icon: Globe2 }
];

const features = [
  {
    title: 'Fast delivery with measurable hiring results',
    text: 'Transparent hiring sprints, clear milestones, and quick shortlist movement.',
    icon: TrendingUp
  },
  {
    title: 'Role, culture, and skill alignment',
    text: 'Talent is reviewed for delivery ability, team rhythm, and long-term fit.',
    icon: Target
  },
  {
    title: 'Practical workflows for candidates & employers',
    text: 'Simple journeys that reduce friction from discovery to final decision.',
    icon: SearchCheck
  },
  {
    title: 'Structured review and moderation for quality control',
    text: 'Every listing and profile moves through quality checks before visibility.',
    icon: ShieldCheck
  }
];

const blogPosts = [
  {
    slug: 'how-to-build-a-strong-resume',
    date: '22 Mar 2026',
    title: 'How to Build a Strong Resume',
    description: 'A practical guide to writing resumes that get shortlisted by recruiters.',
    image: media.blogResume
  },
  {
    slug: 'hiring-trends-2026',
    date: '21 Mar 2026',
    title: 'Hiring Trends to Watch in 2026',
    description: 'What employers are prioritizing this year and how candidates can adapt.',
    image: media.blogTrends
  },
  {
    slug: 'writing-better-job-descriptions',
    date: '20 Mar 2026',
    title: 'Winning Better Job Descriptions',
    description: 'How employers can attract the right applicants with clearer JDs.',
    image: media.blogDescriptions
  }
];

export default function HomePage() {
  const [jobs, setJobs] = useState(siteContent.featuredJobs);
  const [activeFilter, setActiveFilter] = useState('all');

  const getLabel = (value, fallback = '') => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    return value.name || value.slug || fallback;
  };

  const getCompanyInitials = (value = '') => (
    String(value)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'HX'
  );

  const filteredJobs = useMemo(() => {
    const list = Array.isArray(jobs) ? jobs : [];
    if (activeFilter === 'all') return list;

<<<<<<< HEAD
    return list.filter((job) => {
      const location = `${getLabel(job.location)} ${job.country || ''}`.toLowerCase();
      const isLocal = ['sri lanka', 'colombo', 'kandy', 'galle', 'negombo', 'lk'].some((item) => location.includes(item));
      return activeFilter === 'local' ? isLocal : !isLocal || job.remoteFriendly;
=======
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
>>>>>>> 6dbca67f94fcc59399057f5222ad231126e5b1b4
    });
  }, [activeFilter, jobs]);

  const highlightJob = filteredJobs[0] || siteContent.featuredJobs[0];
  const blogFallback = blogPosts;

  useEffect(() => {
    jobsApi.featured()
      .then((res) => setJobs(res.data?.length ? res.data : siteContent.featuredJobs))
      .catch(() => setJobs(siteContent.featuredJobs));

    blogApi.list().catch(() => null);
  }, []);

  return (
    <>
      <Seo
        title="Hirexo | Job Portal & Recruitment Partner"
        description="Premium job portal and recruitment partner connecting candidates and employers with precision."
      />

      <section className="home-hero">
        <img className="hero-fallback" src={media.heroFallback} alt="" aria-hidden="true" />
        <video className="hero-video" autoPlay muted loop playsInline poster={media.heroFallback}>
          <source src={media.heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay" />

        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow"><Users size={16} /> Recruitment Partner</p>
            <h1>Hirexo Job Portal & Recruitment Partner</h1>
            <p>
<<<<<<< HEAD
              Hirexo connects ambitious candidates with verified employers through fast,
              structured, and people-focused recruitment workflows.
=======
              Hirexo is a modern recruitment platform focused on delivering the right talent fast and with precision.
              We connect businesses with people who drive real impact and long-term success.
>>>>>>> 6dbca67f94fcc59399057f5222ad231126e5b1b4
            </p>
            <div className="home-hero-actions">
              <Button as={Link} to="/services" size="lg">Explore Services <ArrowRight size={18} /></Button>
              <Button as={Link} to="/contact" variant="ghost" size="lg">Contact Us <MessageCircle size={17} /></Button>
            </div>
          </div>

          <div className="hero-dashboard" aria-label="Hirexo recruitment dashboard preview">
            <div className="float-card rating-card">
              <span>4.9/5 from 2,547 users</span>
              <div>{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} fill="currentColor" />)}</div>
            </div>

            <div className="float-card avatar-card">
              <span>Top Roles Hiring</span>
              <div className="avatar-row">
                {[media.candidate, media.employer, media.interview].map((src) => <img key={src} src={src} alt="" />)}
                <strong>+120</strong>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-head">
                <span><LineChart size={15} /> Dashboard</span>
                <small>Live</small>
              </div>
              <div className="mini-metrics">
                <span><strong>250+</strong> Roles</span>
                <span><strong>15K+</strong> Matches</span>
                <span><strong>1.2K+</strong> Interviews</span>
              </div>
              <div className="chart-lines" aria-hidden="true">
                <span /><span /><span /><span /><span /><span />
              </div>
            </div>

            <div className="profile-card">
              <span className="profile-logo">H</span>
              <div>
                <strong>Hirexo</strong>
                <small>Recruitment partner</small>
                <p>Built for employers, candidates, and talent teams.</p>
              </div>
            </div>

            <div className="match-card">
              <span>Matches</span>
              <strong>98%</strong>
              <small>Top fit shortlist</small>
              <CheckCircle2 size={24} />
            </div>

            <span className="hero-icon icon-user"><CircleUserRound size={28} /></span>
            <span className="hero-icon icon-briefcase"><Briefcase size={28} /></span>
            <span className="hero-icon icon-chart"><BarChart3 size={28} /></span>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="shell stats-grid">
          {stats.map(({ value, label, icon: Icon }) => (
            <div className="premium-stat-card" key={label}>
              <span><Icon size={28} /></span>
              <div>
                <strong>{value}</strong>
                <p>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="media-jobs-section">
        <div className="shell media-jobs-grid">
          <div className="image-collage">
            <div className="image-card tall">
              <img src={media.candidate} alt="Professional candidate" />
              <span className="image-badge"><BadgeCheck size={15} /> Verified Employers</span>
            </div>
            <div className="image-card">
              <img src={media.teamwork} alt="Recruitment teamwork session" />
            </div>
            <div className="placement-card">
              <small>Success Stories</small>
              <strong>15K+</strong>
              <span>Placements</span>
              <div className="growth-spark" />
            </div>
            <div className="image-card">
              <img src={media.employer} alt="Employer reviewing candidate profiles" />
            </div>
          </div>

          <div className="job-highlights">
            <p className="home-eyebrow">Recent Jobs</p>
            <h2>Premium Job Highlights</h2>
            <div className="rating-line" aria-label="Five star rating">
              {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={17} fill="currentColor" />)}
            </div>
            <p>Top opportunities handpicked for your experience and career aspirations across local and global markets.</p>
            <div className="job-filter-chips">
              {['all', 'local', 'global'].map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={activeFilter === filter ? 'active' : ''}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === 'all' ? 'All Jobs' : filter[0].toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <Link className="highlight-job-card" to={`/jobs/${highlightJob.slug || highlightJob._id}`}>
              <span className="company-mark">{highlightJob.image?.url ? <img src={highlightJob.image.url} alt="" /> : getCompanyInitials(highlightJob.companyName)}</span>
              <div>
                <small>{highlightJob.companyName || 'Hirexo Partner'}</small>
                <strong>{highlightJob.title || 'Software Engineer'}</strong>
                <span><MapPin size={14} /> {getLabel(highlightJob.location, 'Remote / Hybrid')}</span>
                <div className="skill-tags">
                  {['React', 'Node.js', 'TypeScript', 'AWS'].map((tag) => <em key={tag}>{tag}</em>)}
                </div>
              </div>
              <aside>
                <b>{getLabel(highlightJob.jobType, 'Full-time')}</b>
                <small><Clock3 size={13} /> 2d ago</small>
              </aside>
            </Link>

            <Button as={Link} to="/jobs" className="browse-jobs-btn">Browse all jobs <ArrowRight size={17} /></Button>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="shell why-grid">
          <div>
            <p className="home-eyebrow">Why Choose Hirexo</p>
            <h2>Focused, practical, and ready for business</h2>
            <p className="section-copy">Designed for teams that want a clean process and less hiring noise. We deliver results with precision.</p>
            <div className="feature-grid">
              {features.map(({ title, text, icon: Icon }) => (
                <article className="feature-card" key={title}>
                  <span><Icon size={20} /></span>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="ai-card">
            <span className="ai-pill">AI-Powered Matching</span>
            <div className="ai-orbit">
              <span className="ai-orb" />
              <span className="orbit-dot dot-a" />
              <span className="orbit-dot dot-b" />
              <span className="orbit-dot dot-c" />
            </div>
<<<<<<< HEAD
            <div className="ai-side-card side-left"><FileCheck2 size={20} /> Smart Screening</div>
            <div className="ai-side-card side-right"><ShieldCheck size={20} /> Better Shortlists</div>
            <div className="accuracy-card">
              <strong>98% match accuracy</strong>
=======
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
>>>>>>> 6dbca67f94fcc59399057f5222ad231126e5b1b4
            </div>
            <div className="ai-actions">
              <Button as={Link} to="/jobs">See open positions <ArrowRight size={16} /></Button>
              <Button as={Link} to="/contact" variant="secondary">Talk to our team</Button>
            </div>
            <a className="whatsapp-support" href={`https://wa.me/${siteContent.contact.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle size={17} /> WhatsApp support available
            </a>
          </aside>
        </div>
      </section>

      <section className="blog-preview-section">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Blog</p>
              <h2>Latest blog posts</h2>
              <p>Career tips, hiring trends, employer branding, and more.</p>
            </div>
            <Link to="/blog">View all posts <ArrowRight size={16} /></Link>
          </div>
          <div className="blog-preview-grid">
            {blogFallback.map((post) => (
              <article className="premium-blog-card" key={post.slug}>
                <img src={post.image} alt={post.title} />
                <div>
                  <time>{post.date}</time>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <Link to={`/blog/${post.slug}`}>Read more <ChevronRight size={15} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="cta-pattern" />
        <img className="cta-person cta-left" src={media.ctaLeft} alt="Recruiter working with candidates" />
        <img className="cta-person cta-right" src={media.ctaRight} alt="Professional candidate smiling" />
        <div className="floating-stat cta-stat-left"><Users size={17} /> Top Companies Hiring Now</div>
        <div className="floating-stat cta-stat-right"><strong>250+</strong> Open Positions</div>
        <div className="shell final-cta-inner">
          <h2>Ready to find the right talent or your next opportunity?</h2>
          <p>Join Hirexo and connect with opportunities that fit your goals, team, and growth plans.</p>
          <div>
            <Button as={Link} to="/jobs" size="lg">Explore Jobs <ArrowRight size={18} /></Button>
            <Button as={Link} to="/contact" variant="ghost" size="lg">Contact Us <LockKeyhole size={17} /></Button>
          </div>
        </div>
      </section>
    </>
  );
}
