import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './DivisionSystem.css';

const publicPath = '/assets/divisions';

const divisions = [
  {
    id: 'trade',
    eyebrow: 'HEXORA',
    title: 'GLOBAL TRADE',
    img: `${publicPath}/global trade.png`,
    fallback: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    desc: 'International sourcing, procurement, import/export coordination, and trade partnership development.',
    badge: 'Coming Soon'
  },
  {
    id: 'foods',
    eyebrow: 'HEXORA',
    title: 'FOODS',
    img: `${publicPath}/foods.png`,
    fallback: 'https://images.unsplash.com/photo-1502741126161-b048400d6f00?auto=format&fit=crop&w=1200&q=80',
    desc: 'Food-related business initiatives focused on product opportunities, distribution partnerships, and market growth.',
    badge: 'Coming Soon'
  },
  {
    id: 'solutions',
    eyebrow: 'HEXORA',
    title: 'BUSINESS SOLUTIONS',
    img: `${publicPath}/business solutions.png`,
    fallback: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
    desc: 'Business support services that help companies improve operations, communication, and commercial execution.',
    badge: 'Coming Soon'
  },
  {
    id: 'talent',
    eyebrow: 'HEXORA',
    title: 'TALENT',
    img: `${publicPath}/talent.png`,
    fallback: 'https://images.unsplash.com/photo-1542223616-22d8b5c3b8d7?auto=format&fit=crop&w=1200&q=80',
    desc: 'Primary recruitment and workforce solutions division connecting employers with qualified professionals through staffing, talent acquisition, and candidate placement support.',
    cta: { text: 'Explore', to: '/jobs' }
  },
  {
    id: 'hr',
    eyebrow: 'HEXORA',
    title: 'HR CONSULTING',
    img: `${publicPath}/hr consulting.png`,
    fallback: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    desc: 'Strategic HR advisory, policy guidance, talent planning, and people operations support for growing organizations.',
    badge: 'Coming Soon'
  }
];

export default function DivisionSystem() {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.12 });

    el.querySelectorAll('.division-card').forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="divisions-section-top" className="divisions-section">
      <div className="shell">
        <div className="divisions-header">
          <p className="divisions-eyebrow">DIVISION SYSTEM</p>
          <h2 className="divisions-sub">One Group. Five Specialized Business Divisions.</h2>
        </div>

        <div className="divisions-row" ref={rootRef}>
          {divisions.map((d) => (
            <article className="division-card" key={d.id} role="article">
              <img className="division-image" src={d.img} alt="" onError={(e) => { if (e.currentTarget.src !== d.fallback) e.currentTarget.src = d.fallback; }} />
              <div className="division-body">
                <div className="division-eyebrow">{d.eyebrow}</div>
                <h3 className="division-title">{d.title}</h3>
                <p className="division-desc">{d.desc}</p>
                <div className="division-actions">
                  {d.badge && <span className="division-badge">{d.badge}</span>}
                  {d.cta && (
                    <Link to={d.cta.to} className="division-cta">{d.cta.text} <span aria-hidden>→</span></Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
