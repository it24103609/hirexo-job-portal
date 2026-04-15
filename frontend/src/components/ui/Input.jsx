import clsx from 'clsx';

export default function Input({ label, error, className, ...props }) {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <input className={clsx('input', error && 'input-error', className)} {...props} />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
