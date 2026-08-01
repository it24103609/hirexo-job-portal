import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Mail,
  Phone,
  Sparkles,
  Star,
  UploadCloud,
  Search
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import servicesHeroVideo from '../../assets/videos/services-hero-bg.mp4';
import './ServicesPage.css';
import './DivisionPage.css';

/**
 * Reusable dedicated page for each HEXORA business division.
 * Renders: video hero, YouTube overview, full division card,
 * industries served, clients, testimonials and CTA.
 */
export default function DivisionPage({ config }) {
  const {
    seoTitle,
    seoDescription,
    badgeLabel,
    title,
    spanTitle,
    tagline,
    icon: Icon,
    accentClass,
    hexoraClass,
    desc,
    text,
    servicesHeading,
    services,
    benefitsHeading,
    benefits,
    actions = [],
    industries = [],
    testimonials = [],
    clients = [],
    overviewPoints = []
  } = config;

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} />

      {/* Hero - background video */}
      <section className="services-hero-shell">
        <video
          className="services-hero-bg"
          src={servicesHeroVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="services-hero-overlay" />

        <div className="shell services-hero-grid">
          <div className="services-hero-copy">
            <span className="services-badge"><Sparkles size={15} /> {badgeLabel}</span>
            <h1>{title} <span>{spanTitle}</span></h1>
            <p className="division-tagline">{tagline}</p>
            <p className="division-desc">{desc}</p>
            <div className="services-hero-ctas">
              <Link to={actions[0]?.link ?? '/contact'} className="services-btn services-btn-primary">
                {actions[0]?.label ?? 'Contact Us'} <ArrowRight size={17} />
              </Link>
              <Link to={actions[1]?.link ?? '/contact'} className="services-btn services-btn-light">
                {actions[1]?.label ?? 'Submit Your Requirement'} <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Overview - YouTube embed */}
      <section className="services-cards-shell" style={{ paddingTop: '2rem' }}>
        <div className="shell">
          <div className="services-section-header">
            <span className="services-section-badge">Overview</span>
            <h2>Watch Our <span>Company Overview</span></h2>
            <p>Learn more about {badgeLabel} and our business divisions.</p>
          </div>
          <div className="services-overview-block">
            <div className="services-video-card services-overview-video" aria-label="HEXORA company overview video">
              <iframe
                src="https://www.youtube.com/embed/Y7cpCDlRfV0"
                title="HEXORA company overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="services-overview-copy">
              <span>About Us</span>
              <h3>A diversified business group delivering excellence</h3>
              <p>
                HEXORA GLOBAL GROUP (PVT) LTD operates through focused business divisions, providing
                comprehensive solutions across multiple industries.
              </p>
              <ul>
                {overviewPoints.map((point) => (
                  <li key={point}><CheckCircle2 size={17} /> {point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Division card */}
      <section className="hexora-divisions-section">
        <div className="shell">
          <div className="services-section-header">
            <h2>OUR <span>{badgeLabel}</span></h2>
          </div>

          <div className={`hexora-division-card ${hexoraClass}`}>
            <div className="hexora-division-header">
              <span className="hexora-division-icon"><Icon size={32} /></span>
              <div>
                <h3>{title} {spanTitle}</h3>
                <p className="hexora-division-tagline">{tagline}</p>
              </div>
            </div>
            <p className="hexora-division-desc">{desc}</p>
            <p className="hexora-division-text">{text}</p>
            <div className="hexora-division-grid">
              <div className="hexora-division-col">
                <h4>{servicesHeading}</h4>
                <ul>
                  {services.map((item) => (
                    <li key={item}><CheckCircle2 size={16} /> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="hexora-division-col">
                <h4>{benefitsHeading}</h4>
                <ul className="hexora-benefits-list">
                  {benefits.map((item) => (
                    <li key={item}><BadgeCheck size={16} /> {item}</li>
                  ))}
                </ul>
                {actions.length > 0 && (
                  <div className="hexora-division-actions">
                    <Button as={Link} to={actions[0].link} variant="secondary" size="sm">
                      {actions[0].label} {actions[0].icon}
                    </Button>
                    <Button as={Link} to={actions[1].link} size="sm">
                      {actions[1].label} {actions[1].icon}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      {industries.length > 0 && (
        <section className="hexora-industries-section">
          <div className="shell">
            <div className="services-section-header">
              <h2>INDUSTRIES WE SERVE</h2>
            </div>
            <div className="hexora-industries-grid">
              {industries.map((industry) => (
                <span key={industry} className="hexora-industry-tag">
                  <CheckCircle2 size={16} /> {industry}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clients Section */}
      {clients.length > 0 && (
        <section className="hexora-clients-section">
          <div className="shell">
            <div className="services-section-header">
              <h2>Trusted by Growing Businesses</h2>
              <p>Partnering with startups, SMEs, and established organizations across various industries.</p>
            </div>
            <div className="hexora-clients-strip">
              {clients.map((client) => (
                <span key={client} className="hexora-client-tag">{client}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="hexora-testimonials-section">
          <div className="shell">
            <div className="services-section-header">
              <h2>What Our Clients Say</h2>
            </div>
            <div className="hexora-testimonials-grid">
              {testimonials.map((testimonial, i) => (
                <div className="hexora-testimonial-card" key={i}>
                  <div className="hexora-stars">
                    {Array.from({ length: 5 }).map((_, idx) => <Star key={idx} size={16} fill="#eab308" color="#eab308" />)}
                  </div>
                  <p>"{testimonial}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="hexora-cta-section">
        <div className="shell hexora-cta-content">
          <h2>Get In Touch</h2>
          <p>Ready to grow your business with HEXORA GLOBAL GROUP?</p>
          <div className="hexora-contact-info">
            <span><Phone size={16} /> +94 77 319 1832</span>
            <span><Mail size={16} /> hrm4921@gmail.com</span>
          </div>
          <p className="hexora-hours">Monday - Friday | 9:00 AM - 6:00 PM</p>
          <Button as={Link} to="/contact" size="lg">Contact Us <ArrowRight size={18} /></Button>
        </div>
      </section>
    </>
  );
}