import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Globe2,
  Heart,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  Utensils
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import servicesHeroVideo from '../../assets/videos/services-hero-bg.mp4';
import groupHeroImage from '../../assets/home/T22.png';
import talentImage from '../../assets/home/talent.png';
import hrImage from '../../assets/home/hr consulting.png';
import tradeImage from '../../assets/home/global trade.png';
import foodsImage from '../../assets/home/foods.png';
import businessImage from '../../assets/home/business solutions.png';
import './ServicesPage.css';

const divisions = [
  {
    id: 'talent',
    title: 'HEXORA TALENT',
    subtitle: 'Talent & Staffing Division',
    image: talentImage,
    icon: Users,
    route: '/companies/talent',
    accent: 'accent-talent',
    description:
      'Recruitment and staffing solutions that connect employers with the right people, at the right time.',
    points: [
      'Permanent recruitment',
      'Executive search',
      'Contract staffing',
      'Talent acquisition support'
    ],
    cta: 'Explore Talent'
  },
  {
    id: 'hr',
    title: 'HEXORA HR CONSULTING',
    subtitle: 'HR & Payroll Support',
    image: hrImage,
    icon: Heart,
    route: '/companies/hr-consulting',
    accent: 'accent-hr',
    description:
      'HR consulting, payroll support, outsourcing, and compliance services built for modern organizations.',
    points: [
      'HR policy support',
      'Payroll management',
      'HR outsourcing',
      'Workforce guidance'
    ],
    cta: 'Coming Soon'
  },
  {
    id: 'trade',
    title: 'HEXORA GLOBAL TRADE',
    subtitle: 'Import, Export & Sourcing',
    image: tradeImage,
    icon: Globe2,
    route: '/companies/global-trade',
    accent: 'accent-trade',
    description:
      'International trade support for businesses looking to source, supply, and expand into new markets.',
    points: [
      'Import and export',
      'Sourcing support',
      'Trade facilitation',
      'Market expansion'
    ],
    cta: 'Coming Soon'
  },
  {
    id: 'foods',
    title: 'HEXORA FOODS',
    subtitle: 'Consumer Products',
    image: foodsImage,
    icon: Utensils,
    route: '/companies/foods',
    accent: 'accent-foods',
    description:
      'Quality consumer food products developed around consistency, trust, and long-term brand value.',
    points: [
      'Food product development',
      'Quality control',
      'Brand building',
      'Consumer market focus'
    ],
    cta: 'Coming Soon'
  },
  {
    id: 'business',
    title: 'HEXORA BUSINESS SOLUTIONS',
    subtitle: 'Business Advisory',
    image: businessImage,
    icon: TrendingUp,
    route: '/companies/business-solutions',
    accent: 'accent-business',
    description:
      'Business consulting and digital support services that help organizations scale with clarity.',
    points: [
      'Business strategy',
      'Process improvement',
      'Market research',
      'Expansion planning'
    ],
    cta: 'Coming Soon'
  }
];

const benefits = [
  {
    icon: BadgeCheck,
    title: 'One Group Structure',
    text: 'Each division has a clear role, while the whole group shares standards and direction.'
  },
  {
    icon: Sparkles,
    title: 'Professional Presentation',
    text: 'The page is built to feel premium, organized, and easy to understand from the first glance.'
  },
  {
    icon: Briefcase,
    title: 'Business-Focused',
    text: 'Visitors can quickly see what each division does and where the group is expanding.'
  }
];

export default function ServicesPage() {
  return (
    <>
      <Seo
        title="Our Businesses | HEXORA GLOBAL GROUP"
        description="Explore the five business divisions of HEXORA GLOBAL GROUP, presented in a green premium layout with clear division visuals."
      />

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
            <span className="services-badge">
              <Sparkles size={15} /> HEXORA GLOBAL GROUP
            </span>
            <h1>Our Businesses, designed as one connected green ecosystem.</h1>
            <p>
              HEXORA GLOBAL GROUP brings together talent, HR support, global trade, foods, and business
              solutions under one premium brand structure.
            </p>
            <p className="services-hero-note">
              Click the name to open the services hub. Use the dropdown to jump into each division.
            </p>
            <div className="services-hero-ctas">
              <Button as={Link} to="/contact" size="lg">
                Partner With Us <MessageCircle size={17} />
              </Button>
              <Button as={Link} to="/about" variant="secondary" size="lg">
                About HEXORA Group <ArrowRight size={17} />
              </Button>
            </div>
          </div>

          <div className="services-hero-visual">
            <div className="services-hero-visual-card">
              <img src={groupHeroImage} alt="HEXORA group visual" />
              
            </div>
          </div>
        </div>
      </section>

      <section className="services-overview-shell">
        <div className="shell">
          <div className="services-section-header">
            <span className="services-section-badge">Overview</span>
            <h2>A single group, with five focused business divisions</h2>
            <p>
              Each division has its own identity and capability, while staying connected to the wider HEXORA
              brand.
            </p>
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
              <h3>Built for growth across industries</h3>
              <p>
                HEXORA GLOBAL GROUP is structured to operate across multiple markets with shared standards,
                premium presentation, and long-term partnership thinking.
              </p>
              <ul>
                <li><CheckCircle2 size={17} /> Talent acquisition and staffing</li>
                <li><CheckCircle2 size={17} /> HR consulting and payroll support</li>
                <li><CheckCircle2 size={17} /> Trade, foods, and business solutions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="services-benefits-shell">
        <div className="shell">
          <div className="services-section-header">
            <h2>Why the structure works</h2>
            <p>Green, clear, and organized around what the group is actually building.</p>
          </div>
          <div className="services-benefits-grid">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article className="services-benefit-card" key={title}>
                <span className="services-benefit-icon"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-divisions-shell">
        <div className="shell">
          <div className="services-section-header">
            <h2>Our Business Divisions</h2>
            <p>Each division now gets its own image, identity, and focused message.</p>
          </div>

          <div className="services-divisions-grid">
            {divisions.map(({ id, title, subtitle, image, icon: Icon, route, accent, description, points, cta }) => (
              <article className={`division-card ${accent}`} key={id}>
                <div className="division-card-image">
                  <img src={image} alt={title} />
                 
                </div>
                <div className="division-card-content">
                  <span className="division-card-kicker">{subtitle}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ul className="division-card-points">
                    {points.map((point) => (
                      <li key={point}><CheckCircle2 size={16} /> {point}</li>
                    ))}
                  </ul>
                  <div className="division-card-actions">
                    <Button as={Link} to={route} variant="secondary" size="sm">
                      {title === 'HEXORA TALENT' ? cta : 'View Division'}
                    </Button>
                    <Button as={Link} to="/contact" size="sm">
                      Contact Group <ArrowRight size={15} />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-final-shell">
        <div className="shell services-final-content">
          <h2>Need help choosing the right division?</h2>
          <p>
            Tell us what you are looking for and we will point you to the right HEXORA business unit.
          </p>
          <div className="services-final-actions">
            <Button as={Link} to="/contact" size="lg">
              Talk to HEXORA <MessageCircle size={17} />
            </Button>
            <Button as={Link} to="/companies/talent" variant="secondary" size="lg">
              Start with Talent <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
