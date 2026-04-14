import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <Loader label="Checking access..." />;
  if (!isAuthenticated) return <Navigate to="/candidate/login" replace />;

  return <Outlet />;
}
