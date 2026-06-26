import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './common/Loader';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader /></div>;
  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'instructor') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/instructors" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
