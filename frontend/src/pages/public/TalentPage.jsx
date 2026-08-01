import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mail, Phone, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import PremiumDualCardSection from '../../components/home/PremiumDualCardSection';
import servicesHeroVideo from '../../assets/videos/services-hero-bg.mp4';
import './ServicesPage.css';
import './DivisionPage.css';

const recruitmentProcess = [
  'Requirement Analysis',
  'Candidate Sourcing',
  'Screening & Shortlisting',
  'Interviews & Assessments',
  'Client Selection',
  'Offer Management',
  'Onboarding Support'
];

const industries = [
  'Information Technology',
  'Banking & Finance',
  'Healthcare',
  'Engineering',
  'Construction',
  'Manufacturing',
  'Retail & FMCG',
  'Logistics & Supply Chain',
  'Hospitality',
  'Telecommunications'
];

export default function TalentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const industryCarouselRef = useRef(null);
  const industryDrag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const handleCvClick = () => {
    if (user && user.role === 'candidate') {
      navigate('/candidate/resume');
    } else {
      toast.info('Register Candidate');
      navigate('/candidate/register');
    }
  };

  const handleEmployerClick = () => {
    if (user && user.role === 'employer') {
      navigate('/employer/jobs/new');
    } else {
      toast.info('Register Employer');
      navigate('/employer/register');
    }
  };

  const handleIndustryPointerDown = (event) => {
    if (event.pointerType === 'touch') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const carousel = industryCarouselRef.current;
    if (!carousel) return;

    industryDrag.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: carousel.scrollLeft
    };
    carousel.classList.add('is-dragging');
    carousel.setPointerCapture?.(event.pointerId);
  };

  const handleIndustryPointerMove = (event) => {
    const carousel = industryCarouselRef.current;
    if (!carousel || !industryDrag.current.active) return;

    event.preventDefault();
    const walk = event.clientX - industryDrag.current.startX;
    carousel.scrollLeft = industryDrag.current.scrollLeft - walk;
  };

  const stopIndustryDrag = (event) => {
    const carousel = industryCarouselRef.current;
    if (!carousel) return;

    industryDrag.current.active = false;
    carousel.classList.remove('is-dragging');
    if (carousel.hasPointerCapture?.(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }
  };

  const handleIndustryKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const carousel = industryCarouselRef.current;
    if (!carousel) return;

    event.preventDefault();
    const firstCard = carousel.querySelector('.industry-card');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
    carousel.scrollBy({
      left: event.key === 'ArrowRight' ? cardWidth : -cardWidth,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Seo
        title="HEXORA TALENT | Recruitment & Staffing Solutions"
        description="Permanent recruitment, executive search, contract staffing, and talent acquisition solutions. Upload your CV or post your requirement today."
      />

      {/* Hero - background video */}
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
            <span className="services-badge"><Sparkles size={15} /> HEXORA TALENT</span>
            <h1>Empowering Businesses. <span>Connecting Talent.</span> Creating Opportunities.</h1>
            <p className="division-tagline">Recruitment & Staffing Solutions</p>
            <p className="division-desc">
              HEXORA TALENT specializes in permanent recruitment, executive search, contract staffing, and
              talent acquisition solutions across various industries. Connecting exceptional talent with outstanding employers.
            </p>
            <div className="services-hero-ctas">
              <Button onClick={handleCvClick} size="lg">Upload Your CV <ArrowRight size={17} /></Button>
              <Button onClick={handleEmployerClick} variant="secondary" size="lg">Post Your Requirement <ArrowRight size={17} /></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Overview - YouTube embed */}
      <section className="services-cards-shell" style={{ paddingTop: '2rem' }}>
        <div className="shell">
          <div className="services-section-header">
            <span className="services-section-badge">Overview</span>
            <h2>Watch Our <span>Company Overview</span></h2>
            <p>Learn more about HEXORA TALENT and our business divisions.</p>
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
                <li><CheckCircle2 size={17} /> Candidate & Employer Solutions</li>
                <li><CheckCircle2 size={17} /> HR Consulting, Trade & Foods</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Registration + Employer Requirement */}
      <PremiumDualCardSection onCvClick={handleCvClick} onEmployerClick={handleEmployerClick} />

      {/* Recruitment Process */}
      <section className="process-section talent-process">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Recruitment Process</p>
              <h2>Structured hiring from requirement to onboarding</h2>
              <p>Our workflow keeps employers, candidates, and recruiters aligned at each decision point.</p>
            </div>
          </div>
          <div className="process-timeline">
            {recruitmentProcess.map((step, index) => (
              <article className="process-step" key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Expertise */}
      <section className="industry-section talent-industry">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Industry Expertise</p>
              <h2>Recruitment coverage across key business sectors</h2>
              <p>HEXORA TALENT supports specialist and volume hiring across high-demand industries.</p>
            </div>
          </div>
          <div
            className="industry-grid"
            ref={industryCarouselRef}
            role="region"
            aria-label="Industry expertise carousel"
            tabIndex={0}
            onKeyDown={handleIndustryKeyDown}
            onPointerDown={handleIndustryPointerDown}
            onPointerMove={handleIndustryPointerMove}
            onPointerUp={stopIndustryDrag}
            onPointerCancel={stopIndustryDrag}
            onPointerLeave={stopIndustryDrag}
          >
            {industries.map((industry) => (
              <span className="industry-card" key={industry} tabIndex={0}><CheckCircle2 size={17} /> {industry}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="division-cta">
        <div className="shell division-cta-inner">
          <h2>Get In Touch</h2>
          <p>Ready to grow your business with HEXORA GLOBAL GROUP?</p>
          <div className="division-contact-info">
            <span><Phone size={16} /> +94 77 319 1832</span>
            <span><Mail size={16} /> hrm4921@gmail.com</span>
          </div>
          <Button as={Link} to="/contact" size="lg">Contact Us <ArrowRight size={18} /></Button>
        </div>
      </section>
    </>
  );
}