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
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import { siteContent } from '../../data/siteContent';
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
  { value: '250+', label: 'Active Openings', icon: Briefcase },
  { value: '120+', label: 'Hiring Partners', icon: Building2 },
  { value: '15K+', label: 'Candidate Profiles', icon: UserCheck },
  { value: '10+', label: 'Industry Verticals', icon: Globe2 }
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
  { title: 'Software Engineer', type: 'Full-time', location: 'Colombo / Hybrid', department: 'Information Technology' },
  { title: 'HR Executive', type: 'Full-time', location: 'Colombo', department: 'Human Resources' },
  { title: 'Accountant', type: 'Full-time', location: 'Kandy', department: 'Banking & Finance' },
  { title: 'Marketing Executive', type: 'Full-time', location: 'Colombo', department: 'Marketing' },
  { title: 'Sales Executive', type: 'Full-time', location: 'Islandwide', department: 'Sales' },
  { title: 'Civil Engineer', type: 'Contract', location: 'Project Based', department: 'Engineering' },
  { title: 'Customer Service Executive', type: 'Full-time', location: 'Colombo', department: 'Customer Experience' }
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
    title: 'HEXORA HR CONSULTING',
    text: 'Strategic HR advisory, policy guidance, talent planning, and people operations support for growing organizations.'
  },
  {
    title: 'HEXORA GLOBAL TRADE',
    text: 'International sourcing, procurement, import/export coordination, and trade partnership development.'
  },
  {
    title: 'HEXORA FOODS',
    text: 'Food-related business initiatives focused on product opportunities, distribution partnerships, and market growth.'
  },
  {
    title: 'HEXORA BUSINESS SOLUTIONS',
    text: 'Business support services that help companies improve operations, communication, and commercial execution.'
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

  return (
    <>
      <Seo
        title="HEXORA TALENT | Recruitment & Workforce Solutions"
        description="HEXORA TALENT by HEXORA GLOBAL GROUP delivers recruitment, staffing, talent acquisition, and workforce solutions for employers and job seekers."
      />

      <section className="home-hero">
        <img className="hero-fallback" src={media.heroFallback} alt="" aria-hidden="true" />
        <video className="hero-video" autoPlay muted loop playsInline poster={media.heroFallback}>
          <source src={media.heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay" />

        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow"><Users size={16} /> HEXORA TALENT</p>
            <h1>Recruitment & Workforce Solutions for Growing Businesses</h1>
            <p>
              HEXORA TALENT is the primary recruitment division of HEXORA GLOBAL GROUP (PVT) LTD,
              connecting companies with qualified professionals through staffing, talent acquisition,
              workforce planning, and candidate placement support.
            </p>
            <div className="home-hero-actions">
              <Button as={Link} to="#current-openings" size="lg">Find Jobs <ArrowRight size={18} /></Button>
              <Button as={Link} to="#cv-upload" variant="secondary" size="lg">Upload CV <UploadCloud size={18} /></Button>
              <Button as={Link} to="#employer-requirements" variant="ghost" size="lg">Hire Talent <Briefcase size={18} /></Button>
              <Button as={Link} to="/contact" variant="ghost" size="lg">Contact Us <MessageCircle size={17} /></Button>
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
            <p className="home-eyebrow">Why Choose HEXORA TALENT</p>
            <h2>Focused recruitment support built around business outcomes</h2>
            <p className="section-copy">
              We help employers hire with confidence and help professionals access meaningful opportunities
              across specialist, operational, technical, and commercial roles.
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
            <span className="ai-pill">Talent Acquisition Engine</span>
            <div className="ai-orbit">
              <span className="ai-orb" />
              <span className="orbit-dot dot-a" />
              <span className="orbit-dot dot-b" />
              <span className="orbit-dot dot-c" />
            </div>
            <div className="ai-side-card side-left"><FileCheck2 size={20} /> CV Screening</div>
            <div className="ai-side-card side-right"><BadgeCheck size={20} /> Employer Matching</div>
            <div className="accuracy-card">
              <strong>Shortlists aligned to role, skill, and culture</strong>
            </div>
            <div className="ai-actions">
              <Button as={Link} to="#current-openings">See open positions <ArrowRight size={16} /></Button>
              <Button as={Link} to="#employer-requirements" variant="secondary">Request candidates</Button>
            </div>
            <a className="whatsapp-support" href={`https://wa.me/${siteContent.contact.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle size={17} /> WhatsApp support available
            </a>
          </aside>
        </div>
      </section>

      <section className="media-jobs-section" id="current-openings">
        <div className="shell media-jobs-grid">
          <div className="image-collage">
            <div className="image-card tall">
              <img src={media.candidate} alt="Professional candidate" />
              <span className="image-badge"><BadgeCheck size={15} /> Candidate Ready</span>
            </div>
            <div className="image-card">
              <img src={media.teamwork} alt="Recruitment teamwork session" />
            </div>
            <div className="placement-card">
              <small>Recruitment Focus</small>
              <strong>60-70%</strong>
              <span>Homepage emphasis on talent solutions</span>
              <div className="growth-spark" />
            </div>
            <div className="image-card">
              <img src={media.employer} alt="Employer reviewing candidate profiles" />
            </div>
          </div>

          <div className="job-highlights">
            <p className="home-eyebrow">Current Openings</p>
            <h2>Professional job opportunities through HEXORA TALENT</h2>
            <div className="rating-line" aria-label="Five star rating">
              {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={17} fill="currentColor" />)}
            </div>
            <p>Explore sample openings across technology, finance, HR, sales, marketing, engineering, and customer support.</p>

            <div className="job-listing-grid">
              {sampleJobs.map((job) => (
                <article className="opening-card" key={job.title}>
                  <div>
                    <span className="company-mark">HX</span>
                    <div>
                      <small>{job.department}</small>
                      <h3>{job.title}</h3>
                      <p><MapPin size={14} /> {job.location}</p>
                    </div>
                  </div>
                  <footer>
                    <span>{job.type}</span>
                    <Button as={Link} to="/jobs" size="sm">Apply Now</Button>
                  </footer>
                </article>
              ))}
            </div>

            <Button as={Link} to="/jobs" className="browse-jobs-btn">View All Jobs <ArrowRight size={17} /></Button>
          </div>
        </div>
      </section>

      <section className="forms-section">
        <div className="shell forms-grid">
          <article className="talent-form-card" id="cv-upload">
            <p className="home-eyebrow"><UploadCloud size={16} /> Candidate Registration</p>
            <h2>Upload Your CV</h2>
            <p>Share your profile with HEXORA TALENT and our recruitment team will review suitable openings.</p>
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <Button onClick={handleCvClick} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
                Upload Your CV <ArrowRight size={16} />
              </Button>
            </div>
          </article>

          <article className="talent-form-card" id="employer-requirements">
            <p className="home-eyebrow"><Briefcase size={16} /> Employer Hiring Request</p>
            <h2>Employer Requirement Form</h2>
            <p>Tell us what role you need to fill and HEXORA TALENT will help build a qualified shortlist.</p>
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <Button onClick={handleEmployerClick} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
                Employer Requirement Form <ArrowRight size={16} />
              </Button>
            </div>
          </article>
        </div>
      </section>

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
          <div className="industry-grid">
            {industries.map((industry) => (
              <span key={industry}><CheckCircle2 size={17} /> {industry}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="corporate-section">
        <div className="shell corporate-grid">
          <div>
            <p className="home-eyebrow">About HEXORA GLOBAL GROUP</p>
            <h2>A diversified corporate group led by recruitment excellence</h2>
            <p>
              HEXORA GLOBAL GROUP (PVT) LTD operates through focused business divisions, with HEXORA TALENT
              serving as the company&apos;s primary revenue-generating recruitment and workforce solutions arm.
              The group also supports clients through HR consulting, global trade, foods, and business solutions.
            </p>
          </div>
          <aside className="corporate-note">
            <strong>Primary Division</strong>
            <h3>HEXORA TALENT</h3>
            <p>Recruitment, staffing, talent acquisition, workforce solutions, and job portal services.</p>
          </aside>
        </div>
      </section>

      <section className="divisions-section">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Business Divisions</p>
              <h2>Supporting divisions under HEXORA GLOBAL GROUP</h2>
              <p>These divisions remain visible as part of the wider corporate ecosystem.</p>
            </div>
          </div>

          <div className="division-grid">
            {divisions.map((division) => (
              <article className="division-card" key={division.title}>
                <span><Building2 size={21} /></span>
                <h3>{division.title}</h3>
                <p>{division.text}</p>
              </article>
            ))}
          </div>

          <article className="global-trade-card">
            <div>
              <p className="home-eyebrow"><Globe2 size={16} /> HEXORA GLOBAL TRADE</p>
              <h2>International Trade & Supply Chain Solutions</h2>
              <p>
                HEXORA GLOBAL TRADE supports businesses in sourcing, importing, exporting, and distributing
                products across international markets. We help organizations build reliable supply chains,
                identify qualified suppliers, and expand global business opportunities through strategic trade partnerships.
              </p>
            </div>
            <div className="trade-columns">
              <TradeList title="Services" items={globalTradeServices} />
              <TradeList title="Product Categories" items={globalTradeProducts} />
              <TradeList title="Benefits" items={globalTradeBenefits} />
            </div>
          </article>
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
        <img className="cta-person cta-left" src={media.ctaLeft} alt="Recruiter working with candidates" />
        <img className="cta-person cta-right" src={media.ctaRight} alt="Professional candidate smiling" />
        <div className="floating-stat cta-stat-left"><Users size={17} /> Talent shortlists ready</div>
        <div className="floating-stat cta-stat-right"><strong>250+</strong> Open Positions</div>
        <div className="shell final-cta-inner">
          <h2>Ready to find talent or your next career opportunity?</h2>
          <p>
            Contact HEXORA TALENT for recruitment support, candidate registration, employer requirements,
            and workforce solutions under HEXORA GLOBAL GROUP.
          </p>
          <div>
            <Button as={Link} to="#current-openings" size="lg">Find Jobs <ArrowRight size={18} /></Button>
            <Button as={Link} to="#employer-requirements" variant="ghost" size="lg">Hire Talent <Briefcase size={17} /></Button>
            <Button as={Link} to="/contact" variant="ghost" size="lg">Contact Us <MessageCircle size={17} /></Button>
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
  return (
    <div className="trade-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
