export default function StatCard({ label, value, hint, icon: Icon = null, trend = null, className = '', tone = 'default' }) {
  return (
    <article className={`stat-card stat-card-${tone} ${className}`.trim()}>
      <div className="stat-card-head">
        <span className="stat-label">{label}</span>
        {Icon ? (
          <span className="stat-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <strong className="stat-value">{value}</strong>
      {hint ? <p className="stat-hint">{hint}</p> : null}
      {trend ? <p className="stat-trend">{trend}</p> : null}
    </article>
  );
}
