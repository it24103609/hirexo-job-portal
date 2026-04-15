import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/constants';

const roleRedirect = {
  [ROLES.CANDIDATE]: '/candidate/dashboard',
  [ROLES.EMPLOYER]: '/employer/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard'
};

export default function RoleRoute({ allowedRoles }) {
  const { loading, user } = useAuth();

  if (loading) return <Loader label="Loading access control..." />;

  if (!user || !allowedRoles.includes(user.role)) {
    const fallback = roleRedirect[user?.role] || '/';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
