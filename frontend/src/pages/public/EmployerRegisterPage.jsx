import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import { employerRegisterSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployerRegisterPage() {
  const navigate = useNavigate();
  const { registerEmployer } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(employerRegisterSchema) });

  return (
    <>
      <Seo title="Employer Register | Hirexo" description="Create an employer account and start posting jobs." />
      <section className="section-block">
        <div className="shell">
          <Card className="form-card">
            <BrandIdentity className="auth-brand" subtitle="Employer onboarding" />
            <h1>Create employer account</h1>
            <p className="form-meta">Register your company to post jobs and connect with top talent.</p>
            <form className="form-grid" onSubmit={handleSubmit(async (values) => { await registerEmployer(values); navigate('/employer/dashboard'); })}>
              <Input label="Company name" placeholder="Acme Hiring Pvt Ltd" error={errors.companyName?.message} {...register('companyName')} />
              <Input label="Full name" placeholder="Hiring manager name" error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" placeholder="Create a password" error={errors.password?.message} {...register('password')} />
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create employer account'}</Button>
            </form>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <p className="text-sm" style={{ color: '#666', marginBottom: '0.75rem' }}>
                Already registered?{' '}
                <Link to="/employer/login" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '600' }}>
                  Sign in here
                </Link>
              </p>
              <p className="text-sm" style={{ color: '#999', marginBottom: '0.75rem' }}>
                Looking for a job? <Link to="/candidate/register" style={{ color: '#0066cc', textDecoration: 'none' }}>Register as candidate</Link>
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
