import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/ui/Loader';
import FloatingWhatsAppButton from '../components/ui/FloatingWhatsAppButton';
import '../styles/candidate-portal.css';

export default function DashboardLayout({ role }) {
  const { loading, isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dashboard-nav-open', sidebarOpen);
    return () => document.body.classList.remove('dashboard-nav-open');
  }, [sidebarOpen]);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!isAuthenticated || user?.role !== role) return <Navigate to="/" replace />;

  return (
    <>
      <div className="dashboard-mobile-bar shell">
        <button
          className="dashboard-mobile-trigger"
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          aria-expanded={sidebarOpen}
          aria-controls="dashboard-sidebar"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          <span>{sidebarOpen ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      <div className={`dashboard-shell ${role === 'candidate' ? 'candidate-portal-shell' : ''} ${sidebarOpen ? 'mobile-nav-open' : ''}`}>
        <Sidebar role={role} isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <div className={`dashboard-main ${role === 'candidate' ? 'candidate-portal-main' : ''}`}>
          <Outlet />
        </div>
      </div>
      <button
        type="button"
        className={`dashboard-sidebar-backdrop ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close dashboard menu"
      />
      <FloatingWhatsAppButton />
    </>
  );
}
