import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import { resetPasswordSchema } from '../../utils/validators';
import { authApi } from '../../services/auth.api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  return (
    <>
      <Seo title="Reset Password | Hirexo" description="Set a new password for your Hirexo account." />
      <section className="section-block">
        <div className="shell">
          <Card className="form-card">
            <BrandIdentity className="auth-brand" subtitle="Set a new password" />
            <h1>Reset password</h1>
            <p className="form-meta" style={{ color: '#666', marginBottom: '1.5rem' }}>
              Choose a new password for your account.
            </p>
            {!token ? (
              <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '12px', padding: '1rem', color: '#9a3412' }}>
                This reset link is incomplete. Open the link from your email again.
              </div>
            ) : (
              <form
                className="form-grid"
                onSubmit={handleSubmit(async (values) => {
                  const response = await authApi.resetPassword({ token, newPassword: values.password });
                  toast.success(response.message || 'Password reset successfully');
                  navigate('/auth');
                })}
              >
                <Input
                  label="New password"
                  type="password"
                  placeholder="Enter your new password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  placeholder="Re-enter your new password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update password'}
                </Button>
              </form>
            )}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <Link to="/auth" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
                Back to sign in
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
