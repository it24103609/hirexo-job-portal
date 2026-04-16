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

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  return (
    <>
      <Seo title="Forgot Password | Hirexo" description="Request a password reset link for your Hirexo account." />
      <section className="section-block">
        <div className="shell">
          <Card className="form-card">
            <BrandIdentity className="auth-brand" subtitle="Password recovery" />
            <h1>Forgot your password?</h1>
            <p className="form-meta">Enter your registered email and we&apos;ll send you a reset link.</p>
            <form className="form-grid" onSubmit={handleSubmit(async (values) => {
              const response = await authApi.forgotPassword(values);
              toast.success(response.message || 'Reset link sent');
            })}>
              <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending link...' : 'Send reset link'}</Button>
            </form>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <p className="text-sm" style={{ color: '#666', marginBottom: '0.75rem' }}>
                Remembered your password? <Link to="/candidate/login" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '600' }}>Candidate sign in</Link>
              </p>
              <p className="text-sm" style={{ color: '#999', marginBottom: '0.75rem' }}>
                Employer account? <Link to="/employer/login" style={{ color: '#0066cc', textDecoration: 'none' }}>Employer sign in</Link>
              </p>
              <Link to="/auth" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
                ← Back to authentication
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
