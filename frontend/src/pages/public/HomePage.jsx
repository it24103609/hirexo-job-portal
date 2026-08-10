import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Globe2,
  Heart,
  Mail,
  MessageCircle,
  Phone,
  Star,
  TrendingUp,
  Users,
  Utensils
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import { siteContent } from '../../data/siteContent';
import DivisionSystem from '../../components/home/DivisionSystem';
import corporateTeamImage from '../../assets/home/T22.png';
import './HomePage.css';

const media = {
  heroVideo: '/hero-video.mp4',
  heroFallback: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85',
  ctaLeft: 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?auto=format&fit=crop&w=760&q=85',
  ctaRight: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=760&q=85'
};

const groupStrengths = [
  {
    title: 'Diversified Expertise',
    text: 'Each division is built around a clear market need, while the group shares a common standard of quality.',
    icon: BadgeCheck
  },
  {
    title: 'One Connected Ecosystem',
    text: 'Our businesses work independently, but benefit from shared systems, strategy, and support.',
    icon: Building2
  },
  {
    title: 'People and Partnership Driven',
    text: 'We believe strong relationships create better business outcomes across clients, teams, and markets.',
    icon: Users
  },
  {
    title: 'Growth Focused',
    text: 'From talent to trade, we pursue opportunities that create sustainable, long-term value.',
    icon: TrendingUp
  }
];

const divisionPillars = [
  {
    title: 'HEXORA TALENT',
    text: 'Recruitment and staffing solutions for organizations that need the right people at the right time.',
    icon: Users
  },
  {
    title: 'HEXORA HR CONSULTING',
    text: 'HR advisory, payroll support, outsourcing, and compliance solutions for modern teams.',
    icon: Heart
  },
  {
    title: 'HEXORA GLOBAL TRADE',
    text: 'Import, export, sourcing, and international market support for expanding business reach.',
    icon: Globe2
  },
  {
    title: 'HEXORA FOODS',
    text: 'Consumer food products designed with quality, consistency, and brand value in mind.',
    icon: Utensils
  },
  {
    title: 'HEXORA BUSINESS SOLUTIONS',
    text: 'Business consulting and digital support services that help organizations scale with clarity.',
    icon: Briefcase
  }
];

const groupOutcomes = [
  {
    title: 'Stronger hiring pipelines',
    description: 'HEXORA TALENT helps employers move from brief to shortlist with structure and speed.',
    icon: Users,
    metric: 'Talent',
    label: 'focus'
  },
  {
    title: 'Better operational support',
    description: 'HEXORA HR CONSULTING is designed to reduce admin load and improve workforce processes.',
    icon: Heart,
    metric: 'HR',
    label: 'support'
  },
  {
    title: 'Commercial expansion',
    description: 'HEXORA GLOBAL TRADE opens pathways for sourcing, supply, and market reach.',
    icon: Globe2,
    metric: 'Trade',
    label: 'growth'
  },
  {
    title: 'New product and service value',
    description: 'HEXORA FOODS and HEXORA BUSINESS SOLUTIONS extend the group into new markets.',
    icon: Building2,
    metric: 'Group',
    label: 'expansion'
  }
];

const testimonials = [
  {
    quote: 'HEXORA feels like a structured group partner, not just a service vendor.',
    name: 'Business Partner'
  },
  {
    quote: 'The group positioning is clear, premium, and easy to understand across all divisions.',
    name: 'Client Stakeholder'
  }
];

export default function HomePage() {
  return (
    <>
      <Seo
        title="HEXORA GLOBAL GROUP | Diversified Business Ecosystem"
        description="HEXORA GLOBAL GROUP is a diversified business group with 5 divisions spanning talent, HR consulting, global trade, foods, and business solutions."
      />

      <section className="home-hero">
        <img className="hero-fallback" src={media.heroFallback} alt="" aria-hidden="true" />
        <video className="hero-video" autoPlay muted loop playsInline poster={media.heroFallback}>
          <source src={media.heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay" />

        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <h1 className="hero-main-heading">HEXORA GLOBAL GROUP (PVT) LTD</h1>
            <h3 className="hero-subheading">One Group. Multiple Businesses. Global Opportunities.</h3>
            <p className="hero-description">
              A diversified Sri Lankan business group building and operating businesses across talent, human
              resources, trade, consumer products, and business solutions.
            </p>
            <div className="hero-separator" />
            <div className="home-hero-actions">
              <Button
                onClick={() => document.getElementById('divisions-section')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
              >
                Explore Divisions <ArrowRight size={18} />
              </Button>
              <Button as={Link} to="/contact" variant="ghost" size="lg">
                Partner With Us <MessageCircle size={17} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <DivisionSystem />

      <section className="why-section">
        <div className="shell why-grid">
          <div>
            <p className="home-eyebrow">Why HEXORA</p>
            <h2>Building success across a diversified business ecosystem</h2>
            <p className="section-copy">
              HEXORA GLOBAL GROUP creates value through specialized divisions that work with one shared standard:
              practical execution, trusted partnerships, and long-term growth.
            </p>
            <div className="feature-grid">
              {groupStrengths.map(({ title, text, icon: Icon }) => (
                <article className="feature-card" key={title}>
                  <span>
                    <Icon size={20} />
                  </span>
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
            <div className="ai-side-card side-left">
              <Building2 size={20} /> 5 Divisions
            </div>
            <div className="ai-side-card side-right">
              <Globe2 size={20} /> Global Reach
            </div>
            <div className="accuracy-card">
              <strong>Integrated business solutions across industries</strong>
            </div>
            <div className="ai-actions">
              <Button
                onClick={() => document.getElementById('divisions-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Divisions <ArrowRight size={16} />
              </Button>
              <Button as={Link} to="/contact" variant="secondary">
                Partner With Us
              </Button>
            </div>
            <a className="whatsapp-support" href={`https://wa.me/${siteContent.contact.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle size={17} /> WhatsApp support available
            </a>
          </aside>
        </div>
      </section>

      <section className="corporate-section" id="divisions-section">
        <div className="shell corporate-grid">
          <div>
            <p className="home-eyebrow">About HEXORA GLOBAL GROUP</p>
            <h2 className="corporate-light-heading">A diversified corporate group driving excellence across industries</h2>
            <p>
              HEXORA GLOBAL GROUP operates through five strategic business divisions, each focused on delivering
              excellence in its own market while contributing to the group's overall strength.
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
                <p>
                  To be a leading diversified business group recognized for excellence, innovation, and sustainable
                  growth across multiple industries.
                </p>
              </div>
              <div className="mission-card">
                <h3>Our Mission</h3>
                <p>
                  To deliver exceptional value through our specialized divisions, connecting talent, products,
                  services, and market opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="corporate-visual" aria-hidden="true">
            <img src={corporateTeamImage} alt="" />
          </div>

          <div className="client-strip">
            {['Talent Solutions', 'HR Support', 'Global Trade', 'Foods', 'Business Advisory', 'Digital Services'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="success-stories-section" aria-labelledby="success-stories-title">
        <div className="success-ambient success-ambient-left" aria-hidden="true" />
        <div className="success-ambient success-ambient-right" aria-hidden="true" />
        <div className="shell success-stories-shell">
          <div className="success-stories-header">
            <p className="home-eyebrow">Proven Outcomes</p>
            <h2 id="success-stories-title">Our Group Impact</h2>
            <p>Each division supports growth through focused delivery and clear outcomes.</p>
          </div>

          <div className="success-stories-grid">
            {groupOutcomes.map(({ title, description, icon: Icon, metric, label }) => (
              <article className="success-story-card" key={title}>
                <div className="success-card-visual" aria-hidden="true">
                  <div className="success-visual-orbit">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="success-visual-icon">
                    <Icon size={34} strokeWidth={1.8} />
                  </div>
                  <div className="success-visual-metric">
                    <strong>{metric}</strong>
                    <span>{label}</span>
                  </div>
                </div>
                <div className="success-card-copy">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="shell testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <div className="rating-line" aria-label="Five star rating">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
              <p>"{testimonial.quote}"</p>
              <strong>{testimonial.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta" id="contact">
        <div className="cta-pattern" />
        <img className="cta-person cta-left" src={media.ctaLeft} alt="Business professionals collaborating" />
        <img className="cta-person cta-right" src={media.ctaRight} alt="Global team working together" />
        <div className="floating-stat cta-stat-left">
          <Building2 size={17} /> 5 Divisions
        </div>
        <div className="floating-stat cta-stat-right">
          <strong>One</strong> Group
        </div>
        <div className="shell final-cta-inner">
          <h2>Ready to explore opportunities with HEXORA GLOBAL GROUP?</h2>
          <p>
            Discover how our five strategic divisions can support your business growth or partnership goals.
            From talent to trade, we deliver value across industries.
          </p>
          <div>
            <Button
              onClick={() => document.getElementById('divisions-section')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
            >
              Explore Our Divisions <ArrowRight size={18} />
            </Button>
            <Button as={Link} to="/contact" variant="ghost" size="lg">
              Partner With Us <Briefcase size={17} />
            </Button>
            
          </div>
          <address className="contact-mini">
            <span>
              <Phone size={15} /> {siteContent.contact.phonePrimary}
            </span>
            <span>
              <Mail size={15} /> {siteContent.contact.email}
            </span>
          </address>
        </div>
      </section>
    </>
  );
}
