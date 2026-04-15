import Seo from '../../components/ui/Seo';
import { Link } from 'react-router-dom';
import { TargetIcon, Eye, Heart, Users, Briefcase, Shield, CheckCircle2, Zap, TrendingUp } from 'lucide-react';
import { siteContent } from '../../data/siteContent';
import './AboutPage.css';

export default function AboutPage() {
  const whoWeServe = [
    { icon: Users, title: 'Job Seekers', desc: 'Find roles matched to your skills and career goals with a transparent, fair hiring process.' },
    { icon: Briefcase, title: 'Employers', desc: 'Access vetted talent, streamline hiring workflows, and build teams aligned with your vision.' },
    { icon: Shield, title: 'Recruitment Teams', desc: 'Manage full hiring cycles with practical tools, quality screening, and structured processes.' }
  ];

  const whyChoose = [
    { icon: CheckCircle2, title: 'Clear workflow', desc: 'Transparent process designed for candidates, employers, and teams.' },
    { icon: Zap, title: 'Faster matching', desc: 'Intelligent matching and practical screening reduce hiring time.' },
    { icon: Heart, title: 'Candidate-focused', desc: 'We prioritize experience, fairness, and long-term team fit.' },
    { icon: TrendingUp, title: 'Proven results', desc: 'Track record of quality placements and lasting business impact.' }
  ];

  const howItWorks = [
    { step: 1, title: 'Understand needs', desc: 'We start with deep conversations about roles, culture, and team dynamics.' },
    { step: 2, title: 'Connect talent', desc: 'Strategic sourcing and matching connect the right people to the right opportunities.' },
    { step: 3, title: 'Support process', desc: 'We guide candidates and employers through interviews, negotiations, and onboarding.' },
    { step: 4, title: 'Build trust', desc: 'Long-term relationships built on transparency, quality, and real business results.' }
  ];

  return (
    <>
      <Seo title="About Hirexo" description="Learn about Hirexo's recruitment-first approach to corporate hiring and talent acquisition." />

      {/* Hero Section */}
      <section className="about-hero-shell">
        <div className="about-hero-ambient about-hero-ambient-a" aria-hidden="true" />
        <div className="about-hero-ambient about-hero-ambient-b" aria-hidden="true" />
        
        <div className="shell">
          <div className="about-hero-content">
            <span className="about-badge">About Hirexo</span>
            <h1>A recruitment platform built for clarity, speed, and results</h1>
            <p className="about-hero-subtitle">
              We believe hiring should be a transparent, fair, and efficient partnership. Hirexo connects 
              exceptional talent with businesses that value them, every single day.
            </p>
            <div className="about-hero-ctas">
              <Link to="/jobs" className="btn btn-primary">Explore Jobs</Link>
              <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="about-story-shell">
        <div className="shell">
          <div className="about-story-grid">
            {/* Mission */}
            <div className="about-story-card">
              <div className="about-story-icon">
                <TargetIcon size={32} />
              </div>
              <h3>Our mission</h3>
              <p>{siteContent.mission}</p>
            </div>

            {/* Vision */}
            <div className="about-story-card">
              <div className="about-story-icon">
                <Eye size={32} />
              </div>
              <h3>Our vision</h3>
              <p>{siteContent.vision}</p>
            </div>

            {/* Values */}
            <div className="about-story-card">
              <div className="about-story-icon">
                <Heart size={32} />
              </div>
              <h3>Our values</h3>
              <p>{siteContent.values}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="about-serve-shell">
        <div className="shell">
          <div className="about-section-header">
            <h2>Who we serve</h2>
            <p>Supporting every participant in the recruitment journey with practical, trusted tools and support.</p>
          </div>

          <div className="about-serve-grid">
            {whoWeServe.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.title} className="about-serve-card">
                  <div className="about-serve-icon">
                    <IconComponent size={28} />
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Hirexo Section */}
      <section className="about-why-shell">
        <div className="shell">
          <div className="about-section-header">
            <h2>Why choose Hirexo</h2>
            <p>Built on a foundation of clarity, speed, practical support, and proven results.</p>
          </div>

          <div className="about-why-grid">
            {whyChoose.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.title} className="about-why-card">
                  <div className="about-why-icon">
                    <IconComponent size={24} />
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="about-process-shell">
        <div className="shell">
          <div className="about-section-header">
            <h2>How we work</h2>
            <p>Our proven 4-step approach to connecting talent with opportunity.</p>
          </div>

          <div className="about-process-grid">
            {howItWorks.map((item, idx) => (
              <div key={item.step} className="about-process-card">
                <div className="about-process-step">{item.step}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
                {idx < howItWorks.length - 1 && <div className="about-process-arrow" aria-hidden="true">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats-shell">
        <div className="shell">
          <div className="about-stats-grid">
            {siteContent.homeStats.slice(0, 4).map((stat) => {
              const icons = [TrendingUp, Briefcase, Users, Shield];
              const Icon = icons[siteContent.homeStats.indexOf(stat) % icons.length];
              return (
                <div key={stat.label} className="about-stat-card">
                  <div className="about-stat-icon">
                    <Icon size={28} />
                  </div>
                  <div className="about-stat-value">{stat.value}</div>
                  <div className="about-stat-label">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-shell">
        <div className="shell">
          <div className="about-cta-content">
            <h2>Ready to connect with the right talent?</h2>
            <p>Join hundreds of companies and job seekers who trust Hirexo for clear, fast, and fair recruitment.</p>
            <div className="about-cta-buttons">
              <Link to="/contact" className="btn btn-primary">Contact Us</Link>
              <Link to="/jobs" className="btn btn-secondary">View Open Roles</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
