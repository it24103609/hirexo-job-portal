import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/ui/Loader';
import FloatingWhatsAppButton from '../components/ui/FloatingWhatsAppButton';
import '../styles/candidate-portal.css';

export default function DashboardLayout({ role }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!isAuthenticated || user?.role !== role) return <Navigate to="/" replace />;

  return (
    <>
      <div className={`dashboard-shell ${role === 'candidate' ? 'candidate-portal-shell' : ''}`}>
        <Sidebar role={role} />
        <div className={`dashboard-main ${role === 'candidate' ? 'candidate-portal-main' : ''}`}>
          <Outlet />
        </div>
      </div>
      <FloatingWhatsAppButton />
    </>
  );
}
