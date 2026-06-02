function getApiOrigin() {
  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');
}

export default function SocialLoginButtons() {
  const apiOrigin = getApiOrigin();

  const startOAuth = (provider) => {
    window.location.href = `${apiOrigin}/auth/${provider}`;
  };

  return (
    <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
        <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        <span>or continue with</span>
        <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => startOAuth('google')}
          style={{
            border: '1px solid #dbe3ef',
            borderRadius: '8px',
            background: '#fff',
            color: '#0f172a',
            cursor: 'pointer',
            fontWeight: 700,
            padding: '0.8rem 1rem'
          }}
        >
          Google
        </button>
        <button
          type="button"
          onClick={() => startOAuth('github')}
          style={{
            border: '1px solid #dbe3ef',
            borderRadius: '8px',
            background: '#111827',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700,
            padding: '0.8rem 1rem'
          }}
        >
          GitHub
        </button>
      </div>
    </div>
  );
}
