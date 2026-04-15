import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Lock, Sparkles, ShieldCheck, UserRound } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import BrandIdentity from '../../components/layout/BrandIdentity';
import './AuthPage.css';

export default function AuthPage() {
  const authOptions = [
    {
      role: 'candidate',
      title: 'Join as a Candidate',
      description: 'Search and apply to roles that match your skills, goals, and preferred work style.',
      icon: UserRound,
      tag: 'For job seekers',
      links: [
        { label: 'Create account', href: '/candidate/register', isPrimary: true },
        { label: 'Already registered? Sign in', href: '/candidate/login', isPrimary: false }
      ]
    },
    {
      role: 'employer',
      title: 'Join as an Employer',
      description: 'Post openings, review top candidates, and move faster with a structured hiring flow.',
      icon: Briefcase,
      tag: 'For hiring teams',
      links: [
        { label: 'Create employer account', href: '/employer/register', isPrimary: true },
        { label: 'Already registered? Sign in', href: '/employer/login', isPrimary: false }
      ]
    }
  ];

  const trustPoints = [
    'Fast role-based onboarding',
    'Secure access for every team',
    'Candidate and employer workflows in one place'
  ];

  return (
    <>
      <Seo title="Sign In or Register | Hirexo" description="Join Hirexo as a candidate or employer." />
      <section className="auth-landing-shell">
        <div className="auth-ambient auth-ambient-a" aria-hidden="true" />
        <div className="auth-ambient auth-ambient-b" aria-hidden="true" />
        <div className="auth-ambient auth-ambient-c" aria-hidden="true" />

        <div className="shell auth-landing-grid">
          <div className="auth-intro-panel">
            <div className="auth-brand-row">
              <BrandIdentity className="auth-brand" subtitle="Premium recruitment platform" />
              <span className="auth-brand-pill">
                <Sparkles size={14} /> Trusted hiring workflows
              </span>
            </div>

            <p className="auth-eyebrow">Recruitment, simplified</p>
            <h1>How would you like to use Hirexo?</h1>
            <p className="auth-subtitle">
              Choose the path that fits you best. Hirexo keeps candidate and employer journeys focused,
              secure, and easy to navigate from the very first click.
            </p>

            <div className="auth-trust-panel">
              <div className="auth-trust-heading">
                <ShieldCheck size={18} /> Built for modern hiring teams
              </div>
              <ul className="auth-trust-list">
                {trustPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="auth-choices-panel">
            <div className="auth-options-grid">
              {authOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <div key={option.role} className="auth-option-card">
                    <div className="auth-option-icon-wrap" aria-hidden="true">
                      <Icon size={26} />
                    </div>

                    <span className="auth-option-tag">{option.tag}</span>
                    <h3>{option.title}</h3>
                    <p>{option.description}</p>

                    <div className="auth-option-links">
                      {option.links.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={`auth-option-link ${link.isPrimary ? 'primary' : 'secondary'}`}
                        >
                          {link.label}
                          {link.isPrimary ? <ArrowRight size={16} /> : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="auth-admin-section">
              <div className="auth-admin-copy">
                <span className="auth-admin-icon" aria-hidden="true">
                  <Lock size={16} />
                </span>
                <div>
                  <h3>Administrator Access</h3>
                  <p>
                    Secure, restricted access for platform operators and internal teams.
                  </p>
                </div>
              </div>
              <Link to="/admin/login" className="auth-admin-link">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
