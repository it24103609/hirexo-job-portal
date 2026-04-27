import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  Heart,
  LockKeyhole,
  MessageCircle,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TargetIcon,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import { siteContent } from '../../data/siteContent';
import './AboutPage.css';

const images = {
  hero: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1100&q=85',
  jobSeeker: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=760&q=85',
  employer: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=760&q=85',
  team: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=760&q=85',
  cta: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85'
};

export default function AboutPage() {
  const storyCards = [
    { icon: TargetIcon, title: 'Our mission', text: siteContent.mission, visual: 'flag' },
    { icon: Eye, title: 'Our vision', text: siteContent.vision, visual: 'scope' },
    { icon: Heart, title: 'Our values', text: siteContent.values, visual: 'heart' }
  ];

  const whoWeServe = [
    {
      icon: Users,
      title: 'Job Seekers',
      desc: 'Find roles that match your skills and career goals with a transparent, supportive hiring process.',
      image: images.jobSeeker
    },
    {
      icon: BriefcaseBusiness,
      title: 'Employers',
      desc: 'Access verified talent, streamline hiring workflows, and hire faster with confidence.',
      image: images.employer
    },
    {
      icon: UserCheck,
      title: 'Recruitment Teams',
      desc: 'Manage hiring pipelines with practical tools, structured reviews, and collaborative workflows.',
      image: images.team
    }
  ];

  const whyChoose = [
    { icon: CheckCircle2, title: 'Clear workflow', desc: 'Transparent processes at every step for candidates, employers, and teams.' },
    { icon: Rocket, title: 'Faster matching', desc: 'Intelligent matching and smart recommendations help save time.' },
    { icon: Heart, title: 'Candidate-focused', desc: 'We prioritize experience, fairness, and long-term success.' },
    { icon: TrendingUp, title: 'Proven results', desc: 'Track record of quality placements and successful business impact.' }
  ];

  const howItWorks = [
    { step: 1, icon: SearchCheck, title: 'Understand needs', desc: 'We learn about your requirements, goals, and team dynamics.' },
    { step: 2, icon: Users, title: 'Connect talent', desc: 'Smartly match people with the right roles and great opportunities.' },
    { step: 3, icon: MessageCircle, title: 'Support process', desc: 'We guide candidates and employers through interviews and onboarding.' },
    { step: 4, icon: ShieldCheck, title: 'Build trust', desc: 'Long-term partnerships built on transparency, quality, and results.' }
  ];

  const stats = [
    { icon: TrendingUp, value: '250+', label: 'Active Roles' },
    { icon: BriefcaseBusiness, value: '120+', label: 'Hiring Partners' },
    { icon: Users, value: '15k+', label: 'Candidate Matches' },
    { icon: BadgeCheck, value: '30+', label: 'Cities Covered' }
  ];

  return (
    <>
      <Seo title="About Hirexo" description="Learn about Hirexo's recruitment-first approach to corporate hiring and talent acquisition." />

      <section className="about-hero-shell">
        <div className="about-hero-ambient about-hero-ambient-a" aria-hidden="true" />
        <div className="about-hero-ambient about-hero-ambient-b" aria-hidden="true" />

        <div className="shell about-hero-grid">
          <div className="about-hero-copy">
            <span className="about-badge"><Sparkles size={15} /> AI-Powered Hiring</span>
            <h1>A recruitment platform built for clarity, speed, and <span>results</span></h1>
            <p>
              We believe hiring should be transparent, fair, and efficient. Hirexo connects
              exceptional talent with businesses that value them, every single day.
            </p>

            <div className="about-hero-ctas">
              <Link to="/jobs" className="about-btn about-btn-primary">Explore Jobs <ArrowRight size={17} /></Link>
              <Link to="/contact" className="about-btn about-btn-soft">Contact Us</Link>
            </div>

            <div className="about-trust-row">
              <span><BadgeCheck size={16} /> Verified Employers</span>
              <span><LockKeyhole size={16} /> Secure & Private</span>
              <span><Sparkles size={16} /> AI Matchmaking</span>
            </div>
          </div>

          <div className="about-hero-visual">
            <img src={images.hero} alt="Recruiters and candidates collaborating in a modern office" />
            <div className="about-float-card top-match">
              <small>Top Match</small>
              <strong>98%</strong>
            </div>
            <div className="about-float-card progress-card">
              <small>Hiring Progress</small>
              <strong>75%</strong>
              <span>Shortlisted 12/16</span>
            </div>
            <div className="about-float-card candidate-card">
              <img src={images.jobSeeker} alt="" />
              <div>
                <small>Recommended Candidate</small>
                <strong>Sarah Johnson</strong>
                <span>Product Designer</span>
              </div>
            </div>
            <div className="about-float-card talent-pool">
              <small>Talent Pool</small>
              <div className="about-avatar-stack">
                {[images.jobSeeker, images.employer, images.team].map((src) => <img src={src} alt="" key={src} />)}
                <span>+240</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-story-shell">
        <div className="shell about-story-grid">
          {storyCards.map(({ icon: Icon, title, text, visual }) => (
            <article className="about-story-card" key={title}>
              <span className="about-card-icon"><Icon size={24} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className={`about-3d-visual ${visual}`} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="about-serve-shell">
        <div className="shell">
          <div className="about-section-header">
            <h2>Who we serve</h2>
            <p>Supporting every participant in the recruitment journey with practical, trusted tools and support.</p>
          </div>

          <div className="about-serve-grid">
            {whoWeServe.map(({ icon: Icon, title, desc, image }) => (
              <article className="about-serve-card" key={title}>
                <img src={image} alt={`${title} using Hirexo`} />
                <div className="about-serve-content">
                  <span className="about-card-icon"><Icon size={22} /></span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-why-shell">
        <div className="shell">
          <div className="about-section-header">
            <h2>Why choose Hirexo</h2>
            <p>Built on a foundation of clarity, speed, practice, support, and proven results.</p>
          </div>

          <div className="about-why-grid">
            {whyChoose.map(({ icon: Icon, title, desc }) => (
              <article className="about-why-card" key={title}>
                <span className="about-card-icon diamond"><Icon size={21} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-process-shell">
        <div className="shell">
          <div className="about-section-header">
            <h2>How we work</h2>
            <p>Our proven 4-step approach to connecting talent with opportunity.</p>
          </div>

          <div className="about-process-grid">
            {howItWorks.map(({ step, icon: Icon, title, desc }) => (
              <article className="about-process-card" key={title}>
                <span className="about-step-badge">{step}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <span className="about-process-icon"><Icon size={32} /></span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-stats-shell">
        <div className="shell about-stats-grid">
          {stats.map(({ icon: Icon, value, label }) => (
            <article className="about-stat-card" key={label}>
              <span><Icon size={34} /></span>
              <div>
                <strong>{value}</strong>
                <p>{label}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta-shell">
        <div className="shell about-cta-card">
          <div className="about-cta-copy">
            <h2>Ready to connect with the right talent?</h2>
            <p>Join hundreds of companies and job seekers who trust Hirexo for clarity, speed, and fair recruitment.</p>
            <div className="about-cta-buttons">
              <Link to="/contact" className="about-btn about-btn-light">Contact Us <ArrowRight size={17} /></Link>
              <Link to="/jobs" className="about-btn about-btn-outline">View Open Roles <ArrowRight size={17} /></Link>
            </div>
          </div>
          <div className="about-cta-visual" aria-hidden="true">
            <img src={images.cta} alt="" />
            <div className="mini-job-card">
              <small>Senior Product Designer</small>
              <strong>Full-time · Remote</strong>
              <span>Apply Now</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
