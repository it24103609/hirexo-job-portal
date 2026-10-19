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
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLoginPage.css';

const adminPillars = [
  { value: 'Secure', label: 'Access control' },
  { value: 'Audited', label: 'Activity logging' },
  { value: 'Priority', label: 'Operations only' }
];

const adminChecklist = [
  'Restricted entry for platform administrators only.',
  'Quick access to moderation, reports, and system controls.',
  'A sharper visual layer that signals high-trust access.'
];

export default function AdminLoginPage() {
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
      <Seo title="Admin Login | HEXORA" description="Sign in to access admin dashboard and manage platform resources." />
      <section className="section-block admin-login-shell">
        <div className="shell admin-login-shell-inner">
          <Card className="form-card admin-login-card">
            <div className="admin-login-grid">
              <aside className="admin-login-hero">
                <div className="admin-login-badge">Secure access</div>
                <BrandIdentity className="auth-brand admin-login-brand" subtitle="Admin portal" />
                <h1>Admin access with a security-first feel</h1>
                <p className="admin-login-copy">
                  This workspace is designed to feel controlled, calm, and high-trust for platform operators.
                </p>

                <div className="admin-login-pillars">
                  {adminPillars.map((item) => (
                    <article key={item.label} className="admin-login-pillar">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </article>
                  ))}
                </div>

                <ul className="admin-login-checklist">
                  {adminChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </aside>

              <div className="admin-login-form-panel">
                <div className="admin-login-form-header">
                  <span className="admin-login-eyebrow">Restricted entry</span>
                  <h2>Sign in to manage the platform</h2>
                  <p className="form-meta admin-login-meta">
                    Use your administrator account to access moderation, analytics, and system controls.
                  </p>
                </div>

                <form className="form-grid" onSubmit={handleSubmit(async (values) => {
              if (!recaptchaToken) {
                setError('recaptchaToken', { type: 'manual', message: 'Please complete the reCAPTCHA verification.' });
                return;
              }

              try {
                const user = await login({ ...values, recaptchaToken });
                if (user.role === 'admin') {
                  navigate('/admin/dashboard');
                } else {
                  toast.error('This account does not have admin access.');
                  navigate('/');
                }
              } catch (error) {
                toast.error(error.message || 'Unable to sign in.');
              } finally {
                captchaRef.current?.reset?.();
                setRecaptchaToken('');
              }
            })}>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="admin@HEXORA.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <LoginRecaptcha
                    captchaRef={captchaRef}
                    error={errors.recaptchaToken?.message}
                    onChange={handleRecaptchaChange}
                    onExpired={() => setRecaptchaToken('')}
                  />
                  <Button type="submit" disabled={isSubmitting} className="admin-login-submit">
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>

                <div className="admin-login-footer">
                  <p className="text-sm admin-login-footer-copy">
                    Not an admin? Return to the public site.
                  </p>
                  <Link to="/" className="admin-login-back-link">
                    Back to home
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
