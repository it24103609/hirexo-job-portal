import { useAuth } from '../../contexts/AuthContext';

export default function DashboardHeader({ title, description, actions = null, className = '' }) {
  const { user } = useAuth();

  return (
    <header className={`dashboard-header ${className}`.trim()}>
      <div>
        <p className="section-eyebrow">{user?.role || 'dashboard'}</p>
        <h1>{title}</h1>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {actions ? <div className="dashboard-actions">{actions}</div> : null}
    </header>
  );
}
