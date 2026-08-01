import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Mail,
  Phone,
  Sparkles,
  Star
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Button from '../../components/ui/Button';
import servicesHeroVideo from '../../assets/videos/services-hero-bg.mp4';
import './DivisionPremium.css';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const viewOpts = { once: true, amount: 0.2 };

function useCountUp(target, duration = 1200) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(target);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = String(target).match(/^(\d+)([+/%]?)$/);
    if (!match) return;

    const end = parseInt(match[1], 10);
    const suffix = match[2] || '';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setDisplay(`${Math.round(end * eased)}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, display };
}

function StatChip({ value, label }) {
  const { ref, display } = useCountUp(value);
  return (
    <div className="dp-stat-chip" ref={ref}>
      <strong>{display}</strong>
      <span>{label}</span>
    </div>
  );
}

function MarqueeTrack({ items, className = '', renderItem }) {
  const doubled = [...items, ...items];
  return (
    <div className="dp-marquee-wrap">
      <div className={`dp-marquee-track ${className}`}>
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`}>{renderItem(item)}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Premium reusable page for each HEXORA business division.
 * Light-green theme with framer-motion scroll reveals and marquees.
 */
export default function DivisionPage({ config }) {
  const {
    id,
    seoTitle,
    seoDescription,
    badgeLabel,
    title,
    spanTitle,
    tagline,
    icon: Icon,
    desc,
    text,
    servicesHeading,
    services,
    benefitsHeading,
    benefits,
    actions = [],
    industries = [],
    testimonials = [],
    clients = [],
    overviewPoints = [],
    heroImage,
    heroImageAlt = '',
    ctaImage,
    stats = [],
    highlights = []
  } = config;

  const ctaBg = ctaImage || heroImage;

  return (
    <div className={`division-premium division-premium--${id}`}>
      <Seo title={seoTitle} description={seoDescription} />

      {/* Hero */}
      <section className="dp-hero">
        <div className="dp-hero-bg-wrap">
          {heroImage && (
            <img
              className="dp-hero-bg"
              src={heroImage}
              alt={heroImageAlt}
              fetchPriority="high"
            />
          )}
          <video
            className="dp-hero-video"
            src={servicesHeroVideo}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        </div>
        <div className="dp-hero-overlay" />
        <div className="dp-hero-orbs" aria-hidden="true">
          <div className="dp-hero-orb dp-hero-orb--1" />
          <div className="dp-hero-orb dp-hero-orb--2" />
          <div className="dp-hero-orb dp-hero-orb--3" />
        </div>

        <div className="shell dp-hero-grid">
          <motion.div
            className="dp-hero-copy"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.span className="dp-hero-badge" variants={fadeUp}>
              <Sparkles size={15} /> {badgeLabel}
            </motion.span>
            <motion.h1 variants={fadeUp}>
              {title} <span>{spanTitle}</span>
            </motion.h1>
            <motion.p className="dp-hero-tagline" variants={fadeUp}>{tagline}</motion.p>
            <motion.p className="dp-hero-desc" variants={fadeUp}>{desc}</motion.p>
            <motion.div className="dp-hero-ctas" variants={fadeUp}>
              <Link to={actions[0]?.link ?? '/contact'} className="dp-btn dp-btn-primary">
                {actions[0]?.label ?? 'Contact Us'} <ArrowRight size={17} />
              </Link>
              <Link to={actions[1]?.link ?? '/contact'} className="dp-btn dp-btn-light">
                {actions[1]?.label ?? 'Submit Your Requirement'} <ArrowRight size={17} />
              </Link>
            </motion.div>
            {stats.length > 0 && (
              <motion.div className="dp-hero-stats" variants={fadeUp}>
                {stats.map(({ value, label }) => (
                  <StatChip key={label} value={value} label={label} />
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Highlights Bento */}
      {highlights.length > 0 && (
        <motion.section
          className="dp-highlights-section"
          initial="hidden"
          whileInView="show"
          viewport={viewOpts}
          variants={stagger}
        >
          <div className="shell">
            <motion.div className="dp-section-header" variants={fadeUp}>
              <span className="dp-section-badge">Why Choose Us</span>
              <h2>Built for <span>Excellence</span></h2>
              <p>Discover what makes {badgeLabel} the trusted partner for growing businesses.</p>
            </motion.div>
            <div className="dp-bento-grid">
              {highlights.map(({ icon: HighlightIcon, title: hTitle, text: hText }) => (
                <motion.article className="dp-bento-card" key={hTitle} variants={scaleIn}>
                  <span className="dp-bento-icon">
                    <HighlightIcon size={22} />
                  </span>
                  <h3>{hTitle}</h3>
                  <p>{hText}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Overview */}
      <motion.section
        className="dp-overview-section"
        initial="hidden"
        whileInView="show"
        viewport={viewOpts}
        variants={stagger}
      >
        <div className="shell">
          <motion.div className="dp-section-header" variants={fadeUp}>
            <span className="dp-section-badge">Overview</span>
            <h2>Watch Our <span>Company Overview</span></h2>
            <p>Learn more about {badgeLabel} and our business divisions.</p>
          </motion.div>
          <motion.div className="dp-overview-block" variants={fadeUp}>
            <div className="dp-video-card" aria-label="HEXORA company overview video">
              <iframe
                src="https://www.youtube.com/embed/Y7cpCDlRfV0"
                title="HEXORA company overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="dp-overview-copy">
              <span>About Us</span>
              <h3>A diversified business group delivering excellence</h3>
              <p>
                HEXORA GLOBAL GROUP (PVT) LTD operates through focused business divisions, providing
                comprehensive solutions across multiple industries.
              </p>
              <motion.ul variants={stagger}>
                {overviewPoints.map((point) => (
                  <motion.li key={point} variants={fadeUp}>
                    <CheckCircle2 size={17} /> {point}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Division Detail */}
      <motion.section
        className="dp-detail-section"
        initial="hidden"
        whileInView="show"
        viewport={viewOpts}
        variants={stagger}
      >
        <div className="shell">
          <motion.div className="dp-section-header" variants={fadeUp}>
            <h2>OUR <span>{badgeLabel}</span></h2>
          </motion.div>
          <motion.div className="dp-division-card" variants={fadeUp}>
            <div className="dp-division-header">
              <span className="dp-division-icon"><Icon size={32} /></span>
              <div>
                <h3>{title} {spanTitle}</h3>
                <p className="dp-division-tagline">{tagline}</p>
              </div>
            </div>
            <p className="dp-division-desc">{desc}</p>
            <p className="dp-division-text">{text}</p>
            <div className="dp-division-grid">
              <div className="dp-division-col">
                <h4>{servicesHeading}</h4>
                <ul>
                  {services.map((item) => (
                    <li key={item}><CheckCircle2 size={16} /> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="dp-division-col">
                <h4>{benefitsHeading}</h4>
                <ul className="dp-benefits-list">
                  {benefits.map((item) => (
                    <li key={item}><BadgeCheck size={16} /> {item}</li>
                  ))}
                </ul>
                {actions.length > 0 && (
                  <div className="dp-division-actions">
                    <Button as={Link} to={actions[0].link} variant="secondary" size="sm">
                      {actions[0].label}
                    </Button>
                    <Button as={Link} to={actions[1].link} size="sm">
                      {actions[1].label}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Industries Marquee */}
      {industries.length > 0 && (
        <motion.section
          className="dp-industries-section"
          initial="hidden"
          whileInView="show"
          viewport={viewOpts}
          variants={fadeUp}
        >
          <div className="shell">
            <div className="dp-section-header">
              <h2>INDUSTRIES WE SERVE</h2>
            </div>
          </div>
          <MarqueeTrack
            items={industries}
            renderItem={(industry) => (
              <span className="dp-industry-tag">
                <CheckCircle2 size={16} /> {industry}
              </span>
            )}
          />
          <MarqueeTrack
            items={[...industries].reverse()}
            className="dp-marquee-track--reverse"
            renderItem={(industry) => (
              <span className="dp-industry-tag">
                <CheckCircle2 size={16} /> {industry}
              </span>
            )}
          />
        </motion.section>
      )}

      {/* Clients Marquee */}
      {clients.length > 0 && (
        <motion.section
          className="dp-clients-section"
          initial="hidden"
          whileInView="show"
          viewport={viewOpts}
          variants={fadeUp}
        >
          <div className="shell">
            <div className="dp-section-header">
              <h2>Trusted by Growing Businesses</h2>
              <p>Partnering with startups, SMEs, and established organizations across various industries.</p>
            </div>
          </div>
          <MarqueeTrack
            items={clients}
            renderItem={(client) => <span className="dp-client-tag">{client}</span>}
          />
          <MarqueeTrack
            items={[...clients].reverse()}
            className="dp-marquee-track--reverse"
            renderItem={(client) => <span className="dp-client-tag">{client}</span>}
          />
        </motion.section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <motion.section
          className="dp-testimonials-section"
          initial="hidden"
          whileInView="show"
          viewport={viewOpts}
          variants={stagger}
        >
          <div className="shell">
            <motion.div className="dp-section-header" variants={fadeUp}>
              <h2>What Our Clients Say</h2>
            </motion.div>
            <div className="dp-testimonials-grid">
              {testimonials.map((testimonial, i) => (
                <motion.div className="dp-testimonial-card" key={i} variants={scaleIn}>
                  <div className="dp-stars">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={16} fill="#22c55e" color="#22c55e" />
                    ))}
                  </div>
                  <p>&ldquo;{testimonial}&rdquo;</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA */}
      <section className="dp-cta-section">
        {ctaBg && (
          <div
            className="dp-cta-bg"
            style={{ backgroundImage: `url(${ctaBg})` }}
            aria-hidden="true"
          />
        )}
        <div className="dp-cta-overlay" />
        <motion.div
          className="shell dp-cta-content"
          initial="hidden"
          whileInView="show"
          viewport={viewOpts}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp}>Get In Touch</motion.h2>
          <motion.p variants={fadeUp}>Ready to grow your business with HEXORA GLOBAL GROUP?</motion.p>
          <motion.div className="dp-contact-info" variants={fadeUp}>
            <span className="dp-contact-chip"><Phone size={16} /> +94 77 319 1832</span>
            <span className="dp-contact-chip"><Mail size={16} /> hrm4921@gmail.com</span>
          </motion.div>
          <motion.p className="dp-hours" variants={fadeUp}>Monday - Friday | 9:00 AM - 6:00 PM</motion.p>
          <motion.div variants={fadeUp}>
            <Button as={Link} to="/contact" size="lg" className="dp-cta-btn">
              Contact Us <ArrowRight size={18} />
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
