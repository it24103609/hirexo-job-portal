import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import { authApi } from '../../services/auth.api';
import { resetPasswordSchema } from '../../utils/validators';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const hasToken = Boolean(token);

  return (
    <>
      <Seo title="Reset Password | Hirexo" description="Set a new password for your Hirexo account." />
      <section className="section-block">
        <div className="shell">
          <Card className="form-card">
            <BrandIdentity className="auth-brand" subtitle="Reset access" />
            <h1>Set a new password</h1>
            {hasToken ? (
              <>
                <p className="form-meta">Choose a strong password with at least 6 characters.</p>
                <form className="form-grid" onSubmit={handleSubmit(async (values) => {
                  await authApi.resetPassword({ token, newPassword: values.newPassword });
                  toast.success('Password updated. Please sign in with your new password.');
                  navigate('/candidate/login');
                })}>
                  <Input label="New password" type="password" placeholder="Enter new password" error={errors.newPassword?.message} {...register('newPassword')} />
                  <Input label="Confirm password" type="password" placeholder="Re-enter new password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating password...' : 'Reset password'}</Button>
                </form>
              </>
            ) : (
              <>
                <p className="form-meta">This reset link is missing or incomplete. Request a fresh password reset email to continue.</p>
                <Button as={Link} to="/forgot-password">Request new reset link</Button>
              </>
            )}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
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
