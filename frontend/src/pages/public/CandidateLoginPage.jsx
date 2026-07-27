import { useNavigate, Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import LoginRecaptcha from '../../components/auth/LoginRecaptcha';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import './CandidateLoginPage.css';

const candidateHighlights = [
  { value: '1 tap', label: 'Fast apply flow' },
  { value: 'Private', label: 'Profile visibility' },
  { value: '24/7', label: 'Recruiter updates' }
];

const candidateBenefits = [
  'Track applications from a single dashboard.',
  'Keep your resume, profile, and alerts in sync.',
  'Return to shortlisted jobs and reply faster.'
];

export default function CandidateLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const captchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token || '');

    if (token) {
      clearErrors('recaptchaToken');
    }
  };

  return (
    <>
      <Seo title="Candidate Login | HEXORA" description="Sign in to manage applications and your profile." />
      <section className="section-block candidate-login-shell">
        <div className="shell candidate-login-shell-inner">
          <Card className="form-card candidate-login-card">
            <div className="candidate-login-grid">
              <aside className="candidate-login-hero">
                <div className="candidate-login-hero-badge">Candidate portal</div>
                <BrandIdentity className="auth-brand candidate-login-brand" subtitle="Candidate portal" />
                <h1>Sign in to your next opportunity</h1>
                <p className="candidate-login-copy">
                  Keep your applications, profile, and recruiter conversations in one polished place.
                </p>

                <div className="candidate-login-highlights" aria-label="Candidate portal highlights">
                  {candidateHighlights.map((item) => (
                    <article key={item.label} className="candidate-login-highlight">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </article>
                  ))}
                </div>

                <ul className="candidate-login-benefits">
                  {candidateBenefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </aside>

              <div className="candidate-login-form-panel">
                <div className="candidate-login-form-header">
                  <span className="candidate-login-eyebrow">Welcome back</span>
                  <h2>Continue where you left off</h2>
                  <p className="form-meta candidate-login-meta">
                    Sign in securely to review applications, update your profile, and move faster on new roles.
                  </p>
                </div>

                <form
                  className="form-grid"
                  onSubmit={handleSubmit(async (values) => {
                    if (!recaptchaToken) {
                      setError('recaptchaToken', { type: 'manual', message: 'Please complete the reCAPTCHA verification.' });
                      return;
                    }

                    try {
                      const user = await login({ ...values, recaptchaToken });
                      navigate(user.role === 'candidate' ? '/candidate/dashboard' : '/');
                    } catch (error) {
                      toast.error(error.message || 'Unable to sign in.');
                    } finally {
                      captchaRef.current?.reset?.();
                      setRecaptchaToken('');
                    }
                  })}
                >
                  <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
                  <Input label="Password" type="password" placeholder="Enter password" error={errors.password?.message} {...register('password')} />
                  <LoginRecaptcha
                    captchaRef={captchaRef}
                    error={errors.recaptchaToken?.message}
                    onChange={handleRecaptchaChange}
                    onExpired={() => setRecaptchaToken('')}
                  />
                  <div className="candidate-login-links-row">
                    <Link to="/forgot-password" className="candidate-login-link candidate-login-link-accent">
                      Forgot password?
                    </Link>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="candidate-login-submit">
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>

                <div className="candidate-login-social">
                  <SocialLoginButtons />
                </div>

                <div className="candidate-login-footer">
                  <p className="text-sm">
                    Don't have an account?{' '}
                    <Link to="/candidate/register" className="candidate-login-link candidate-login-link-strong">
                      Create one
                    </Link>
                  </p>
                  <p className="text-sm candidate-login-secondary-link">
                    Are you an employer?{' '}
                    <Link to="/employer/login" className="candidate-login-link">
                      Sign in here
                    </Link>
                  </p>
                  <Link to="/auth" className="candidate-login-back-link">
                    ← Back to authentication
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
