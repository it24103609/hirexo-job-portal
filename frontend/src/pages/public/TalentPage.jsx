import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Globe2, Handshake, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import PremiumDualCardSection from '../../components/home/PremiumDualCardSection';
import servicesHeroVideo from '../../assets/videos/services-hero-bg.mp4';
import './ServicesPage.css';
import './DivisionPage.css';
import './TalentPage.css';

const talentJourney = [
  'Understand the requirement',
  'Map the role and hiring needs',
  'Source and review candidates',
  'Shortlist and coordinate interviews',
  'Support offer and selection decisions',
  'Guide onboarding and next steps'
];

const trustedClients = [
  { name: 'LOLC', image: '/LOLC LOGO.png' },
  { name: 'EXEL BPO', image: '/EXCEL BPO.jpeg' },
  { name: 'SHIPEX', image: '/SHIPEX LOGO.png' },
  { name: 'T&T Holdings', image: '/T&t HOLDINGS .jpeg' },
  { name: 'NIBT Campus Kandy', image: '/NIBT CAMPUS LOGO.png' }
];

export default function TalentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  return (
    <>
      <Seo
        title="HEXORA TALENT | Talent & Staffing Division"
        description="HEXORA TALENT is the talent and staffing division of HEXORA GLOBAL CORPORATION, supporting employers and candidates with structured hiring solutions."
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
          <div className="services-hero-copy talent-hero-copy">
            <span className="services-badge">
              <Sparkles size={15} /> HEXORA TALENT
            </span>
            <h1>
              Connecting Talent With <span>Better Opportunities.</span>
            </h1>
            <p className="division-desc">
              We connect exceptional talent with the right opportunities and help businesses build stronger teams
              through smarter recruitment.
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
            <p>Learn more about HEXORA TALENT and the wider HEXORA GLOBAL CORPORATION.</p>
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
              <h3>One corporation with a dedicated talent division</h3>
              <p>
                HEXORA GLOBAL CORPORATION operates through focused business divisions, and HEXORA TALENT carries the
                recruitment and staffing responsibility for the corporation.
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

      <section className="talent-clients-section" aria-labelledby="trusted-clients-heading">
          <div className="talent-clients-map" aria-hidden="true">
            <Globe2 />
          </div>
          <div className="talent-clients-accent talent-clients-accent-top" aria-hidden="true" />
          <div className="talent-clients-accent talent-clients-accent-bottom" aria-hidden="true" />
          <div className="shell">
            <div className="talent-clients-intro">
              <div className="talent-clients-copy">
                <p className="home-eyebrow">Our Clients</p>
                <h2 id="trusted-clients-heading">
                  Our Trusted Clients &amp; <span>Partners</span>
                </h2>
                <p>
                  Building strong relationships with leading companies and institutions through trust, collaboration,
                  and shared success.
                </p>
              </div>
              <div className="talent-clients-visual" aria-hidden="true">
                <div className="talent-clients-handshake">
                  <Handshake size={58} strokeWidth={1.4} />
                </div>
                <span>Partnerships that move business forward</span>
              </div>
            </div>
            <div className="talent-client-grid">
              {trustedClients.map((client) => (
                <article className="talent-client-card" key={client.name}>
                  <img src={client.image} alt={`${client.name} logo`} />
                </article>
              ))}
            </div>
            <p className="talent-partnership-message">
              Together, we grow stronger through <strong>trusted partnerships.</strong>
            </p>
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
                Talk to HEXORA <MessageCircle size={17} />
              </Button>
              <Button as={Link} to="/about" variant="secondary" size="lg">
                About HEXORA Corporation <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
