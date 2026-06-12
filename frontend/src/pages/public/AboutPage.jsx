import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Eye,
  Globe2,
  Heart,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Target,
  UploadCloud,
  Users
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <>
      <Seo title="About Us | HEXORA GLOBAL GROUP" description="Learn about HEXORA GLOBAL GROUP (PVT) LTD - a diversified Sri Lankan business group providing innovative solutions in Talent Acquisition, HR Consulting, Global Trade, Food Products, and Business Consulting." />

      {/* Hero Banner */}
      <section className="about-hero-section">
        <div className="about-hero-ambient" aria-hidden="true" />
        <div className="shell about-hero-content">
          <h1>HEXORA GLOBAL GROUP (PVT) LTD</h1>
          <p className="about-hero-subtitle">Empowering Businesses. Connecting Talent. Creating Opportunities.</p>
          <p className="about-hero-desc">
            HEXORA GLOBAL GROUP (PVT) LTD is a diversified business group providing innovative solutions in Talent Acquisition, HR Consulting, Global Trade, Food Products, and Business Consulting.
          </p>
          <p className="about-hero-desc">
            We help businesses grow through strategic workforce solutions, operational excellence, and global business partnerships.
          </p>
          <p className="about-hero-tagline">Your Trusted Partner for Growth & Success.</p>
          <div className="about-hero-actions">
            <Button as={Link} to="/contact" size="lg">Contact Us <ArrowRight size={18} /></Button>
            <Button as={Link} to="/services" variant="secondary" size="lg">Explore Services <ArrowRight size={18} /></Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-who-section">
        <div className="shell about-who-grid">
          <div className="about-who-content">
            <div className="about-section-badge">About Us</div>
            <h2>Who We Are</h2>
            <p>
              HEXORA GLOBAL GROUP (PVT) LTD is a Sri Lankan-based business group committed to delivering professional services and business solutions across multiple industries.
            </p>
            <p>
              With expertise spanning recruitment, human resource management, international trade, food products, and business consulting, we support organizations in achieving sustainable growth while creating opportunities for individuals and businesses alike.
            </p>
            <p>
              Our mission is to build long-term partnerships through integrity, innovation, and excellence.
            </p>
          </div>
          <div className="about-who-cards">
            <div className="about-mission-card">
              <span className="about-card-icon"><Target size={28} /></span>
              <h3>Our Vision</h3>
              <p>To become a globally recognized business group delivering innovative solutions that empower people and businesses.</p>
            </div>
            <div className="about-mission-card">
              <span className="about-card-icon"><Heart size={28} /></span>
              <h3>Our Mission</h3>
              <p>To provide exceptional services that drive business success, create employment opportunities, and contribute to economic growth through professionalism, trust, and innovation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose HEXORA */}
      <section className="about-why-section">
        <div className="shell">
          <div className="about-section-header">
            <h2>WHY CHOOSE HEXORA</h2>
          </div>
          <div className="about-why-grid">
            <div className="about-why-card">
              <div className="about-why-icon"><BadgeCheck size={28} /></div>
              <h3>Professional Expertise</h3>
              <p>Our team brings industry knowledge and practical experience across multiple sectors.</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon"><Users size={28} /></div>
              <h3>Trusted Partnerships</h3>
              <p>We focus on building long-term relationships based on transparency and trust.</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon"><Sparkles size={28} /></div>
              <h3>Customized Solutions</h3>
              <p>Every business is unique. We tailor our solutions to meet your specific requirements.</p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon"><Globe2 size={28} /></div>
              <h3>Global Perspective</h3>
              <p>We help organizations explore opportunities beyond borders through our extensive network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section className="about-careers-section">
        <div className="shell">
          <div className="about-careers-content">
            <h2>Looking for Your Next Opportunity?</h2>
            <p>Explore exciting career opportunities with leading organizations.</p>
            <p>Submit your CV and let our recruitment specialists connect you with the right opportunity.</p>
            <Button as={Link} to="/candidate/register" size="lg">Upload CV <UploadCloud size={18} /></Button>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="about-clients-section">
        <div className="shell">
          <div className="about-section-header">
            <h2>Trusted by Growing Businesses</h2>
            <p>Partnering with startups, SMEs, and established organizations across various industries.</p>
          </div>
          <div className="about-clients-strip">
            {['IT Startups', 'SMEs', 'Corporations', 'Financial Institutions', 'Manufacturing Firms', 'Service Providers'].map((client) => (
              <span key={client} className="about-client-tag">{client}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="about-testimonials-section">
        <div className="shell">
          <div className="about-section-header">
            <h2>What Our Clients Say</h2>
          </div>
          <div className="about-testimonials-grid">
            <div className="about-testimonial-card">
              <div className="about-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="#eab308" color="#eab308" />)}
              </div>
              <p>"HEXORA helped us identify top talent quickly and efficiently."</p>
            </div>
            <div className="about-testimonial-card">
              <div className="about-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="#eab308" color="#eab308" />)}
              </div>
              <p>"Their HR consulting services streamlined our operations and improved productivity."</p>
            </div>
            <div className="about-testimonial-card">
              <div className="about-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="#eab308" color="#eab308" />)}
              </div>
              <p>"Professional, responsive, and reliable recruitment partner."</p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}