import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import { authApi } from '../../services/auth.api';
import { forgotPasswordSchema } from '../../utils/validators';
import './ForgotPasswordPage.css';

const recoveryPoints = [
  { value: '01', label: 'Enter email' },
  { value: '02', label: 'Check inbox' },
  { value: '03', label: 'Reset password' }
];

const recoveryNotes = [
  'A clean, calm recovery flow that keeps you moving quickly.',
  'Your reset link goes only to the email on your HEXORA account.',
  'Return to signing in with a fresh password in just a few steps.'
];

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  return (
    <>
      <Seo title="Forgot Password | HEXORA" description="Request a password reset link for your HEXORA account." />
      <section className="section-block forgot-password-shell">
        <div className="shell forgot-password-shell-inner">
          <Card className="form-card forgot-password-card">
            <div className="forgot-password-grid">
              <aside className="forgot-password-hero">
                <div className="forgot-password-badge">Password recovery</div>
                <BrandIdentity className="auth-brand forgot-password-brand" subtitle="Password recovery" />
                <h1>Reset your access without the clutter</h1>
                <p className="forgot-password-copy">
                  Use the same polished green-first experience to quickly get back into your HEXORA account.
                </p>

                <div className="forgot-password-points">
                  {recoveryPoints.map((item) => (
                    <article key={item.label} className="forgot-password-point">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </article>
                  ))}
                </div>

                <ul className="forgot-password-notes">
                  {recoveryNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </aside>

              <div className="forgot-password-form-panel">
                <div className="forgot-password-form-header">
                  <span className="forgot-password-eyebrow">Secure reset</span>
                  <h2>Request a password reset link</h2>
                  <p className="form-meta forgot-password-meta">
                    Enter the email linked to your account and we&apos;ll send the reset instructions there.
                  </p>
                </div>

                <form className="form-grid" onSubmit={handleSubmit(async (values) => {
              const response = await authApi.forgotPassword(values);
              toast.success(response.message || 'Reset link sent');
                })}>
                  <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
                  <Button type="submit" disabled={isSubmitting} className="forgot-password-submit">
                    {isSubmitting ? 'Sending link...' : 'Send reset link'}
                  </Button>
                </form>

                <div className="forgot-password-footer">
                  <p className="text-sm">
                    Remembered your password?{' '}
                    <Link to="/candidate/login" className="forgot-password-link forgot-password-link-strong">
                      Candidate sign in
                    </Link>
                  </p>
                  <p className="text-sm forgot-password-secondary">
                    Employer account?{' '}
                    <Link to="/employer/login" className="forgot-password-link">
                      Employer sign in
                    </Link>
                  </p>
                  <Link to="/auth" className="forgot-password-back-link">
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
