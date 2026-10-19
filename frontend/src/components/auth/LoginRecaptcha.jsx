import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginRecaptcha({ captchaRef, error, onChange, onExpired }) {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <div className="field recaptcha-field">
      <span className="field-label">Security check</span>
      <div className="recaptcha-box">
        {siteKey ? (
          <ReCAPTCHA
            ref={captchaRef}
            sitekey={siteKey}
            onChange={onChange}
            onExpired={onExpired}
          />
        ) : (
          <span className="field-error">reCAPTCHA site key is missing.</span>
        )}
      </div>
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
