import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { candidateRegisterSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import './CandidateRegisterPage.css';

const candidateRegisterSteps = [
  { value: '01', label: 'Build profile' },
  { value: '02', label: 'Upload resume' },
  { value: '03', label: 'Apply faster' }
];

const candidateRegisterBenefits = [
  'Create a standout profile recruiters can actually scan quickly.',
  'Keep your details, resume, and applications neatly organized.',
  'Start with a cleaner onboarding experience that feels premium.'
];

const experienceOptions = [
  { value: '', label: 'Select experience' },
  { value: '0-1', label: '0-1 years' },
  { value: '2-4', label: '2-4 years' },
  { value: '5-plus', label: '5+ years' }
];

const roleOptions = [
  { value: '', label: 'Select target role' },
  { value: 'frontend-developer', label: 'Frontend Developer' },
  { value: 'backend-developer', label: 'Backend Developer' },
  { value: 'fullstack-developer', label: 'Full Stack Developer' },
  { value: 'ui-ux-designer', label: 'UI/UX Designer' },
  { value: 'qa-engineer', label: 'QA Engineer' },
  { value: 'project-manager', label: 'Project Manager' }
];

export default function CandidateRegisterPage() {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(candidateRegisterSchema),
    defaultValues: { experienceYears: '', primaryRole: '' }
  });

  return (
    <>
      <Seo title="Candidate Register | HEXORA" description="Create a candidate account and start applying to jobs." />
      <section className="section-block candidate-register-shell">
        <div className="shell candidate-register-shell-inner">
          <Card className="form-card candidate-register-card">
            <div className="candidate-register-grid">
              <aside className="candidate-register-hero">
                <div className="candidate-register-badge">Candidate onboarding</div>
                <BrandIdentity className="auth-brand candidate-register-brand" subtitle="Candidate onboarding" />
                <h1>Create your profile with a premium start</h1>
                <p className="candidate-register-copy">
                  Set up your job seeker profile with a modern onboarding flow that feels polished from the first step.
                </p>

                <div className="candidate-register-steps">
                  {candidateRegisterSteps.map((item) => (
                    <article key={item.label} className="candidate-register-step">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </article>
                  ))}
                </div>

                <ul className="candidate-register-benefits">
                  {candidateRegisterBenefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </aside>

              <div className="candidate-register-form-panel">
                <div className="candidate-register-form-header">
                  <span className="candidate-register-eyebrow">Start here</span>
                  <h2>Join the talent side</h2>
                  <p className="form-meta candidate-register-meta">
                    Register once and keep your applications, resume, and profile ready whenever a role opens.
                  </p>
                </div>

                <form className="form-grid" onSubmit={handleSubmit(async (values) => { await registerCandidate(values); navigate('/candidate/dashboard'); })}>
                  <Input label="Full name" placeholder="Enter your name" error={errors.name?.message} {...register('name')} />
                  <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
                  <Input label="Password" type="password" placeholder="Create a password" error={errors.password?.message} {...register('password')} />
                  <label className="field">
                    <span className="field-label">Experience years</span>
                    <select className="input" {...register('experienceYears')}>
                      {experienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.experienceYears ? <span className="field-error">{errors.experienceYears.message}</span> : null}
                  </label>
                  <label className="field">
                    <span className="field-label">Primary role</span>
                    <select className="input" {...register('primaryRole')}>
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.primaryRole ? <span className="field-error">{errors.primaryRole.message}</span> : null}
                  </label>
                  <Button type="submit" disabled={isSubmitting} className="candidate-register-submit">{isSubmitting ? 'Creating account...' : 'Create account'}</Button>
                </form>

                <div className="candidate-register-social">
                  <SocialLoginButtons />
                </div>

                <div className="candidate-register-footer">
                  <p className="text-sm">
                    Already have an account?{' '}
                    <Link to="/candidate/login" className="candidate-register-link candidate-register-link-strong">
                      Sign in here
                    </Link>
                  </p>
                  <p className="text-sm candidate-register-secondary">
                    Looking to hire?{' '}
                    <Link to="/employer/register" className="candidate-register-link">
                      Register as employer
                    </Link>
                  </p>
                  <Link to="/auth" className="candidate-register-back-link">
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
