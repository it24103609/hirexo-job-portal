import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Globe2,
  Mail,
  MessageCircle,
  Phone,
  Star,
  UploadCloud,
  Users,
  Utensils,
  Search,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import servicesHeroVideo from '../../assets/videos/services-hero-bg.mp4';
import './ServicesPage.css';

export default function ServicesPage() {
  return (
    <>
      <Seo title="Services | HEXORA GLOBAL GROUP" description="Explore our comprehensive business divisions including Talent Recruitment, HR Consulting, Global Trade, Foods, and Business Solutions." />

      {/* Hero Section - Old Layout with Video */}
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
            <span className="services-badge"><Sparkles size={15} /> HEXORA GLOBAL GROUP</span>
            <h1>Empowering Businesses. <span>Connecting Talent.</span> Creating Opportunities.</h1>
            <p>
              HEXORA GLOBAL GROUP (PVT) LTD is a diversified business group providing innovative solutions 
              in Talent Acquisition, HR Consulting, Global Trade, Food Products, and Business Consulting.
            </p>
            <p>
              We help businesses grow through strategic workforce solutions, operational excellence, and global business partnerships.
              <br />
              <strong style={{ color: '#87f0ba' }}>Your Trusted Partner for Growth & Success.</strong>
            </p>
            <div className="services-hero-ctas">
              <Link to="/contact" className="services-btn services-btn-primary">Contact Us <ArrowRight size={17} /></Link>
              <Link to="/contact" className="services-btn services-btn-light">Submit Your Requirement <ArrowRight size={17} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Overview - YouTube Embed */}
      <section className="services-cards-shell" style={{ paddingTop: '2rem' }}>
        <div className="shell">
          <div className="services-section-header">
            <span className="services-section-badge">Overview</span>
            <h2>Watch Our <span>Company Overview</span></h2>
            <p>Learn more about HEXORA GLOBAL GROUP and our business divisions.</p>
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
              <h3>A diversified business group delivering excellence</h3>
              <p>
                HEXORA GLOBAL GROUP (PVT) LTD operates through focused business divisions, providing 
                comprehensive solutions across multiple industries.
              </p>
              <ul>
                <li><CheckCircle2 size={17} /> Talent Acquisition & Recruitment</li>
                <li><CheckCircle2 size={17} /> HR Consulting & Payroll</li>
                <li><CheckCircle2 size={17} /> Global Trade & Sourcing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Business Divisions */}
      <section className="hexora-divisions-section">
        <div className="shell">
          <div className="services-section-header">
            <h2>OUR BUSINESS DIVISIONS</h2>
          </div>

          {/* HEXORA TALENT */}
          <div className="hexora-division-card hexora-division-talent">
            <div className="hexora-division-header">
              <span className="hexora-division-icon"><Briefcase size={32} /></span>
              <div>
                <h3>HEXORA TALENT</h3>
                <p className="hexora-division-tagline">Recruitment & Staffing Solutions</p>
              </div>
            </div>
            <p className="hexora-division-desc">Connecting exceptional talent with outstanding employers.</p>
            <p className="hexora-division-text">
              HEXORA TALENT specializes in permanent recruitment, executive search, contract staffing, and talent acquisition solutions across various industries.
            </p>
            <div className="hexora-division-grid">
              <div className="hexora-division-col">
                <h4>Services</h4>
                <ul>
                  <li><CheckCircle2 size={16} /> Permanent Recruitment</li>
                  <li><CheckCircle2 size={16} /> Executive Search & Headhunting</li>
                  <li><CheckCircle2 size={16} /> Contract Staffing</li>
                  <li><CheckCircle2 size={16} /> Bulk Hiring Solutions</li>
                  <li><CheckCircle2 size={16} /> IT Recruitment</li>
                  <li><CheckCircle2 size={16} /> Finance & Accounting Recruitment</li>
                  <li><CheckCircle2 size={16} /> Engineering & Technical Recruitment</li>
                  <li><CheckCircle2 size={16} /> Sales & Marketing Recruitment</li>
                  <li><CheckCircle2 size={16} /> Recruitment Process Outsourcing (RPO)</li>
                </ul>
              </div>
              <div className="hexora-division-col">
                <h4>Why Choose Us</h4>
                <ul className="hexora-benefits-list">
                  <li><BadgeCheck size={16} /> Experienced Recruiters</li>
                  <li><BadgeCheck size={16} /> Fast Turnaround Time</li>
                  <li><BadgeCheck size={16} /> Extensive Talent Network</li>
                  <li><BadgeCheck size={16} /> Industry-Specific Expertise</li>
                  <li><BadgeCheck size={16} /> Quality Candidate Screening</li>
                </ul>
                <div className="hexora-division-actions">
                  <Button as={Link} to="/candidate/register" variant="secondary" size="sm">Submit CV <UploadCloud size={16} /></Button>
                  <Button as={Link} to="/employer/register" size="sm">Hire Talent <Search size={16} /></Button>
                </div>
              </div>
            </div>
          </div>

          {/* HEXORA HR CONSULTING */}
          <div className="hexora-division-card hexora-division-hr">
            <div className="hexora-division-header">
              <span className="hexora-division-icon"><Users size={32} /></span>
              <div>
                <h3>HEXORA HR CONSULTING</h3>
                <p className="hexora-division-tagline">HR & Payroll Solutions</p>
              </div>
            </div>
            <p className="hexora-division-desc">Helping organizations build high-performing workplaces.</p>
            <p className="hexora-division-text">
              We provide comprehensive HR consulting services designed to streamline operations, improve employee engagement, and ensure compliance.
            </p>
            <div className="hexora-division-grid">
              <div className="hexora-division-col">
                <h4>Services</h4>
                <ul>
                  <li><CheckCircle2 size={16} /> HR Strategy Development</li>
                  <li><CheckCircle2 size={16} /> Payroll Management</li>
                  <li><CheckCircle2 size={16} /> HR Outsourcing</li>
                  <li><CheckCircle2 size={16} /> Performance Management Systems</li>
                  <li><CheckCircle2 size={16} /> Employee Handbook Development</li>
                  <li><CheckCircle2 size={16} /> HR Policy Formulation</li>
                  <li><CheckCircle2 size={16} /> Recruitment Support</li>
                  <li><CheckCircle2 size={16} /> Organizational Development</li>
                  <li><CheckCircle2 size={16} /> Training & Development</li>
                </ul>
              </div>
              <div className="hexora-division-col">
                <h4>Benefits</h4>
                <ul className="hexora-benefits-list">
                  <li><BadgeCheck size={16} /> Cost Effective HR Solutions</li>
                  <li><BadgeCheck size={16} /> Compliance Management</li>
                  <li><BadgeCheck size={16} /> Improved Workforce Productivity</li>
                  <li><BadgeCheck size={16} /> Professional HR Guidance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* HEXORA GLOBAL TRADE */}
          <div className="hexora-division-card hexora-division-trade">
            <div className="hexora-division-header">
              <span className="hexora-division-icon"><Globe2 size={32} /></span>
              <div>
                <h3>HEXORA GLOBAL TRADE</h3>
                <p className="hexora-division-tagline">Import, Export & Trading Solutions</p>
              </div>
            </div>
            <p className="hexora-division-desc">Connecting businesses to global markets.</p>
            <p className="hexora-division-text">
              HEXORA GLOBAL TRADE facilitates international trade partnerships and sourcing solutions, helping businesses expand their reach and access quality products worldwide.
            </p>
            <div className="hexora-division-grid">
              <div className="hexora-division-col">
                <h4>Services</h4>
                <ul>
                  <li><CheckCircle2 size={16} /> Import & Export Services</li>
                  <li><CheckCircle2 size={16} /> International Sourcing</li>
                  <li><CheckCircle2 size={16} /> Trade Facilitation</li>
                  <li><CheckCircle2 size={16} /> Supplier Identification</li>
                  <li><CheckCircle2 size={16} /> Product Procurement</li>
                  <li><CheckCircle2 size={16} /> Market Expansion Support</li>
                  <li><CheckCircle2 size={16} /> Business Matching Services</li>
                </ul>
              </div>
              <div className="hexora-division-col">
                <h4>Industries</h4>
                <ul>
                  <li><BadgeCheck size={16} /> Consumer Goods</li>
                  <li><BadgeCheck size={16} /> Industrial Products</li>
                  <li><BadgeCheck size={16} /> Agricultural Products</li>
                  <li><BadgeCheck size={16} /> FMCG</li>
                  <li><BadgeCheck size={16} /> Raw Materials</li>
                </ul>
              </div>
            </div>
          </div>

          {/* HEXORA FOODS */}
          <div className="hexora-division-card hexora-division-foods">
            <div className="hexora-division-header">
              <span className="hexora-division-icon"><Utensils size={32} /></span>
              <div>
                <h3>HEXORA FOODS</h3>
                <p className="hexora-division-tagline">Quality Food Products</p>
              </div>
            </div>
            <p className="hexora-division-desc">Delivering trusted and high-quality packaged food products to consumers.</p>
            <p className="hexora-division-text">
              HEXORA FOODS is committed to providing nutritious, affordable, and quality food products that meet international standards.
            </p>
            <div className="hexora-division-grid">
              <div className="hexora-division-col">
                <h4>Product Categories</h4>
                <ul>
                  <li><CheckCircle2 size={16} /> Spices & Seasonings</li>
                  <li><CheckCircle2 size={16} /> Packaged Food Products</li>
                  <li><CheckCircle2 size={16} /> Dry Foods</li>
                  <li><CheckCircle2 size={16} /> Food Ingredients</li>
                  <li><CheckCircle2 size={16} /> Specialty Food Products</li>
                </ul>
              </div>
              <div className="hexora-division-col">
                <h4>Our Commitment</h4>
                <p className="hexora-commitment">Quality | Freshness | Trust | Customer Satisfaction</p>
              </div>
            </div>
          </div>

          {/* HEXORA BUSINESS SOLUTIONS */}
          <div className="hexora-division-card hexora-division-business">
            <div className="hexora-division-header">
              <span className="hexora-division-icon"><TrendingUp size={32} /></span>
              <div>
                <h3>HEXORA BUSINESS SOLUTIONS</h3>
                <p className="hexora-division-tagline">Consulting & Business Advisory</p>
              </div>
            </div>
            <p className="hexora-division-desc">Strategic solutions for sustainable business growth.</p>
            <p className="hexora-division-text">
              We assist startups, SMEs, and established organizations in overcoming challenges and achieving their business objectives.
            </p>
            <div className="hexora-division-grid">
              <div className="hexora-division-col">
                <h4>Services</h4>
                <ul>
                  <li><CheckCircle2 size={16} /> Business Consulting</li>
                  <li><CheckCircle2 size={16} /> Startup Advisory</li>
                  <li><CheckCircle2 size={16} /> Process Improvement</li>
                  <li><CheckCircle2 size={16} /> Business Strategy Development</li>
                  <li><CheckCircle2 size={16} /> Market Research</li>
                  <li><CheckCircle2 size={16} /> Business Planning</li>
                  <li><CheckCircle2 size={16} /> Corporate Advisory</li>
                  <li><CheckCircle2 size={16} /> Growth & Expansion Planning</li>
                </ul>
              </div>
              <div className="hexora-division-col">
                <h4>Why Work With Us</h4>
                <ul className="hexora-benefits-list">
                  <li><BadgeCheck size={16} /> Practical Business Solutions</li>
                  <li><BadgeCheck size={16} /> Industry Expertise</li>
                  <li><BadgeCheck size={16} /> Customized Strategies</li>
                  <li><BadgeCheck size={16} /> Long-Term Partnership Approach</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="hexora-industries-section">
        <div className="shell">
          <div className="services-section-header">
            <h2>INDUSTRIES WE SERVE</h2>
          </div>
          <div className="hexora-industries-grid">
            {[
              'Information Technology',
              'Banking & Financial Services',
              'FinTech',
              'Healthcare',
              'Manufacturing',
              'Engineering',
              'Construction',
              'Retail & FMCG',
              'Logistics & Supply Chain',
              'Hospitality',
              'Telecommunications',
              'Professional Services'
            ].map((industry) => (
              <span key={industry} className="hexora-industry-tag">
                <CheckCircle2 size={16} /> {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="hexora-careers-section">
        <div className="shell">
          <div className="hexora-careers-content">
            <h2>Looking for Your Next Opportunity?</h2>
            <p>Explore exciting career opportunities with leading organizations.</p>
            <p>Submit your CV and let our recruitment specialists connect you with the right opportunity.</p>
            <Button as={Link} to="/candidate/register" size="lg" className="hexora-careers-btn">Upload CV <UploadCloud size={18} /></Button>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="hexora-clients-section">
        <div className="shell">
          <div className="services-section-header">
            <h2>Trusted by Growing Businesses</h2>
            <p>Partnering with startups, SMEs, and established organizations across various industries.</p>
          </div>
          <div className="hexora-clients-strip">
            {['IT Startups', 'SMEs', 'Corporations', 'Financial Institutions', 'Manufacturing Firms', 'Service Providers'].map((client) => (
              <span key={client} className="hexora-client-tag">{client}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="hexora-testimonials-section">
        <div className="shell">
          <div className="services-section-header">
            <h2>What Our Clients Say</h2>
          </div>
          <div className="hexora-testimonials-grid">
            <div className="hexora-testimonial-card">
              <div className="hexora-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="#eab308" color="#eab308" />)}
              </div>
              <p>"HEXORA helped us identify top talent quickly and efficiently."</p>
            </div>
            <div className="hexora-testimonial-card">
              <div className="hexora-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="#eab308" color="#eab308" />)}
              </div>
              <p>"Their HR consulting services streamlined our operations and improved productivity."</p>
            </div>
            <div className="hexora-testimonial-card">
              <div className="hexora-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="#eab308" color="#eab308" />)}
              </div>
              <p>"Professional, responsive, and reliable recruitment partner."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hexora-cta-section">
        <div className="shell hexora-cta-content">
          <h2>Get In Touch</h2>
          <p>Ready to grow your business with HEXORA GLOBAL GROUP?</p>
          <div className="hexora-contact-info">
            <span><Phone size={16} /> +94 77 319 1832</span>
            <span><Mail size={16} /> hrm4921@gmail.com</span>
            <span><Globe2 size={16} /> www.hexoraglobal.com</span>
          </div>
          <p className="hexora-hours">Monday - Friday | 9:00 AM - 6:00 PM</p>
          <Button as={Link} to="/contact" size="lg">Contact Us <ArrowRight size={18} /></Button>
        </div>
      </section>
    </>
  );
}