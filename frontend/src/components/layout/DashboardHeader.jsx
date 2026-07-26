import { useAuth } from '../../contexts/AuthContext';

export default function DashboardHeader({ title, description, actions = null, className = '', showEyebrow = true }) {
  const { user } = useAuth();

  return (
    <header className={`dashboard-header ${className}`.trim()}>
      <div>
        {showEyebrow ? <p className="section-eyebrow">{user?.role || 'dashboard'}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {actions ? <div className="dashboard-actions">{actions}</div> : null}
    </header>
  );
}
