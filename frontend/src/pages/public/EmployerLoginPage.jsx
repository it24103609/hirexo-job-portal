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
import './EmployerLoginPage.css';

const employerSignals = [
  { value: 'Faster', label: 'Hiring workflow' },
  { value: 'Smarter', label: 'Applicant pipeline' },
  { value: 'Live', label: 'Team visibility' }
];

const employerBenefits = [
  'Review applicants and shortlist faster.',
  'Keep jobs, company profile, and messages in one place.',
  'Stay on top of active openings with a cleaner dashboard.'
];

export default function EmployerLoginPage() {
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
      <Seo title="Employer Login | HEXORA" description="Sign in to manage company profile, jobs, and applicants." />
      <section className="section-block employer-login-shell">
        <div className="shell employer-login-shell-inner">
          <Card className="form-card employer-login-card">
            <div className="employer-login-grid">
              <aside className="employer-login-hero">
                <div className="employer-login-badge">Employer portal</div>
                <BrandIdentity className="auth-brand employer-login-brand" subtitle="Employer portal" />
                <h1>Sign in to hire with momentum</h1>
                <p className="employer-login-copy">
                  Bring jobs, applicants, and company updates into one polished workspace built for recruiters.
                </p>

                <div className="employer-login-signals">
                  {employerSignals.map((item) => (
                    <article key={item.label} className="employer-login-signal">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </article>
                  ))}
                </div>

                <ul className="employer-login-benefits">
                  {employerBenefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </aside>

              <div className="employer-login-form-panel">
                <div className="employer-login-form-header">
                  <span className="employer-login-eyebrow">Welcome back</span>
                  <h2>Pick up your hiring flow</h2>
                  <p className="form-meta employer-login-meta">
                    Sign in to review applicants, update your profile, and keep your open roles moving.
                  </p>
                </div>

                <form className="form-grid" onSubmit={handleSubmit(async (values) => {
              if (!recaptchaToken) {
                setError('recaptchaToken', { type: 'manual', message: 'Please complete the reCAPTCHA verification.' });
                return;
              }

              try {
                const user = await login({ ...values, recaptchaToken });
                navigate(user.role === 'employer' ? '/employer/dashboard' : '/');
              } catch (error) {
                toast.error(error.message || 'Unable to sign in.');
              } finally {
                captchaRef.current?.reset?.();
                setRecaptchaToken('');
              }
            })}>
                  <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
                  <Input label="Password" type="password" placeholder="Enter password" error={errors.password?.message} {...register('password')} />
                  <LoginRecaptcha
                    captchaRef={captchaRef}
                    error={errors.recaptchaToken?.message}
                    onChange={handleRecaptchaChange}
                    onExpired={() => setRecaptchaToken('')}
                  />
                  <div className="employer-login-links-row">
                    <Link to="/forgot-password" className="employer-login-link employer-login-link-accent">
                      Forgot password?
                    </Link>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="employer-login-submit">
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>

                <div className="employer-login-social">
                  <SocialLoginButtons />
                </div>

                <div className="employer-login-footer">
                  <p className="text-sm">
                    Don't have an account?{' '}
                    <Link to="/employer/register" className="employer-login-link employer-login-link-strong">
                      Create one
                    </Link>
                  </p>
                  <p className="text-sm employer-login-secondary-link">
                    Are you a candidate?{' '}
                    <Link to="/candidate/login" className="employer-login-link">
                      Sign in here
                    </Link>
                  </p>
                  <Link to="/auth" className="employer-login-back-link">
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
