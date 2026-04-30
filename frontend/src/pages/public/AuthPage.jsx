import { Link } from 'react-router-dom';
import {
  ArrowRight,
  GitBranch,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import candidate3d from '../../assets/onboarding/candidate-3d.png';
import employer3d from '../../assets/onboarding/employer-3d.png';
import onboarding3d from '../../assets/onboarding/hirexo-onboarding-3d.png';
import adminSecurity3d from '../../assets/onboarding/admin-security-3d.png';
import './AuthPage.css';

const authOptions = [
  {
    role: 'candidate',
    title: 'Join as a Candidate',
    description: 'Search and apply to roles that match your skills, goals, and preferred work style.',
    tag: 'For Job Seekers',
    image: candidate3d,
    trustText: 'Free to start',
    links: [
      { label: 'Create account', href: '/candidate/register', isPrimary: true },
      { label: 'Already registered? Sign in', href: '/candidate/login', isPrimary: false }
    ]
  },
  {
    role: 'employer',
    title: 'Join as an Employer',
    description: 'Post openings, review top candidates, and move faster with a structured hiring flow.',
    tag: 'For Hiring Teams',
    image: employer3d,
    trustText: 'Built for hiring teams',
    links: [
      { label: 'Create employer account', href: '/employer/register', isPrimary: true },
      { label: 'Already registered? Sign in', href: '/employer/login', isPrimary: false }
    ]
  }
];

const benefits = [
  {
    title: 'Built for modern hiring teams',
    text: 'Designed to simplify complex recruitment workflows.',
    icon: UsersRound
  },
  {
    title: 'Fast role-based onboarding',
    text: 'Get your teams up and running quickly and securely.',
    icon: ShieldCheck
  },
  {
    title: 'Secure access for every team',
    text: 'Granular permissions and data security you can trust.',
    icon: LockKeyhole
  },
  {
    title: 'One place for all workflows',
    text: 'Manage candidates, jobs, and communications seamlessly.',
    icon: GitBranch
  }
];

function OnboardingIllustration() {
  return (
    <div className="auth-hero-visual" aria-label="Recruitment dashboard, candidate profiles, and secure hiring workspace">
      <span className="auth-floating-chip chip-access"><ShieldCheck size={14} /> Role-based access</span>
      <span className="auth-floating-chip chip-secure"><LockKeyhole size={14} /> Secure onboarding</span>
      <span className="auth-floating-chip chip-flow"><GitBranch size={14} /> Smart hiring flow</span>

      <div className="auth-hero-image-card">
        <img src={onboarding3d} alt="People using laptops beside a recruitment dashboard with candidate rows, growth chart, and security shield" />
      </div>
    </div>
  );
}

function RoleIllustration({ image, role }) {
  return (
    <div className={`auth-role-illustration ${role}`} aria-hidden="true">
      <div className="role-image-shell">
        <img src={image} alt="" />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <>
      <Seo title="Sign In or Register | Hirexo" description="Join Hirexo as a candidate, employer, or administrator." />
      <section className="auth-landing-shell">
        <div className="auth-ambient auth-ambient-a" aria-hidden="true" />
        <div className="auth-ambient auth-ambient-b" aria-hidden="true" />
        <div className="auth-ambient auth-ambient-c" aria-hidden="true" />

        <div className="shell auth-onboarding-grid">
          <div className="auth-intro-panel">
            <p className="auth-eyebrow"><Sparkles size={14} /> Recruitment, Simplified</p>
            <h1>
              How would you like to use <span>Hirexo?</span>
            </h1>
            <p className="auth-subtitle">
              Choose the path that fits you best. Hirexo keeps candidate and employer journeys focused,
              secure, and easy to navigate from the very first click.
            </p>
            <OnboardingIllustration />
          </div>

          <div className="auth-choices-panel">
            <div className="auth-options-grid">
              {authOptions.map((option) => (
                <article key={option.role} className="auth-option-card">
                  <span className="auth-option-tag">{option.tag}</span>
                  <RoleIllustration image={option.image} role={option.role} />
                  <h2>{option.title}</h2>
                  <p>{option.description}</p>

                  <div className="auth-option-links">
                    {option.links.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`auth-option-link ${link.isPrimary ? 'primary' : 'secondary'}`}
                      >
                        {link.label} <ArrowRight size={16} />
                      </Link>
                    ))}
                  </div>
                  <small className="auth-option-trust">{option.trustText}</small>
                </article>
              ))}
            </div>

            <article className="auth-admin-section">
              <div className="auth-admin-copy">
                <span className="auth-admin-icon" aria-hidden="true">
                  <LockKeyhole size={22} />
                </span>
                <div>
                  <span className="auth-admin-badge">Restricted Access</span>
                  <h2>Administrator Access</h2>
                  <p>Secure, restricted access for platform operators and internal teams.</p>
                  <Link to="/admin/login" className="auth-admin-link">
                    Admin Login <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="auth-admin-visual" aria-hidden="true">
                <span className="admin-glow" />
                <img src={adminSecurity3d} alt="" />
              </div>
            </article>
          </div>

          <div className="auth-benefits-strip">
            {benefits.map(({ title, text, icon: Icon }) => (
              <article key={title} className="auth-benefit-card">
                <span><Icon size={28} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
