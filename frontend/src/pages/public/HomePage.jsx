import { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, Star } from 'lucide-react';
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

export default function HomePage() {
  const [jobs, setJobs] = useState(siteContent.featuredJobs);
  const [blogs, setBlogs] = useState(siteContent.mockBlogs);
    const [activeSwitch, setActiveSwitch] = useState('local');

  // Filter jobs based on Local/Global selection
  const getFilteredJobs = () => {
    if (activeSwitch === 'global') {
      return jobs;
    }
    // Local = Sri Lanka jobs
    return jobs.filter(job => {
      // Handle location as object (populated location reference)
      let locationName = '';
      if (typeof job.location === 'object' && job.location?.name) {
        locationName = job.location.name.toLowerCase();
      } else if (typeof job.location === 'string') {
        locationName = job.location.toLowerCase();
      }
      
      // Check if location contains Sri Lanka keywords or country field
      const country = (typeof job.country === 'string' ? job.country : '').toLowerCase();
      return locationName.includes('colombo') || locationName.includes('sri lanka') || 
             country.includes('sri lanka') || country === 'lk' || country === 'srilanka';
    });
  };

    const filteredJobs = getFilteredJobs();
  const heroStats = [
    { value: '6+', label: 'CITY PAGES' },
    { value: '4', label: 'CORE SERVICES' },
    { value: '24/7', label: 'TALENT DISCOVERY' }
  ];

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
              Hirexo is a modern job portal in India focused on delivering the right talent fast and with precision.
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

      <section className="section-block">
        <div className="shell recent-jobs-shell">
          <SectionHeader eyebrow="Recent jobs" title="Recent Jobs" description="Green themed job highlights for quick apply." />
          <div className="jobs-switch">
            <span 
              className={`jobs-switch-btn ${activeSwitch === 'local' ? 'active' : ''}`}
              onClick={() => setActiveSwitch('local')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setActiveSwitch('local')}
            >
              Local
            </span>
            <span 
              className={`jobs-switch-btn ${activeSwitch === 'global' ? 'active' : ''}`}
              onClick={() => setActiveSwitch('global')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setActiveSwitch('global')}
            >
              Global
            </span>
          </div>
          <div className="grid-4">
            {filteredJobs.slice(0, 8).map((job) => <JobCard key={job._id || job.slug} job={job} variant="home" />)}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="shell grid-2">
          <div>
            <SectionHeader eyebrow="Why choose us" title="Focused, practical, and ready for business" description="Designed for teams that want a clean process and less hiring noise." />
            <div className="grid-2">
              {siteContent.whyChooseUs.map((item) => <Card key={item}><strong>{item}</strong></Card>)}
            </div>
          </div>
          <Card>
            <SectionHeader eyebrow="Client highlight" title="What our clients say" description={siteContent.testimonial} />
            <div className="form-links">
              <Button as={Link} to="/services">See core services</Button>
              <Button as={Link} to="/contact" variant="secondary">Talk to our team</Button>
            </div>
            <a className="whatsapp-link mt-1" href={`https://wa.me/${siteContent.contact.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp support
            </a>
          </Card>
        </div>
      </section>

      <section className="section-block">
        <div className="shell">
          <SectionHeader eyebrow="Blog" title="Latest blog posts" description="Content blocks for SEO, employer branding, and career advice." />
          <div className="grid-3">
            {blogs.map((blog) => <BlogCard key={blog.slug} post={blog} />)}
          </div>
        </div>
      </section>
    </>
  );
}
