import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Facebook,
  FileSearch,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Globe2,
  Clock,
  Users,
  Utensils,
  Building2
} from 'lucide-react';
import BrandIdentity from './BrandIdentity';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-shell">
        <div className="footer-premium-container">
          <div className="footer-column footer-company-info">
            <div className="footer-brand">
              <BrandIdentity subtitle="GLOBAL GROUP (PVT) LTD" compact />
            </div>
            <p className="footer-summary">
              HEXORA GLOBAL GROUP (PVT) LTD is a diversified business group providing innovative solutions in 
              Talent Acquisition, HR Consulting, Global Trade, Food Products, and Business Consulting.
            </p>
            <p className="footer-slogan">
              Empowering Businesses. Connecting Talent. Creating Opportunities.
            </p>
            <div className="footer-contact-list">
              <span><Phone size={16} /> +94 77 319 1832</span>
              <span><Mail size={16} /> hrm4921@gmail.com</span>
              <span><Globe2 size={16} /> www.hexoraglobal.com</span>
            </div>
            <div className="footer-hours">
              <Clock size={13} /> Monday - Friday | 9:00 AM - 6:00 PM
            </div>
          </div>

          <div className="footer-column footer-middle">
            <div className="footer-group">
              <h3>Quick Links</h3>
              <div className="footer-links">
                <Link to="/"><BriefcaseBusiness size={16} /> Home</Link>
                <Link to="/about"><FileSearch size={16} /> About Us</Link>
                <Link to="/services"><BriefcaseBusiness size={16} /> Services</Link>
                <Link to="/jobs"><BriefcaseBusiness size={16} /> Careers</Link>
                <Link to="/contact"><MessageCircle size={16} /> Contact Us</Link>
              </div>
            </div>

            <div className="footer-group">
              <h3>Our Divisions</h3>
              <div className="footer-links">
                <Link to="/jobs"><Users size={16} /> HEXORA TALENT</Link>
                <Link to="#"><Users size={16} /> HEXORA HR CONSULTING</Link>
                <Link to="#"><Globe2 size={16} /> HEXORA GLOBAL TRADE</Link>
                <Link to="#"><Utensils size={16} /> HEXORA FOODS</Link>
                <Link to="#"><Building2 size={16} /> HEXORA BUSINESS SOLUTIONS</Link>
              </div>
            </div>
          </div>

          <div className="footer-column footer-connect">
            <div className="footer-connect-top">
              <h3>Connect</h3>
              <div className="social-links">
                <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={18} /></a>
                <a href="https://x.com" aria-label="Twitter" target="_blank" rel="noreferrer"><Twitter size={18} /></a>
                <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
                <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={18} /></a>
              </div>
              <p className="footer-note">
                Recruitment made with clarity, speed, and trust.
              </p>
              <p className="footer-note footer-slogan-small">
                Empowering Businesses. Connecting Talent. Creating Opportunities.
              </p>
            </div>

            <a className="footer-cta" href="https://wa.me/94773191832" target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp us <ArrowUpRight size={15} />
            </a>

            <img
              className="footer-team-image"
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=85"
              alt=""
            />
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <span className="footer-copyright">&copy; 2026 HEXORA GLOBAL GROUP (PVT) LTD. All Rights Reserved.</span>
          <span className="footer-bottom-slogan">Empowering Businesses. Connecting Talent. Creating Opportunities.</span>
        </div>
      </div>
    </footer>
  );
}
