import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });

  return (
    <>
      <Seo title="Admin Login | Hirexo" description="Sign in to access admin dashboard and manage platform resources." />
      <section className="section-block">
        <div className="shell">
          <Card className="form-card">
            <BrandIdentity className="auth-brand" subtitle="Admin portal" />
            <h1>Admin sign in</h1>
            <p className="form-meta text-sm" style={{ color: '#666', marginBottom: '1.5rem' }}>
              Admin access only. Unauthorized access attempts are monitored.
            </p>
            <form className="form-grid" onSubmit={handleSubmit(async (values) => {
              const user = await login(values);
              if (user.role === 'admin') {
                navigate('/admin/dashboard');
              } else {
                navigate('/');
              }
            })}>
              <Input 
                label="Email" 
                type="email" 
                placeholder="admin@hirexo.com" 
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
              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <Link to="/forgot-password" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}>
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <p className="text-sm" style={{ color: '#666', marginBottom: '1rem' }}>
                Not an admin? Return to public site.
              </p>
              <Link to="/" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
                Back to home
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
