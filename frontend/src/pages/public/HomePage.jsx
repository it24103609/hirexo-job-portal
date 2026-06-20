import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  SearchCheck,
  ShieldCheck,
  Star,
  TrendingUp,
  UploadCloud,
  UserCheck,
  Users,
  Utensils,
  Bookmark,
  Sparkles,
  DollarSign,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import { siteContent } from '../../data/siteContent';
import PremiumDualCardSection from '../../components/home/PremiumDualCardSection';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import './HomePage.css';

const media = {
  heroVideo: '/hero-video.mp4',
  heroFallback: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85',
  candidate: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=760&q=85',
  teamwork: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85',
  employer: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=760&q=85',
  ctaLeft: 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?auto=format&fit=crop&w=760&q=85',
  ctaRight: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=760&q=85'
};

const stats = [
  { value: '5', label: 'Business Divisions', icon: Building2 },
  { value: '25K+', label: 'Professionals', icon: Users },
  { value: 'Global', label: 'Presence', icon: Globe2 },
  { value: '8+', label: 'Years Experience', icon: TrendingUp }
];

const talentFeatures = [
  {
    title: 'End-to-end talent acquisition',
    text: 'From role intake to onboarding, HEXORA TALENT manages a clear and accountable recruitment process.',
    icon: ClipboardCheck
  },
  {
    title: 'Fast, practical shortlisting',
    text: 'We reduce hiring noise by matching skills, salary expectations, availability, and culture fit.',
    icon: SearchCheck
  },
  {
    title: 'Workforce solutions for growth',
    text: 'Permanent recruitment, contract staffing, project hiring, and role-based workforce planning.',
    icon: TrendingUp
  },
  {
    title: 'Verified employer and candidate support',
    text: 'A structured experience for job seekers and companies with responsive communication at every step.',
    icon: ShieldCheck
  }
];

const sampleJobs = [
  {
    title: 'Lead Software Engineer',
    company: 'HEXORA Tech',
    department: 'Information Technology',
    location: 'Colombo / Hybrid',
    salary: 'LKR 450k - 650k',
    experience: '5+ Yrs Exp',
    type: 'Full-time',
    workplace: 'Hybrid',
    logoBg: 'linear-gradient(135deg, #059669, #10b981)',
    logoText: 'HT'
  },
  {
    title: 'Senior HR Specialist',
    company: 'HEXORA HR Consulting',
    department: 'Human Resources',
    location: 'Colombo / Remote',
    salary: 'LKR 250k - 350k',
    experience: '3+ Yrs Exp',
    type: 'Full-time',
    workplace: 'Remote',
    logoBg: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    logoText: 'HC'
  },
  {
    title: 'Senior Financial Analyst',
    company: 'HEXORA Solutions',
    department: 'Banking & Finance',
    location: 'Kandy / Hybrid',
    salary: 'LKR 300k - 400k',
    experience: '4+ Yrs Exp',
    type: 'Full-time',
    workplace: 'Hybrid',
    logoBg: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    logoText: 'HS'
  },
  {
    title: 'Creative Growth Marketer',
    company: 'HEXORA Foods',
    department: 'Marketing',
    location: 'Colombo / Onsite',
    salary: 'LKR 200k - 280k',
    experience: '2+ Yrs Exp',
    type: 'Full-time',
    workplace: 'Onsite',
    logoBg: 'linear-gradient(135deg, #ea580c, #f97316)',
    logoText: 'HF'
  },
  {
    title: 'Full-Stack Developer',
    company: 'HEXORA Tech',
    department: 'Information Technology',
    location: 'Colombo / Remote',
    salary: 'LKR 320k - 450k',
    experience: '3+ Yrs Exp',
    type: 'Full-time',
    workplace: 'Remote',
    logoBg: 'linear-gradient(135deg, #059669, #10b981)',
    logoText: 'HT'
  },
  {
    title: 'Project Civil Engineer',
    company: 'HEXORA Construction',
    department: 'Engineering',
    location: 'Batticaloa / Onsite',
    salary: 'LKR 220k - 300k',
    experience: '3+ Yrs Exp',
    type: 'Contract',
    workplace: 'Onsite',
    logoBg: 'linear-gradient(135deg, #0d9488, #14b8a6)',
    logoText: 'HE'
  }
];

const miniChartData = [
  { month: 'Jan', placements: 45 },
  { month: 'Feb', placements: 52 },
  { month: 'Mar', placements: 49 },
  { month: 'Apr', placements: 63 },
  { month: 'May', placements: 58 },
  { month: 'Jun', placements: 74 }
];

const recruitmentProcess = [
  'Requirement Analysis',
  'Candidate Sourcing',
  'Screening & Shortlisting',
  'Interviews & Assessments',
  'Client Selection',
  'Offer Management',
  'Onboarding Support'
];

const industries = [
  'Information Technology',
  'Banking & Finance',
  'Healthcare',
  'Engineering',
  'Construction',
  'Manufacturing',
  'Retail & FMCG',
  'Logistics & Supply Chain',
  'Hospitality',
  'Telecommunications'
];

const globalTradeServices = [
  'Import & Export Management',
  'International Product Sourcing',
  'Supplier & Manufacturer Identification',
  'Procurement Solutions',
  'Customs Documentation Support',
  'Supply Chain Coordination',
  'Trade Partner Development',
  'International Market Entry Support',
  'Logistics Coordination'
];

const globalTradeProducts = [
  'Consumer Goods',
  'Agricultural Products',
  'Industrial Equipment',
  'FMCG Products',
  'Food Ingredients',
  'Raw Materials',
  'Packaging Materials'
];

const globalTradeBenefits = [
  'Reliable Global Supplier Network',
  'Cost-Effective Sourcing Solutions',
  'End-to-End Trade Support',
  'International Market Expertise',
  'Strategic Business Partnerships'
];

const divisions = [
  {
    title: 'HEXORA TALENT',
    text: 'Primary recruitment and workforce solutions division connecting employers with qualified professionals through staffing, talent acquisition, and candidate placement support.',
    icon: Users,
    tone: 'talent',
    link: '/jobs'
  },
  {
    title: 'HEXORA HR CONSULTING',
    text: 'Strategic HR advisory, policy guidance, talent planning, and people operations support for growing organizations.',
    icon: Users,
    tone: 'people'
  },
  {
    title: 'HEXORA GLOBAL TRADE',
    text: 'International sourcing, procurement, import/export coordination, and trade partnership development.',
    icon: Globe2,
    tone: 'trade'
  },
  {
    title: 'HEXORA FOODS',
    text: 'Food-related business initiatives focused on product opportunities, distribution partnerships, and market growth.',
    icon: Utensils,
    tone: 'foods'
  },
  {
    title: 'HEXORA BUSINESS SOLUTIONS',
    text: 'Business support services that help companies improve operations, communication, and commercial execution.',
    icon: Briefcase,
    tone: 'solutions'
  }
];

const clients = ['IT Startups', 'Finance Teams', 'Construction Firms', 'Manufacturers', 'Retail Brands', 'Service Providers'];

const testimonials = [
  {
    quote: siteContent.testimonial,
    name: 'Corporate HR Partner'
  },
  {
    quote: 'HEXORA TALENT helped us move from role brief to qualified shortlists with speed, structure, and strong communication.',
    name: 'Employer Client'
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const industryCarouselRef = useRef(null);
  const industryDrag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs/featured');
        const data = await response.json();
        if (data.success && data.data) {
          setFeaturedJobs(data.data);
        }
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  const handleSaveJob = (jobTitle) => {
    if (savedJobs.includes(jobTitle)) {
      setSavedJobs(savedJobs.filter(t => t !== jobTitle));
      toast.success('Job removed from bookmarks');
    } else {
      setSavedJobs([...savedJobs, jobTitle]);
      toast.success('Job added to bookmarks');
    }
  };

  const handleCvClick = () => {
    if (user && user.role === 'candidate') {
      navigate('/candidate/resume');
    } else {
      toast.info('Register Candidate');
      navigate('/candidate/register');
    }
  };

  const handleEmployerClick = () => {
    if (user && user.role === 'employer') {
      navigate('/employer/jobs/new');
    } else {
      toast.info('Register Employer');
      navigate('/employer/register');
    }
  };

  const handleHireTalentClick = () => {
    const tradeSection = document.getElementById('global-trade');
    if (tradeSection) {
      tradeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleIndustryPointerDown = (event) => {
    if (event.pointerType === 'touch') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const carousel = industryCarouselRef.current;
    if (!carousel) return;

    industryDrag.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: carousel.scrollLeft
    };
    carousel.classList.add('is-dragging');
    carousel.setPointerCapture?.(event.pointerId);
  };

  const handleIndustryPointerMove = (event) => {
    const carousel = industryCarouselRef.current;
    if (!carousel || !industryDrag.current.active) return;

    event.preventDefault();
    const walk = event.clientX - industryDrag.current.startX;
    carousel.scrollLeft = industryDrag.current.scrollLeft - walk;
  };

  const stopIndustryDrag = (event) => {
    const carousel = industryCarouselRef.current;
    if (!carousel) return;

    industryDrag.current.active = false;
    carousel.classList.remove('is-dragging');
    if (carousel.hasPointerCapture?.(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }
  };

  const handleIndustryKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const carousel = industryCarouselRef.current;
    if (!carousel) return;

    event.preventDefault();
    const firstCard = carousel.querySelector('.industry-card');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
    carousel.scrollBy({
      left: event.key === 'ArrowRight' ? cardWidth : -cardWidth,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Seo
        title="HEXORA GLOBAL GROUP | Diversified Business Ecosystem"
        description="HEXORA GLOBAL GROUP is a diversified holding company with 5 business divisions spanning recruitment, HR consulting, global trade, foods, and business solutions."
      />

      <section className="home-hero">
        <img className="hero-fallback" src={media.heroFallback} alt="" aria-hidden="true" />
        <video className="hero-video" autoPlay muted loop playsInline poster={media.heroFallback}>
          <source src={media.heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay" />

        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow"><Building2 size={16} /> HEXORA GLOBAL GROUP</p>
            <h1>Building Global Talent, Trade & Innovation Across Industries</h1>
            <p>
              HEXORA GLOBAL GROUP is a diversified holding company with 5 strategic business divisions
              spanning recruitment, HR consulting, global trade, foods, and business solutions.
              We connect talent with opportunity and businesses with growth.
            </p>
            <div className="home-hero-actions">
              <Button as={Link} to="/jobs" size="lg">Explore Talent Division <ArrowRight size={18} /></Button>
              <Button onClick={() => document.getElementById('divisions-section')?.scrollIntoView({ behavior: 'smooth' })} variant="secondary" size="lg">View Group Companies <Building2 size={18} /></Button>
              <Button as={Link} to="/contact" variant="ghost" size="lg">Contact Group <MessageCircle size={17} /></Button>
            </div>
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

      <section className="why-section">
        <div className="shell why-grid">
          <div>
            <p className="home-eyebrow">Why Choose HEXORA GLOBAL GROUP</p>
            <h2>Building success across diversified business ecosystems</h2>
            <p className="section-copy">
              HEXORA GLOBAL GROUP delivers value through strategic business divisions, each focused on
              excellence in their domain while leveraging shared expertise and resources.
            </p>
            <div className="feature-grid">
              {talentFeatures.map(({ title, text, icon: Icon }) => (
                <article className="feature-card" key={title}>
                  <span><Icon size={20} /></span>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="ai-card">
            <span className="ai-pill">Group-Wide Excellence</span>
            <div className="ai-orbit">
              <span className="ai-orb" />
              <span className="orbit-dot dot-a" />
              <span className="orbit-dot dot-b" />
              <span className="orbit-dot dot-c" />
            </div>
            <div className="ai-side-card side-left"><Building2 size={20} /> 5 Divisions</div>
            <div className="ai-side-card side-right"><Globe2 size={20} /> Global Reach</div>
            <div className="accuracy-card">
              <strong>Integrated business solutions across industries</strong>
            </div>
            <div className="ai-actions">
              <Button onClick={() => document.getElementById('divisions-section')?.scrollIntoView({ behavior: 'smooth' })}>Explore Divisions <ArrowRight size={16} /></Button>
              <Button as={Link} to="/contact" variant="secondary">Partner With Us</Button>
            </div>
            <a className="whatsapp-support" href={`https://wa.me/${siteContent.contact.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle size={17} /> WhatsApp support available
            </a>
          </aside>
        </div>
      </section>

      <section className="divisions-section" id="divisions-section">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Our Business Divisions</p>
              <h2>Five Strategic Divisions Driving Global Growth</h2>
              <p>Each division operates with focused expertise while contributing to the strength of HEXORA GLOBAL GROUP.</p>
            </div>
          </div>

          <div className="division-grid">
            {divisions.map((division) => (
              <article className="division-card" key={division.title}>
                <span className={`division-icon division-icon-${division.tone}`}>
                  <division.icon size={28} />
                </span>
                <h3>{division.title}</h3>
                <p>{division.text}</p>
                {division.link ? (
                  <Button as={Link} to={division.link} size="sm" className="division-explore-btn">
                    Explore <ArrowRight size={14} />
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" className="division-explore-btn">
                    Coming Soon
                  </Button>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="premium-recruitment-section" id="current-openings">
        <div className="premium-bg-glow" />
        <div className="premium-noise-overlay" />
        <div className="shell">
          <div className="luxury-glass-container">
            <div className="luxury-recruitment-grid">
              
              {/* Left Side: Luxury Hero & Info */}
              <div className="recruitment-left-hero">
                <div className="premium-badge-wrapper">
                  <span className="premium-eyebrow-badge">
                    <Sparkles size={14} className="accent-sparkle" /> CURRENT OPENINGS
                  </span>
                </div>
                
                <h2 className="premium-headline">
                  Find Premium Career Opportunities Through <span className="green-gradient-text">HEXORA TALENT</span>
                </h2>
                
                <p className="premium-subtitle">
                  We bridge the gap between elite professionals and leading global employers. Discover curated career pathways and accelerate your hiring journey with our AI-powered matchmaking.
                </p>

                {/* Floating Badges */}
                <div className="premium-floating-badges-grid">
                  <div className="floating-badge-item">
                    <span className="badge-check-icon">✓</span> Verified Employers
                  </div>
                  <div className="floating-badge-item">
                    <span className="badge-check-icon">✓</span> 25K+ Professionals
                  </div>
                  <div className="floating-badge-item">
                    <span className="badge-check-icon">✓</span> AI Smart Matching
                  </div>
                  <div className="floating-badge-item">
                    <span className="badge-check-icon">✓</span> Fast Hiring Process
                  </div>
                </div>

                {/* Premium CTAs */}
                <div className="premium-cta-group">
                  <Button as={Link} to="/jobs" size="lg" className="cta-primary-luxury">
                    Explore Jobs <ArrowRight size={18} />
                  </Button>
                  <Button onClick={handleCvClick} variant="secondary" size="lg" className="cta-secondary-luxury">
                    Upload Resume <UploadCloud size={18} />
                  </Button>
                </div>

                {/* Social Proof & Rating */}
                <div className="premium-social-proof">
                  <div className="rating-block">
                    <div className="stars-row">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={15} fill="#eab308" color="#eab308" />
                      ))}
                    </div>
                    <span className="rating-text"><strong>4.9/5 Rating</strong> · Trusted by 25K+ professionals</span>
                  </div>
                  
                  <div className="company-trust-logos">
                    <span className="trust-logo-label">TRUSTED BY LEADING ENTERPRISES:</span>
                    <div className="logos-flex">
                      <span className="trust-logo-item">Google</span>
                      <span className="trust-logo-item">Microsoft</span>
                      <span className="trust-logo-item">Amazon</span>
                      <span className="trust-logo-item">LinkedIn</span>
                    </div>
                  </div>
                </div>

                {/* Visual Editorial Layout */}
                <div className="premium-editorial-collage">
                  <div className="collage-bg-glow" />
                  
                  <div className="image-wrapper-large">
                    <img src={media.candidate} alt="Premium Professional Candidate" className="collage-img portrait" />
                    <div className="img-glossy-overlay" />
                    <div className="candidate-status-badge">
                      <span className="pulse-dot" /> Candidate Active
                    </div>
                  </div>

                  <div className="image-wrapper-medium">
                    <img src={media.teamwork} alt="Collaborative Hiring Session" className="collage-img teamwork" />
                    <div className="img-glossy-overlay" />
                  </div>

                  {/* Floating Analytics Card */}
                  <div className="floating-analytics-card">
                    <div className="analytics-header">
                      <Sparkles size={13} className="spark-green" />
                      <span>Smart AI Matching</span>
                    </div>
                    <div className="match-score">98%</div>
                    <div className="match-bar-container">
                      <div className="match-bar-fill" style={{ width: '98%' }} />
                    </div>
                    <span className="match-meta">Skills alignment verified</span>
                  </div>

                  {/* Hiring Growth Graph Card */}
                  <div className="hiring-graph-card">
                    <div className="graph-header">
                      <span>Placements</span>
                      <strong className="green-text">+24% MoM</strong>
                    </div>
                    <div className="mini-chart-container">
                      <ResponsiveContainer width="100%" height={60}>
                        <AreaChart data={miniChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <defs>
                            <linearGradient id="editorialChart" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="placements" stroke="#10b981" strokeWidth={2} fill="url(#editorialChart)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Premium Floating Badge Stats */}
                  <div className="stats-badge-overlap badge-placement">
                    <strong>94%</strong>
                    <span>Placement Success</span>
                  </div>
                  
                  <div className="stats-badge-overlap badge-speed">
                    <strong>60-70%</strong>
                    <span>Faster Hiring</span>
                  </div>

                  <div className="stats-badge-overlap badge-jobs">
                    <strong>10K+</strong>
                    <span>Active Jobs</span>
                  </div>
                </div>
              </div>
              
              {/* Right Side: Luxury Job Cards */}
              <div className="recruitment-right-jobs">
                <div className="jobs-panel-header">
                  <h3>Featured Premium Roles</h3>
                  <p>Hand-picked roles from top employers updated in real-time</p>
                </div>
                
                <div className="luxury-jobs-list">
                  {loading ? (
                    <div className="loading-jobs">Loading featured jobs...</div>
                  ) : featuredJobs.length > 0 ? (
                    featuredJobs.map((job) => {
                      const isSaved = savedJobs.includes(job._id);
                      const logoBg = 'linear-gradient(135deg, #059669, #10b981)';
                      const logoText = job.companyName?.substring(0, 2).toUpperCase() || 'JK';
                      const salary = job.salaryMin && job.salaryMax 
                        ? `LKR ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                        : 'Salary not specified';
                      const experience = job.experienceLevel 
                        ? `${job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level`
                        : 'Experience not specified';
                      const hasLogo = job.image && job.image.url;
                      
                      return (
                        <article className="premium-enterprise-card" key={job._id}>
                          <div className="card-top">
                            <div className="company-logo-wrap" style={{ background: hasLogo ? 'transparent' : logoBg }}>
                              {hasLogo ? (
                                <img src={job.image.url} alt={job.image.alt || job.companyName} className="company-logo-img" />
                              ) : (
                                logoText
                              )}
                            </div>
                            <div className="job-title-info">
                              <span className="card-company-name">{job.companyName}</span>
                              <h4 className="card-job-title">{job.title}</h4>
                            </div>
                            <button 
                              className={`save-job-btn ${isSaved ? 'is-saved' : ''}`}
                              onClick={() => handleSaveJob(job._id)}
                              aria-label={isSaved ? "Unsave Job" : "Save Job"}
                            >
                              <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                          </div>

                          <div className="card-details">
                            <div className="detail-tag"><MapPin size={13} /> {job.location}</div>
                            <div className="detail-tag"><DollarSign size={13} /> {salary}</div>
                            <div className="detail-tag"><Clock size={13} /> {experience}</div>
                          </div>

                          <div className="card-bottom">
                            <div className="badges-group">
                              <span className="badge-type">{job.jobType}</span>
                              <span className="badge-workplace">{job.remoteFriendly ? 'Remote' : 'Onsite'}</span>
                            </div>
                            
                            <Button as={Link} to={`/jobs/${job.slug}`} size="sm" className="card-apply-btn">
                              Apply Now <ArrowRight size={13} />
                            </Button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="no-jobs">No featured jobs available at the moment.</div>
                  )}
                </div>
                
                <div className="view-all-jobs-container">
                  <Button as={Link} to="/jobs" className="view-all-jobs-luxury-btn">
                    View All Opportunities <ArrowRight size={18} />
                  </Button>
                </div>
              </div>

            </div>
          </div>
          
          {/* Top Companies Hiring Ribbon */}
          <div className="top-companies-ribbon">
            <span className="ribbon-title">TOP COMPANIES HIRING NOW</span>
            <div className="ribbon-slider">
              <div className="ribbon-track">
                <span>Google</span>
                <span>Microsoft</span>
                <span>Amazon</span>
                <span>LinkedIn</span>
                <span>Meta</span>
                <span>Stripe</span>
                <span>Apple</span>
                <span>Framer</span>
                <span>Google</span>
                <span>Microsoft</span>
                <span>Amazon</span>
                <span>LinkedIn</span>
              </div>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="bottom-premium-cta-banner">
            <div className="banner-glow" />
            <div className="banner-content">
              <h3>Ready to find your dream career?</h3>
              <p>Create an account to get matched with exclusive roles and start your applications.</p>
              <Button as={Link} to="/candidate/register" size="lg" className="banner-primary-btn">
                Create Free Account <ArrowRight size={17} />
              </Button>
            </div>
          </div>
          
        </div>
      </section>

      <PremiumDualCardSection onCvClick={handleCvClick} onEmployerClick={handleEmployerClick} />

      <section className="process-section">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Recruitment Process</p>
              <h2>Structured hiring from requirement to onboarding</h2>
              <p>Our workflow keeps employers, candidates, and recruiters aligned at each decision point.</p>
            </div>
          </div>
          <div className="process-timeline">
            {recruitmentProcess.map((step, index) => (
              <article className="process-step" key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="industry-section">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Industry Expertise</p>
              <h2>Recruitment coverage across key business sectors</h2>
              <p>HEXORA TALENT supports specialist and volume hiring across high-demand industries.</p>
            </div>
          </div>
          <div
            className="industry-grid"
            ref={industryCarouselRef}
            role="region"
            aria-label="Industry expertise carousel"
            tabIndex={0}
            onKeyDown={handleIndustryKeyDown}
            onPointerDown={handleIndustryPointerDown}
            onPointerMove={handleIndustryPointerMove}
            onPointerUp={stopIndustryDrag}
            onPointerCancel={stopIndustryDrag}
            onPointerLeave={stopIndustryDrag}
          >
            {industries.map((industry) => (
              <span className="industry-card" key={industry} tabIndex={0}><CheckCircle2 size={17} /> {industry}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="corporate-section">
        <div className="shell corporate-grid">
          <div>
            <p className="home-eyebrow">About HEXORA GLOBAL GROUP</p>
            <h2 className="corporate-light-heading">A diversified corporate group driving excellence across industries</h2>
            <p>
              HEXORA GLOBAL GROUP (PVT) LTD operates through five strategic business divisions, each focused on
              delivering excellence in their domain while contributing to the group's overall success.
            </p>
            <div className="corporate-icons-row">
              <span className="corporate-icon-item"><Users size={20} /></span>
              <span className="corporate-icon-item"><Globe2 size={20} /></span>
              <span className="corporate-icon-item"><Utensils size={20} /></span>
              <span className="corporate-icon-item"><Briefcase size={20} /></span>
              <span className="corporate-icon-item"><Building2 size={20} /></span>
            </div>
            <div className="vision-mission-grid">
              <div className="vision-card">
                <h3>Our Vision</h3>
                <p>To be a leading diversified business group recognized for excellence, innovation, and sustainable growth across multiple industries.</p>
              </div>
              <div className="mission-card">
                <h3>Our Mission</h3>
                <p>To deliver exceptional value through our specialized divisions, connecting talent with opportunity, businesses with solutions, and markets with products.</p>
              </div>
            </div>
          </div>
          <div className="corporate-divisions-grid">
            <aside className="corporate-note corporate-note-talent">
              <div className="corporate-note-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85)' }} />
              <div className="corporate-note-content">
                <strong>Primary Division</strong>
                <h3>HEXORA TALENT</h3>
                <p>Recruitment, staffing, talent acquisition, workforce solutions, and job portal services.</p>
              </div>
            </aside>
            <aside className="corporate-note corporate-note-hr">
              <div className="corporate-note-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=85)' }} />
              <div className="corporate-note-content">
                <strong>HR Consulting</strong>
                <h3>HEXORA HR CONSULTING</h3>
                <p>Strategic HR advisory, policy guidance, talent planning, and people operations support.</p>
              </div>
            </aside>
            <aside className="corporate-note corporate-note-trade">
              <div className="corporate-note-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=85)' }} />
              <div className="corporate-note-content">
                <strong>Global Trade</strong>
                <h3>HEXORA GLOBAL TRADE</h3>
                <p>International sourcing, procurement, import/export coordination, and trade partnerships.</p>
              </div>
            </aside>
            <aside className="corporate-note corporate-note-foods">
              <div className="corporate-note-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=85)' }} />
              <div className="corporate-note-content">
                <strong>Food Products</strong>
                <h3>HEXORA FOODS</h3>
                <p>Food-related business initiatives focused on product opportunities and distribution.</p>
              </div>
            </aside>
            <aside className="corporate-note corporate-note-solutions">
              <div className="corporate-note-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=85)' }} />
              <div className="corporate-note-content">
                <strong>Business Solutions</strong>
                <h3>HEXORA BUSINESS SOLUTIONS</h3>
                <p>Business support services for operations, communication, and commercial execution.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="clients-section">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Clients</p>
              <h2>Built for employers across growing sectors</h2>
            </div>
          </div>
          <div className="client-strip">
            {clients.map((client) => <span key={client}>{client}</span>)}
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="shell testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <div className="rating-line" aria-label="Five star rating">
                {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} fill="currentColor" />)}
              </div>
              <p>&quot;{testimonial.quote}&quot;</p>
              <strong>{testimonial.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta" id="contact">
        <div className="cta-pattern" />
        <img className="cta-person cta-left" src={media.ctaLeft} alt="Business professionals collaborating" />
        <img className="cta-person cta-right" src={media.ctaRight} alt="Global team working together" />
        <div className="floating-stat cta-stat-left"><Building2 size={17} /> 5 Divisions</div>
        <div className="floating-stat cta-stat-right"><strong>25K+</strong> Professionals</div>
        <div className="shell final-cta-inner">
          <h2>Ready to explore opportunities with HEXORA GLOBAL GROUP?</h2>
          <p>
            Discover how our five strategic divisions can support your business growth or career journey.
            From recruitment to global trade, we deliver excellence across industries.
          </p>
          <div>
            <Button onClick={() => document.getElementById('divisions-section')?.scrollIntoView({ behavior: 'smooth' })} size="lg">Explore Our Divisions <ArrowRight size={18} /></Button>
            <Button as={Link} to="/contact" variant="ghost" size="lg">Partner With Us <Briefcase size={17} /></Button>
            <Button as={Link} to="/contact" variant="ghost" size="lg">Contact Group <MessageCircle size={17} /></Button>
          </div>
          <address className="contact-mini">
            <span><Phone size={15} /> {siteContent.contact.phonePrimary}</span>
            <span><Mail size={15} /> {siteContent.contact.email}</span>
          </address>
        </div>
      </section>
    </>
  );
}

function TradeList({ title, items }) {
  const icons = {
    Services: Globe2,
    'Product Categories': FileCheck2,
    Benefits: BadgeCheck
  };
  const TradeIcon = icons[title] || CheckCircle2;

  return (
    <div className="trade-list">
      <h3>
        <span className="trade-list-icon" aria-hidden="true">
          <TradeIcon size={24} strokeWidth={2.2} />
        </span>
        {title}
      </h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
