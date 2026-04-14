import { Link } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import BrandIdentity from '../../components/layout/BrandIdentity';
import './AuthPage.css';

export default function AuthPage() {
  const authOptions = [
    {
      role: 'candidate',
      title: 'Join as a Candidate',
      description: 'Search and apply to jobs that match your skills and interests',
      links: [
        { label: 'Create account', href: '/candidate/register', isPrimary: true },
        { label: 'Already registered? Sign in', href: '/candidate/login', isPrimary: false }
      ]
    },
    {
      role: 'employer',
      title: 'Join as an Employer',
      description: 'Post jobs and find the best talent for your organization',
      links: [
        { label: 'Create employer account', href: '/employer/register', isPrimary: true },
        { label: 'Already registered? Sign in', href: '/employer/login', isPrimary: false }
      ]
    }
  ];

  return (
    <>
      <Seo title="Sign In or Register | Hirexo" description="Join Hirexo as a candidate or employer." />
      <section className="section-block">
        <div className="shell">
          <Card className="auth-entry-card">
            <BrandIdentity className="auth-brand" subtitle="Welcome to Hirexo" />
            <h1>How would you like to use Hirexo?</h1>
            <p className="form-meta">Choose your role to get started</p>

            <div className="auth-options-grid">
              {authOptions.map((option) => (
                <div key={option.role} className="auth-option-card">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                  <div className="auth-option-links">
                    {option.links.map((link, idx) => (
                      <Link 
                        key={idx}
                        to={link.href} 
                        className={`auth-option-link ${link.isPrimary ? 'primary' : 'secondary'}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="auth-divider">
              <span>Administrator Access</span>
            </div>

            <div className="auth-admin-section">
              <p className="text-sm">
                Authorized administrators access the platform through secure credentials.
              </p>
              <Link to="/admin/login" className="auth-admin-link">
                Admin Login
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
