import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import { candidateRegisterSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

export default function CandidateRegisterPage() {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(candidateRegisterSchema) });

  return (
    <>
      <Seo title="Candidate Register | Hirexo" description="Create a candidate account and start applying to jobs." />
      <section className="section-block">
        <div className="shell">
          <Card className="form-card">
            <BrandIdentity className="auth-brand" subtitle="Candidate onboarding" />
            <h1>Create candidate account</h1>
            <p className="form-meta">Register to build your profile, upload a resume, and apply to jobs.</p>
            <form className="form-grid" onSubmit={handleSubmit(async (values) => { await registerCandidate(values); navigate('/candidate/dashboard'); })}>
              <Input label="Full name" placeholder="Enter your name" error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" placeholder="Create a password" error={errors.password?.message} {...register('password')} />
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</Button>
            </form>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <p className="text-sm" style={{ color: '#666', marginBottom: '0.75rem' }}>
                Already have an account?{' '}
                <Link to="/candidate/login" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '600' }}>
                  Sign in here
                </Link>
              </p>
              <p className="text-sm" style={{ color: '#999', marginBottom: '0.75rem' }}>
                Looking to hire? <Link to="/employer/register" style={{ color: '#0066cc', textDecoration: 'none' }}>Register as employer</Link>
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
