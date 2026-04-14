import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function BrandIdentity({
  to = '/',
  className,
  subtitle = 'Recruitment Platform',
  compact = false,
  showSubtitle = true,
  as = Link
}) {
  const Component = as;

  return (
    <Component className={clsx('brand', compact && 'brand-compact', className)} to={to} aria-label="Hirexo home">
      <span className="brand-logo-wrap" aria-hidden="true">
        <img src="/brand-logo.jpg" alt="Hirexo" className="brand-logo" />
      </span>
      <span className="brand-copy">
        <strong>Hirexo</strong>
        {showSubtitle ? <small>{subtitle}</small> : null}
      </span>
    </Component>
  );
}
