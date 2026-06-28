import { useEffect, useRef, useState } from 'react';
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
  MessageCircle,
  Phone,
  SearchCheck,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import { siteContent } from '../../data/siteContent';
import PremiumDualCardSection from '../../components/home/PremiumDualCardSection';
import Carousel from '../../components/home/Carousel';
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

const corporateDivisions = [
  {
    label: 'Primary Division',
    title: 'HEXORA TALENT',
    text: 'Recruitment, staffing, talent acquisition, workforce solutions, and job portal services.',
    className: 'corporate-note-talent',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85',
  },
  {
    label: 'HR Consulting',
    title: 'HEXORA HR CONSULTING',
    text: 'Strategic HR advisory, policy guidance, talent planning, and people operations support.',
    className: 'corporate-note-hr',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=85',
  },
  {
    label: 'Global Trade',
    title: 'HEXORA GLOBAL TRADE',
    text: 'International sourcing, procurement, import/export coordination, and trade partnerships.',
    className: 'corporate-note-trade',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=85',
  },
  {
    label: 'Food Products',
    title: 'HEXORA FOODS',
    text: 'Food-related business initiatives focused on product opportunities and distribution.',
    className: 'corporate-note-foods',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=85',
  },
  {
    label: 'Business Solutions',
    title: 'HEXORA BUSINESS SOLUTIONS',
    text: 'Business support services for operations, communication, and commercial execution.',
    className: 'corporate-note-solutions',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=85',
  },
];

function CorporateDivisionsCarousel({ cards }) {
  const startIndex = cards.length + 2;
  const carouselRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(startIndex);
  const [isResetting, setIsResetting] = useState(false);
  const [metrics, setMetrics] = useState({ cardWidth: 180, gap: 16, viewportWidth: 980 });
  const carouselCards = [...cards, ...cards, ...cards];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTrackIndex((current) => current + 1);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [cards.length]);

  useEffect(() => {
    const updateMetrics = () => {
      if (!carouselRef.current) return;

      const viewportWidth = carouselRef.current.getBoundingClientRect().width;
      const visibleCards = viewportWidth <= 620 ? 1 : viewportWidth <= 1100 ? 3 : 5;
      const gap = viewportWidth <= 620 ? 12 : 16;
      const cardWidth = (viewportWidth - gap * (visibleCards - 1)) / visibleCards;

      setMetrics({ cardWidth, gap, viewportWidth });
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);

    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  const getPosition = (index) => {
    const half = Math.floor(cards.length / 2);
    let position = index - (trackIndex % cards.length);

    if (position > half) position -= cards.length;
    if (position < -half) position += cards.length;

    return position;
  };

  const handleTransitionEnd = () => {
    if (trackIndex < cards.length * 2) return;

    setIsResetting(true);
    setTrackIndex(cards.length + (trackIndex % cards.length));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsResetting(false));
    });
  };

  const trackOffset = (metrics.viewportWidth / 2)
    - (metrics.cardWidth / 2)
    - (trackIndex * (metrics.cardWidth + metrics.gap));

  return (
    <div className="corporate-divisions-grid corporate-divisions-carousel" ref={carouselRef} aria-label="HEXORA business divisions carousel">
      <div
        className={`corporate-carousel-track${isResetting ? ' is-resetting' : ''}`}
        style={{
          '--corporate-card-width': `${metrics.cardWidth}px`,
          '--corporate-card-gap': `${metrics.gap}px`,
          transform: `translate3d(${trackOffset}px, 0, 0)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {carouselCards.map((card, index) => {
          const originalIndex = index % cards.length;
          const position = getPosition(originalIndex);
          const distance = Math.abs(position);
          const isActive = index === trackIndex;
          const scale = isActive ? 1.18 : distance === 1 ? 0.94 : 0.88;
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.72 : 0.48;
          const yOffset = distance === 0 ? '-14px' : distance === 1 ? '8px' : '20px';
          const blur = distance === 0 ? '0px' : distance === 1 ? '0.2px' : '0.8px';
          const saturation = distance === 0 ? 1.18 : distance === 1 ? 0.9 : 0.76;
          const brightness = distance === 0 ? 1.08 : distance === 1 ? 0.94 : 0.88;

          return (
            <aside
              className={`corporate-note ${card.className} corporate-carousel-card${isActive ? ' is-active' : ''}${distance === 1 ? ' is-near' : ''}${distance > 1 ? ' is-far' : ''}`}
              key={`${card.title}-${index}`}
              style={{
                '--position': `${position}`,
                '--distance': `${distance}`,
                '--scale': `${scale}`,
                '--card-opacity': `${opacity}`,
                '--y-offset': yOffset,
                '--soft-blur': blur,
                '--z-offset': `${(2 - distance) * 28}px`,
                '--rotate-y': `${position * -4.5}deg`,
                '--bg-scale': `${1.04 + (2 - distance) * 0.035}`,
                '--saturate': `${saturation}`,
                '--brightness': `${brightness}`,
              }}
            >
              <div className="corporate-note-bg" style={{ backgroundImage: `url(${card.image})` }} />
              <div className="corporate-note-content">
                <strong>{card.label}</strong>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </aside>
          );
        })}
      </div>
    </div>
  );
}

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
  const industryCarouselRef = useRef(null);
  const industryDrag = useRef({ active: false, startX: 0, scrollLeft: 0 });

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

          <Carousel cards={divisions} />
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
          <CorporateDivisionsCarousel cards={corporateDivisions} />
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
