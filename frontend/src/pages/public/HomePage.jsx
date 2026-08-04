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
  Users,
  Utensils,
  Sparkles,
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

const talentFeatures = [
  {
    title: 'Professional Expertise',
    text: 'Our team brings industry knowledge and practical experience across multiple sectors.',
    icon: BadgeCheck
  },
  {
    title: 'Trusted Partnerships',
    text: 'We focus on building long-term relationships based on transparency and trust.',
    icon: Users
  },
  {
    title: 'Customized Solutions',
    text: 'Every business is unique. We tailor our solutions to meet your specific requirements.',
    icon: Sparkles
  },
  {
    title: 'Global Perspective',
    text: 'We help organizations explore opportunities beyond borders through our extensive network.',
    icon: Globe2
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
            <h1 className="hero-main-heading">HEXORA GLOBAL GROUP (PVT) LTD</h1>
            <p className="hero-subheading">A diversified global enterprise delivering talent, trade, HR, food, and business solutions worldwide.</p>
            <div className="hero-separator" />
            <div className="home-hero-actions">
              <Button as={Link} to="/jobs" size="lg">Explore Talent Division <ArrowRight size={18} /></Button>
              <Button onClick={() => document.getElementById('divisions-section')?.scrollIntoView({ behavior: 'smooth' })} variant="secondary" size="lg">View Group Companies <Building2 size={18} /></Button>
              <Button as={Link} to="/contact" variant="ghost" size="lg">Contact Group <MessageCircle size={17} /></Button>
            </div>
          </div>
        </div>
      </section>
      <DivisionSystem />

      <section className="why-section">
        <div className="shell why-grid">
          <div>
            <p className="home-eyebrow">WHY CHOOSE HEXORA</p>
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

      <section className="corporate-section" id="divisions-section">
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

          <div className="corporate-visual" aria-hidden="true">
            <img src={corporateTeamImage} alt="" />
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
