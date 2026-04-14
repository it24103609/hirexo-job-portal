import clsx from 'clsx';

export default function Select({ label, error, className, children, ...props }) {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <select className={clsx('input', error && 'input-error', className)} {...props}>
        {children}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
