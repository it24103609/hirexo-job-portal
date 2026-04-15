import Seo from '../../components/ui/Seo';
import { Link } from 'react-router-dom';
import { Users2, Briefcase, Calendar, Search, Brain, CheckCircle2, Award, Zap, Users, ArrowRight } from 'lucide-react';
import { siteContent } from '../../data/siteContent';
import './ServicesPage.css';

export default function ServicesPage() {
  const serviceIcons = [
    { Icon: Users2, color: '#1a8a56' },
    { Icon: Briefcase, color: '#1a8a56' },
    { Icon: Calendar, color: '#1a8a56' },
    { Icon: Search, color: '#1a8a56' },
    { Icon: Brain, color: '#1a8a56' }
  ];

  const howItWorks = [
    { step: 1, title: 'Understand hiring needs', description: 'We dive deep into role requirements, team dynamics, and culture to shape hiring strategy.' },
    { step: 2, title: 'Source and screen talent', description: 'Targeted sourcing and practical screening to identify genuinely qualified candidates.' },
    { step: 3, title: 'Shortlist and align', description: 'Curated shortlists focused on role fit, skills, and cultural alignment for your team.' },
    { step: 4, title: 'Support final placement', description: 'Seamless coordination through final interviews, negotiations, and onboarding support.' }
  ];

  const whyChoose = [
    { icon: Zap, title: 'Faster hiring', desc: 'Results-driven approach reduces time-to-hire while maintaining quality.' },
    { icon: CheckCircle2, title: 'Quality screening', desc: 'Practical assessment of skills, role fit, and long-term retention potential.' },
    { icon: Users, title: 'Culture alignment', desc: 'Deep understanding of your team dynamics for better candidate matches.' },
    { icon: Award, title: 'Flexible models', desc: 'From permanent placements to contract staffing—choose what works for you.' }
  ];

  return (
    <>
      <Seo title="Services | Hirexo" description="Premium recruitment, talent acquisition, and HR services on Hirexo." />

      {/* Hero Section */}
      <section className="services-hero-shell">
        <div className="services-hero-ambient services-hero-ambient-a" aria-hidden="true" />
        <div className="services-hero-ambient services-hero-ambient-b" aria-hidden="true" />
        
        <div className="shell">
          <div className="services-hero-content">
            <span className="services-badge">Services</span>
            <h1>Recruitment services built for modern teams</h1>
            <p className="services-hero-subtitle">
              Premium staffing solutions and talent acquisition services designed to streamline hiring, 
              reduce time-to-fill, and ensure lasting team fit and culture alignment.
            </p>
            <div className="services-hero-ctas">
              <Link to="/contact" className="btn btn-primary">Contact Us</Link>
              <Link to="/jobs" className="btn btn-secondary">Explore Jobs</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards Section */}
      <section className="services-cards-shell">
        <div className="shell">
          <div className="services-intro">
            <h2>What Hirexo helps businesses do</h2>
            <p>Comprehensive recruitment services tailored to your hiring needs and business goals.</p>
          </div>

          <div className="services-grid">
            {siteContent.services.map((service, idx) => {
              const { Icon, color } = serviceIcons[idx] || serviceIcons[0];
              return (
                <div key={service.title} className="service-card">
                  <div className="service-card-icon">
                    <Icon size={28} color={color} />
                  </div>
                  
                  <div className="service-card-content">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    
                    <div className="service-card-features">
                      <span className="service-feature-tag">✓ Proven approach</span>
                      <span className="service-feature-tag">✓ Expert team</span>
                    </div>
                  </div>

                  <div className="service-card-footer">
                    <a href="/contact" className="service-learn-more">
                      Learn more <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="services-how-it-works-shell">
        <div className="shell">
          <div className="services-section-header">
            <h2>How we help you hire</h2>
            <p>Our proven 4-step approach to finding the right talent for your team.</p>
          </div>

          <div className="how-it-works-grid">
            {howItWorks.map((item, idx) => (
              <div key={item.step} className="how-it-works-card">
                <div className="how-it-works-step">{item.step}</div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                {idx < howItWorks.length - 1 && <div className="how-it-works-arrow" aria-hidden="true">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="services-why-choose-shell">
        <div className="shell">
          <div className="services-section-header">
            <h2>Why choose our services</h2>
            <p>Built for recruitment efficiency, quality, and lasting business impact.</p>
          </div>

          <div className="why-choose-grid">
            {whyChoose.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.title} className="why-choose-card">
                  <div className="why-choose-icon">
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

      {/* CTA Section */}
      <section className="services-cta-shell">
        <div className="shell">
          <div className="services-cta-content">
            <h2>Ready to find the right talent?</h2>
            <p>Let our recruitment experts support your next hire with proven strategies and reliable results.</p>
            <div className="services-cta-buttons">
              <Link to="/contact" className="btn btn-primary">Talk to our team</Link>
              <Link to="/jobs" className="btn btn-secondary">View open roles</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
