import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, ChartColumn, Search, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import './PremiumPage.css';

const benefitCards = [
  {
    icon: Sparkles,
    title: 'Better visibility',
    description: 'Featured listings and priority placement help your roles stand out in crowded searches.'
  },
  {
    icon: Search,
    title: 'Smarter discovery',
    description: 'Premium matching tools surface stronger candidates and more relevant opportunities faster.'
  },
  {
    icon: ChartColumn,
    title: 'Clear analytics',
    description: 'Track views, saves, and applications so your team can make better hiring decisions.'
  },
  {
    icon: ShieldCheck,
    title: 'Trusted hiring flow',
    description: 'Verification and premium support add confidence when you move from shortlist to offer.'
  }
];

const plans = [
  {
    name: 'Basic',
    price: '₹999',
    audience: 'For teams starting to scale',
    features: ['10 job posts', '2 featured listings', 'Basic analytics', 'Priority support'],
    cta: 'Start with Basic',
    action: '/contact'
  },
  {
    name: 'Professional',
    price: '₹2,999',
    audience: 'Best for active hiring teams',
    featured: true,
    features: ['50 job posts', '10 featured listings', 'Advanced analytics', 'Candidate screening'],
    cta: 'Choose Professional',
    action: '/contact'
  },
  {
    name: 'Enterprise',
    price: '₹9,999',
    audience: 'For larger organizations',
    features: ['Unlimited job posts', 'Custom hiring workflows', 'Dedicated support', 'Team reporting'],
    cta: 'Talk to Sales',
    action: '/contact'
  }
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const element = document.getElementById(location.hash.replace('#', ''));
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <>
      <Seo
        title="Premium | HEXORA"
        description="Explore HEXORA premium hiring tools, featured roles, analytics, and team support."
      />

      <section className="premium-page-shell">
        <div className="premium-page-glow premium-page-glow-a" aria-hidden="true" />
        <div className="premium-page-glow premium-page-glow-b" aria-hidden="true" />

        <div className="shell premium-page-hero">
          <div className="premium-page-copy">
            <p className="premium-page-eyebrow">Premium hiring</p>
            <h1>Everything your team needs to hire faster.</h1>
            <p className="premium-page-subtitle">
              Premium is built for employers and candidates who want stronger visibility, better analytics,
              and a hiring flow that feels less noisy and more intentional.
            </p>

            <div className="premium-page-actions">
              <button type="button" className="premium-page-primary" onClick={() => navigate('/contact')}>
                Talk to sales <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="premium-page-secondary"
                onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                See what&apos;s included
              </button>
            </div>

            <div className="premium-page-points">
              <span><BadgeCheck size={15} /> Featured jobs</span>
              <span><UsersRound size={15} /> Candidate reach</span>
              <span><BriefcaseBusiness size={15} /> Hiring tools</span>
            </div>
          </div>

          <div className="premium-page-highlight">
            <div className="premium-page-highlight-card">
              <p>Why premium works</p>
              <strong>More visibility, less guesswork.</strong>
              <ul>
                <li>Priority placement in job discovery</li>
                <li>Better matching and screening support</li>
                <li>Insightful reports for your hiring team</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-page-section">
        <div className="shell">
          <div className="premium-section-heading">
            <p>Premium benefits</p>
            <h2>What you get when you upgrade</h2>
          </div>

          <div className="premium-benefits-grid">
            {benefitCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="premium-benefit-card" key={card.title}>
                  <span className="premium-benefit-icon"><Icon size={20} /></span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="premium-page-section premium-page-section-anchored" id="plans">
        <div className="shell">
          <div className="premium-section-heading">
            <p>Plans</p>
            <h2>Pick the right premium tier</h2>
          </div>

          <div className="premium-plans-grid">
            {plans.map((plan) => (
              <article className={`premium-plan-card ${plan.featured ? 'is-featured' : ''}`} key={plan.name}>
                {plan.featured ? <span className="premium-plan-badge">Most popular</span> : null}
                <p className="premium-plan-audience">{plan.audience}</p>
                <div className="premium-plan-price-row">
                  <h3>{plan.name}</h3>
                  <strong>{plan.price}</strong>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button type="button" className="premium-plan-cta" onClick={() => navigate(plan.action)}>
                  {plan.cta} <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}