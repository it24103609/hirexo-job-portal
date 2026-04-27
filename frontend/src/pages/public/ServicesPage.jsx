import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Users2
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import servicesHeroVideo from '../../assets/videos/services-hero-bg.mp4';
import './ServicesPage.css';

const serviceImages = [
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=820&q=85',
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=820&q=85',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=820&q=85',
  'https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=820&q=85',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=820&q=85'
];

export default function ServicesPage() {
  const services = [
    {
      icon: Users2,
      title: 'Staff Augmentation',
      description: 'Flexible hiring support to scale teams quickly with top-tier professionals.',
      tags: ['Flexible engagement', 'Expert talent']
    },
    {
      icon: Briefcase,
      title: 'Permanent Recruitment',
      description: 'Long-term placements focused on role fit, performance, and retention.',
      tags: ['Precision matching', 'Expert hiring']
    },
    {
      icon: Calendar,
      title: 'Contract & Project Staffing',
      description: 'On-demand expertise for key projects and short-term specialized skill requirements.',
      tags: ['Flexible approach', 'Rapid scaling']
    },
    {
      icon: Search,
      title: 'IT & Non-IT Talent Acquisition',
      description: 'Targeted sourcing across technical and functional roles for diverse business needs.',
      tags: ['Diverse expertise', 'Expert team']
    },
    {
      icon: BadgeCheck,
      title: 'Recruitment Consulting',
      description: 'Advisory support to improve hiring strategies, pipeline quality, and recruitment outcomes.',
      tags: ['Proven approach', 'Expert guidance']
    }
  ];

  const howItWorks = [
    {
      icon: ClipboardCheck,
      title: 'Understand hiring needs',
      description: 'We dive deep into role requirements, team dynamics, and long-term objectives.'
    },
    {
      icon: Search,
      title: 'Source and screen talent',
      description: 'Targeted sourcing and rigorous screening to identify top-quality candidates.'
    },
    {
      icon: CheckCircle2,
      title: 'Shortlist and align',
      description: 'Curated shortlist shared along with role, culture, and alignment for your team.'
    },
    {
      icon: Handshake,
      title: 'Support final placement',
      description: 'Seamless coordination through offer, joining, and post-placement onboarding support.'
    }
  ];

  const whyChoose = [
    { icon: Rocket, title: 'Faster hiring', desc: 'Reduce time-to-hire and access the best talent in a competitive market.' },
    { icon: ShieldCheck, title: 'Quality screening', desc: 'Precise assessment of skills, role fit, and long-term retention potential.' },
    { icon: Users, title: 'Culture alignment', desc: "Deep understanding of your team's culture to ensure candidates excel." },
    { icon: Award, title: 'Flexible models', desc: 'From permanent hires to project staffing, solutions that adapt to workforce goals.' }
  ];

  return (
    <>
      <Seo title="Services | Hirexo" description="Premium recruitment, talent acquisition, and HR services on Hirexo." />

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
            <span className="services-badge"><Sparkles size={15} /> Our Services</span>
            <h1>Recruitment services <span>built for modern teams</span></h1>
            <p>
              Premium staffing solutions and talent acquisition services designed to streamline hiring,
              reduce time-to-fill, and ensure lasting impact for your business.
            </p>
            <div className="services-hero-ctas">
              <Link to="/contact" className="services-btn services-btn-primary">Contact Us <ArrowRight size={17} /></Link>
              <Link to="/jobs" className="services-btn services-btn-light">Explore Jobs</Link>
            </div>
          </div>

          <div className="services-video-card" aria-label="Hirexo recruitment services overview video">
            <iframe
              src="https://www.youtube.com/embed/Y7cpCDlRfV0"
              title="Hirexo recruitment services overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="services-cards-shell">
        <div className="shell">
          <div className="services-section-header">
            <span className="services-section-badge">Our Expertise</span>
            <h2>What <span>Hirexo</span> helps businesses do</h2>
            <p>Comprehensive recruitment services tailored to your hiring needs and business goals.</p>
          </div>

          <div className="services-grid">
            {services.map(({ icon: Icon, title, description, tags }, index) => (
              <article key={title} className="service-card">
                <div className="service-image">
                  <img src={serviceImages[index]} alt={`${title} service`} />
                  <span><Icon size={24} /></span>
                </div>
                <div className="service-card-content">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <div className="service-card-features">
                    {tags.map((tag) => <span className="service-feature-tag" key={tag}><BadgeCheck size={13} /> {tag}</span>)}
                  </div>
                  <Link to="/contact" className="service-learn-more">Learn more <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-how-it-works-shell">
        <div className="shell">
          <div className="services-section-header">
            <span className="services-section-badge">Our Hiring Process</span>
            <h2>How we help you hire</h2>
            <p>Our proven 4-step approach to finding the right talent for your team.</p>
          </div>

          <div className="how-it-works-grid">
            {howItWorks.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="how-it-works-card">
                <div className="process-illustration">
                  <Icon size={48} />
                </div>
                <span className="how-it-works-step">{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-why-choose-shell">
        <div className="shell">
          <div className="services-section-header">
            <h2>Why choose our services</h2>
            <p>Built for recruitment efficiency, quality, and lasting business impact.</p>
          </div>

          <div className="why-choose-grid">
            {whyChoose.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="why-choose-card">
                <div className="why-choose-icon">
                  <Icon size={36} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
