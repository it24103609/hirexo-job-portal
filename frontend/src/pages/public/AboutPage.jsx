import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  Heart,
  Mail,
  Phone,
  Sparkles,
  Target,
  Users
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Us | HEXORA GLOBAL GROUP"
        description="Learn about HEXORA GLOBAL GROUP (PVT) LTD - a diversified Sri Lankan business group operating across talent, HR consulting, global trade, foods, and business solutions."
      />

      <section className="about-hero-section">
        <div className="about-hero-ambient" aria-hidden="true" />
        <div className="shell about-hero-content">
          <h1>HEXORA GLOBAL GROUP (PVT) LTD</h1>
          <p className="about-hero-subtitle">One Group. Multiple Businesses. Global Opportunities.</p>
          <p className="about-hero-desc">
            HEXORA GLOBAL GROUP is a diversified Sri Lankan business group building and operating businesses
            across talent, human resources, trade, consumer products, and business solutions.
          </p>
          <p className="about-hero-desc">
            We bring together focused expertise, shared resources, and long-term partnerships to create value
            across industries.
          </p>
          <p className="about-hero-tagline">A diversified group built for sustainable growth.</p>
          <div className="about-hero-actions">
            <Button as={Link} to="/companies/talent" size="lg">
              Explore Businesses <ArrowRight size={18} />
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Partner With Us <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      <section className="about-who-section">
        <div className="shell about-who-grid">
          <div className="about-who-content">
            <div className="about-section-badge">About Us</div>
            <h2>Who We Are</h2>
            <p>
              HEXORA GLOBAL GROUP is a Sri Lankan-based business group committed to building resilient businesses
              and practical solutions across multiple industries.
            </p>
            <p>
              Our divisions operate with a shared vision: connect people, products, services, and opportunities
              through thoughtful execution and professional standards.
            </p>
            <p>
              We believe growth is strongest when each business unit can move independently while benefiting from
              one connected group ecosystem.
            </p>
          </div>
          <div className="about-who-cards">
            <div className="about-mission-card">
              <span className="about-card-icon">
                <Target size={28} />
              </span>
              <h3>Our Vision</h3>
              <p>
                To become a globally recognized business group known for reliable operations, trusted partnerships,
                and long-term value creation.
              </p>
            </div>
            <div className="about-mission-card">
              <span className="about-card-icon">
                <Heart size={28} />
              </span>
              <h3>Our Mission</h3>
              <p>
                To deliver exceptional outcomes through integrity, innovation, and collaboration across all HEXORA
                businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-why-section" id="businesses">
        <div className="shell">
          <div className="about-section-header">
            <h2>Our Businesses</h2>
            <p>Five divisions. One group. Each business focuses on a clear market need.</p>
          </div>
          <div className="about-why-grid">
            <div className="about-why-card">
              <div className="about-why-icon">
                <Users size={28} />
              </div>
              <h3>HEXORA TALENT</h3>
              <p>Recruitment and staffing solutions designed to connect the right people with the right roles.</p>
              <p>
                <Link to="/companies/talent">Explore division <ArrowRight size={14} /></Link>
              </p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <BadgeCheck size={28} />
              </div>
              <h3>HEXORA HR CONSULTING</h3>
              <p>HR consulting, payroll support, outsourcing, and compliance services for modern businesses.</p>
              <p>Launching soon</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <Globe2 size={28} />
              </div>
              <h3>HEXORA GLOBAL TRADE</h3>
              <p>Import, export, sourcing, and international market solutions for growing commercial opportunities.</p>
              <p>Launching soon</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <Sparkles size={28} />
              </div>
              <h3>HEXORA FOODS</h3>
              <p>Consumer food products designed around quality, consistency, and long-term brand value.</p>
              <p>Launching soon</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <Heart size={28} />
              </div>
              <h3>HEXORA BUSINESS SOLUTIONS</h3>
              <p>Business consulting and digital support services for organizations that want to scale with clarity.</p>
              <p>Launching soon</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-clients-section">
        <div className="shell">
          <div className="about-section-header">
            <h2>Why HEXORA</h2>
            <p>Built to support growth across multiple businesses, markets, and partner needs.</p>
          </div>
          <div className="about-why-grid">
            <div className="about-why-card">
              <div className="about-why-icon">
                <BadgeCheck size={28} />
              </div>
              <h3>Diversified Expertise</h3>
              <p>Each division brings focused knowledge while still benefiting from the strength of one group.</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <Users size={28} />
              </div>
              <h3>One Connected Ecosystem</h3>
              <p>We operate independently across divisions, but share systems, standards, and strategic direction.</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <Sparkles size={28} />
              </div>
              <h3>People and Partnership Driven</h3>
              <p>Our approach is built on relationships, trust, and practical collaboration with every stakeholder.</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <Globe2 size={28} />
              </div>
              <h3>Growth Focused</h3>
              <p>We look for opportunities that create lasting value for clients, businesses, and markets.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta-section">
        <div className="shell">
          <div className="about-cta-content">
            <h2>Let’s build what’s next.</h2>
            <p>
              Whether you need talent, strategic support, trade capability, or a long-term business partner,
              HEXORA GLOBAL GROUP is ready to connect.
            </p>
            <div className="about-contact-info">
              <span>
                <Phone size={16} /> +94 77 319 1832
              </span>
              <span>
                <Mail size={16} /> hrm4921@gmail.com
              </span>
            </div>
            <p className="about-hours">Monday - Friday | 9:00 AM - 6:00 PM</p>
            <Button as={Link} to="/contact" size="lg">
              Contact Group <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
