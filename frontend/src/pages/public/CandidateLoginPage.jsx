import { useNavigate, Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import LoginRecaptcha from '../../components/auth/LoginRecaptcha';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import './CandidateLoginPage.css';

export default function CandidateLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const captchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token || '');
    if (token) {
      clearErrors('recaptchaToken');
    }
  };

  return (
    <>
      <Seo title="Candidate Login | HEXORA" description="Sign in to your candidate workspace to manage applications and profile." />

      <section className="candidate-login-shell">
        <div className="candidate-login-container">
          <div className="candidate-login-grid">

            {/* Left Side: 3D Cartoon Hero Image & Title */}
            <div className="candidate-left-panel">
              <div className="candidate-illustration-wrap">
                {!imgError ? (
                  <img
                    src="/images/candidate_3d_cartoon_hero.png"
                    alt="Candidate 3D Workspace"
                    className="candidate-hero-img"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <svg className="candidate-hero-img" viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="70" y="160" width="260" height="8" rx="4" stroke="#10b981" strokeWidth="2.5" fill="#FFFFFF" />
                    <rect x="145" y="75" width="110" height="72" rx="6" stroke="#10b981" strokeWidth="2.5" fill="#FFFFFF" />
                    <rect x="153" y="83" width="94" height="56" rx="3" fill="#D1FAE5" />
                    <path d="M190 147V160M210 147V160" stroke="#10b981" strokeWidth="2.5" />
                    <path d="M175 160H225" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="270" y="138" width="18" height="22" rx="3" stroke="#10b981" strokeWidth="2" fill="#FFFFFF" />
                  </svg>
                )}
              </div>
              <h2 className="candidate-left-title">Welcome to your workspace</h2>
              <p className="candidate-left-subtitle">
                Sign in to access your candidate portal, track job applications, and connect directly with top hiring managers.
              </p>
            </div>

            {/* Right Side: Compact Clean Form (100vh Zero-Scroll) */}
            <div className="candidate-right-panel">
              <div className="candidate-clean-card">
                
                {/* Header */}
                <div className="candidate-card-header">
                  <h1 className="candidate-card-title">Welcome back</h1>
                </div>

                {/* Form */}
                <form
                  className="candidate-minimal-form"
                  onSubmit={handleSubmit(async (values) => {
                    if (!recaptchaToken) {
                      setError('recaptchaToken', { type: 'manual', message: 'Please complete the security check.' });
                      return;
                    }

                    try {
                      const user = await login({ ...values, recaptchaToken });
                      toast.success('Signed in successfully!');
                      navigate(user.role === 'candidate' ? '/candidate/dashboard' : '/');
                    } catch (error) {
                      toast.error(error.message || 'Unable to sign in.');
                    } finally {
                      captchaRef.current?.reset?.();
                      setRecaptchaToken('');
                    }
                  })}
                >
                  {/* Email Input */}
                  <div className="candidate-input-block">
                    <div className="candidate-field-wrapper">
                      <input
                        type="email"
                        placeholder="Email address"
                        className="candidate-clean-input"
                        {...register('email')}
                      />
                      <div className="candidate-input-icons-right">
                        <Mail size={18} />
                      </div>
                    </div>
                    {errors.email?.message && <span className="candidate-field-error">{errors.email.message}</span>}
                  </div>

                  {/* Password Input */}
                  <div className="candidate-input-block">
                    <div className="candidate-field-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="candidate-clean-input"
                        {...register('password')}
                      />
                      <div className="candidate-input-icons-right">
                        <Lock size={16} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="candidate-eye-toggle"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    {errors.password?.message && <span className="candidate-field-error">{errors.password.message}</span>}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="candidate-row-options">
                    <label className="candidate-remember-me">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="candidate-forgot-btn">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Security reCAPTCHA */}
                  <LoginRecaptcha
                    captchaRef={captchaRef}
                    error={errors.recaptchaToken?.message}
                    onChange={handleRecaptchaChange}
                    onExpired={() => setRecaptchaToken('')}
                  />

                  {/* Submit Button */}
                  <button type="submit" disabled={isSubmitting} className="candidate-clean-submit-btn">
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                    <ArrowRight size={18} />
                  </button>
                </form>

                {/* Social Login Buttons */}
                <SocialLoginButtons />

                {/* Footer Navigation */}
                <div className="candidate-clean-footer">
                  <div>
                    Don't have an account?{' '}
                    <Link to="/candidate/register">Create one</Link>
                  </div>
                  <div>
                    Are you an employer?{' '}
                    <Link to="/employer/login">Sign in here</Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
