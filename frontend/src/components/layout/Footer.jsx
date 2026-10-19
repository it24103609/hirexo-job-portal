import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
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
import { siteContent } from '../../data/siteContent';

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
              HEXORA GLOBAL GROUP (PVT) LTD is a diversified Sri Lankan business group operating across talent,
              human resources, trade, consumer products, and business solutions.
            </p>
            <div className="footer-contact-list">
              <span><Phone size={16} /> {siteContent.contact.phonePrimary}</span>
              <span><Mail size={16} /> {siteContent.contact.email}</span>
              <span><Globe2 size={16} /> www.hexoraglobal.com</span>
            </div>
            <div className="footer-hours">
              <Clock size={13} /> Monday - Friday | 9:00 AM - 6:00 PM
            </div>
            <p className="footer-slogan">
              One Group. Multiple Businesses. Global Opportunities.
            </p>
          </div>

          <div className="footer-column footer-middle">
            <div className="footer-group">
              <h3>Quick Links</h3>
              <div className="footer-links">
                <Link to="/"><BriefcaseBusiness size={16} /> Home</Link>
                <Link to="/about"><BriefcaseBusiness size={16} /> About Hexora Group</Link>
                <Link to="/#divisions-section"><BriefcaseBusiness size={16} /> Our Businesses</Link>
                <Link to="/jobs"><BriefcaseBusiness size={16} /> Careers</Link>
                <Link to="/contact"><MessageCircle size={16} /> Contact Us</Link>
              </div>
            </div>

            <div className="footer-group">
              <h3>Our Divisions</h3>
              <div className="footer-links">
                <Link to="/companies/talent"><Users size={16} /> HEXORA TALENT</Link>
                <Link to="/companies/hr-consulting"><Users size={16} /> HEXORA HR CONSULTING</Link>
                <Link to="/companies/global-trade"><Globe2 size={16} /> HEXORA GLOBAL TRADE</Link>
                <Link to="/companies/foods"><Utensils size={16} /> HEXORA FOODS</Link>
                <Link to="/companies/business-solutions"><Building2 size={16} /> HEXORA BUSINESS SOLUTIONS</Link>
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
                Building connected businesses with clarity, trust, and long-term value.
              </p>
            </div>

            <a className="footer-cta" href="https://wa.me/94773191832" target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp us <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <span className="footer-copyright">&copy; 2026 HEXORA GLOBAL GROUP (PVT) LTD. All Rights Reserved.</span>
          <span className="footer-bottom-slogan">HEXORA GLOBAL GROUP is a diversified Sri Lankan business group building and operating businesses across talent, human resources, trade, consumer products, and business solutions.</span>
        </div>
      </div>
    </footer>
  );
}
