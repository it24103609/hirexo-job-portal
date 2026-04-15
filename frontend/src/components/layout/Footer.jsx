import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Twitter } from 'lucide-react';
import { siteContent } from '../../data/siteContent';
import BrandIdentity from './BrandIdentity';

export default function Footer() {
  const whatsappUrl = `https://wa.me/${siteContent.contact.whatsapp}`;

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand-panel">
          <div className="footer-brand">
            <BrandIdentity subtitle="Corporate recruitment and job portal" />
          </div>
          <p className="footer-summary">
            {siteContent.aboutIntro}
          </p>
          <div className="footer-contact-list">
            <span><Phone size={16} /> {siteContent.contact.phonePrimary} / {siteContent.contact.phoneSecondary}</span>
            <span><Mail size={16} /> {siteContent.contact.email}</span>
            <span><MapPin size={16} /> {siteContent.contact.address}</span>
          </div>
          <a className="footer-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> WhatsApp us <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="footer-links-panel">
          <h3>Quick Links</h3>
          <div className="footer-links">
            <Link to="/jobs">Jobs</Link>
            <Link to="/candidate/register">Candidate Register</Link>
            <Link to="/employer/register">Employer Register</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>

        <div className="footer-links-panel">
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
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {siteContent.brandName}. All rights reserved.</span>
        <span>Built for a modern recruitment workflow.</span>
      </div>
    </footer>
  );
}
