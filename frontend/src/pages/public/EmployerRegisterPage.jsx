import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandIdentity from '../../components/layout/BrandIdentity';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { employerRegisterSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import './EmployerRegisterPage.css';

const employerRegisterHighlights = [
  { value: 'Launch', label: 'Your next role post' },
  { value: 'Scale', label: 'Hiring pipeline' },
  { value: 'Trusted', label: 'Brand presence' }
];

const employerRegisterBenefits = [
  'Showcase your company with a cleaner, premium employer profile.',
  'Post roles and manage candidate flow in one organized workspace.',
  'Feel more confident onboarding with a sharper modern interface.'
];

const companySizeOptions = [
  { value: '', label: 'Select company size' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '200-plus', label: '200+ employees' }
];

const hiringFocusOptions = [
  { value: '', label: 'Select hiring focus' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'sales', label: 'Sales' },
  { value: 'operations', label: 'Operations' },
  { value: 'support', label: 'Support' },
  { value: 'mixed', label: 'Mixed roles' }
];

export default function EmployerRegisterPage() {
  const navigate = useNavigate();
  const { registerEmployer } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(employerRegisterSchema),
    defaultValues: { companySize: '', hiringFocus: '' }
  });

  return (
    <>
      <Seo title="Employer Register | HEXORA" description="Create an employer account and start posting jobs." />
      <section className="section-block employer-register-shell">
        <div className="shell employer-register-shell-inner">
          <Card className="form-card employer-register-card">
            <div className="employer-register-grid">
              <aside className="employer-register-hero">
                <div className="employer-register-badge">Employer onboarding</div>
                <BrandIdentity className="auth-brand employer-register-brand" subtitle="Employer onboarding" />
                <h1>Build your hiring presence with confidence</h1>
                <p className="employer-register-copy">
                  Create a company account that feels polished, credible, and ready for active hiring.
                </p>

                <div className="employer-register-highlights">
                  {employerRegisterHighlights.map((item) => (
                    <article key={item.label} className="employer-register-highlight">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </article>
                  ))}
                </div>

                <ul className="employer-register-benefits">
                  {employerRegisterBenefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </aside>

              <div className="employer-register-form-panel">
                <div className="employer-register-form-header">
                  <span className="employer-register-eyebrow">Start hiring</span>
                  <h2>Create your company account</h2>
                  <p className="form-meta employer-register-meta">
                    Register your company and get ready to post jobs, manage applicants, and grow your team.
                  </p>
                </div>

                <form className="form-grid" onSubmit={handleSubmit(async (values) => { await registerEmployer(values); navigate('/employer/dashboard'); })}>
                  <Input label="Company name" placeholder="Acme Hiring Pvt Ltd" error={errors.companyName?.message} {...register('companyName')} />
                  <Input label="Full name" placeholder="Hiring manager name" error={errors.name?.message} {...register('name')} />
                  <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
                  <Input label="Password" type="password" placeholder="Create a password" error={errors.password?.message} {...register('password')} />
                  <label className="field">
                    <span className="field-label">Company size</span>
                    <select className="input" {...register('companySize')}>
                      {companySizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.companySize ? <span className="field-error">{errors.companySize.message}</span> : null}
                  </label>
                  <label className="field">
                    <span className="field-label">Hiring focus</span>
                    <select className="input" {...register('hiringFocus')}>
                      {hiringFocusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.hiringFocus ? <span className="field-error">{errors.hiringFocus.message}</span> : null}
                  </label>
                  <Button type="submit" disabled={isSubmitting} className="employer-register-submit">{isSubmitting ? 'Creating account...' : 'Create employer account'}</Button>
                </form>

                <div className="employer-register-social">
                  <SocialLoginButtons />
                </div>

                <div className="employer-register-footer">
                  <p className="text-sm">
                    Already registered?{' '}
                    <Link to="/employer/login" className="employer-register-link employer-register-link-strong">
                      Sign in here
                    </Link>
                  </p>
                  <p className="text-sm employer-register-secondary">
                    Looking for a job?{' '}
                    <Link to="/candidate/register" className="employer-register-link">
                      Register as candidate
                    </Link>
                  </p>
                  <Link to="/auth" className="employer-register-back-link">
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
