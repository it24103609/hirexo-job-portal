import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, MessageCircle, Twitter } from 'lucide-react';
import { siteContent } from '../../data/siteContent';
import BrandIdentity from './BrandIdentity';

export default function Footer() {
  const whatsappUrl = `https://wa.me/${siteContent.contact.whatsapp}`;

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="footer-brand">
            <BrandIdentity subtitle="Corporate recruitment and job portal" />
          </div>
          <p className="footer-copy">
            {siteContent.aboutIntro}
          </p>
          <p className="footer-copy">{siteContent.contact.phonePrimary} / {siteContent.contact.phoneSecondary}</p>
          <p className="footer-copy">{siteContent.contact.email}</p>
          <p className="footer-copy">{siteContent.contact.address}</p>
          <a className="whatsapp-link" href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> WhatsApp us
          </a>
        </div>

        <div>
          <h3>Quick Links</h3>
          <div className="footer-links">
            <Link to="/jobs">Jobs</Link>
            <Link to="/candidate/register">Candidate Register</Link>
            <Link to="/employer/register">Employer Register</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>

        <div>
          <h3>Social</h3>
          <div className="social-links">
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={18} /></a>
            <a href="https://x.com" aria-label="Twitter" target="_blank" rel="noreferrer"><Twitter size={18} /></a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={18} /></a>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {siteContent.brandName}. All rights reserved.</span>
        <span>Built for a modern recruitment workflow.</span>
      </div>
    </footer>
  );
}
