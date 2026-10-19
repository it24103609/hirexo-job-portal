import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import PremiumDualCardSection from '../../components/home/PremiumDualCardSection';
import servicesHeroVideo from '../../assets/videos/services-hero-bg.mp4';
import './ServicesPage.css';
import './DivisionPage.css';

const talentJourney = [
  'Understand the requirement',
  'Map the role and hiring needs',
  'Source and review candidates',
  'Shortlist and coordinate interviews',
  'Support offer and selection decisions',
  'Guide onboarding and next steps'
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
      toast.info('Register as a candidate');
      navigate('/candidate/register');
    }
  };

  const handleEmployerClick = () => {
    if (user && user.role === 'employer') {
      navigate('/employer/jobs/new');
    } else {
      toast.info('Register as an employer');
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
        title="HEXORA TALENT | Talent & Staffing Division"
        description="HEXORA TALENT is the talent and staffing division of HEXORA GLOBAL GROUP, supporting employers and candidates with structured hiring solutions."
      />

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
            <span className="services-badge">
              <Sparkles size={15} /> HEXORA TALENT
            </span>
            <h1>Connecting talent with opportunity, under HEXORA GLOBAL GROUP.</h1>
            <p className="division-tagline">Talent & Staffing Division</p>
            <p className="division-desc">
              HEXORA TALENT is the talent and staffing division of HEXORA GLOBAL GROUP. We support employers
              with structured hiring and help candidates move toward the right next step in their careers.
            </p>
            <div className="services-hero-ctas">
              <Button onClick={handleCvClick} size="lg">
                Upload Your CV <ArrowRight size={17} />
              </Button>
              <Button onClick={handleEmployerClick} variant="secondary" size="lg">
                Hire Through HEXORA <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="services-cards-shell" style={{ paddingTop: '2rem' }}>
        <div className="shell">
          <div className="services-section-header">
            <span className="services-section-badge">Overview</span>
            <h2>Watch Our <span>Company Overview</span></h2>
            <p>Learn more about HEXORA TALENT and the wider HEXORA GLOBAL GROUP.</p>
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
              <h3>One group, with one focused talent division</h3>
              <p>
                HEXORA GLOBAL GROUP operates through focused business divisions, and HEXORA TALENT carries the
                recruitment and staffing responsibility for the group.
              </p>
              <ul>
                <li><CheckCircle2 size={17} /> Talent Acquisition and Recruitment</li>
                <li><CheckCircle2 size={17} /> Candidate and Employer Solutions</li>
                <li><CheckCircle2 size={17} /> Hiring support for growing businesses</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PremiumDualCardSection onCvClick={handleCvClick} onEmployerClick={handleEmployerClick} />

      <section className="process-section talent-process">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Talent Journey</p>
              <h2>Structured hiring from first brief to final onboarding</h2>
              <p>
                Our workflow keeps employers, candidates, and recruiters aligned at every step.
              </p>
            </div>
          </div>
          <div className="process-timeline">
            {talentJourney.map((step, index) => (
              <article className="process-step" key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="industry-section talent-industry">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Industries We Support</p>
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
              <span className="industry-card" key={industry} tabIndex={0}>
                <CheckCircle2 size={17} /> {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section talent-process">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="home-eyebrow">Next Step</p>
              <h2>Looking for talent or looking for work?</h2>
              <p>
                HEXORA TALENT can help you move forward with a clear, structured, and professional process.
              </p>
            </div>
            <div className="services-hero-ctas">
              <Button as={Link} to="/contact" size="lg">
                Talk to the Group <MessageCircle size={17} />
              </Button>
              <Button as={Link} to="/about" variant="secondary" size="lg">
                About HEXORA Group <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
