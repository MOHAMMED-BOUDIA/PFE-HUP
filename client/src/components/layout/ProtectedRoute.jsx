import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import Loader from '../common/Loader';

const getDefaultRoute = (role) => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'instructor': return '/dashboard';
    default: return '/';
  }
};

const restrictedPaths = ['/projects', '/tasks', '/teams', '/documents', '/meetings', '/resources'];

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (user?.role === 'student') {
      axiosInstance.get('/groups/my-membership').then(res => {
        setMembershipStatus(res.data.status);
      }).catch(() => {
        setMembershipStatus('none');
      }).finally(() => {
        setCheckingMembership(false);
        hasRedirected.current = false;
      });
    }
  }, [user]);

  useEffect(() => {
    if (loading || checkingMembership || !user) return;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const target = getDefaultRoute(user.role);
      if (location.pathname !== target) {
        navigate(target, { replace: true });
      }
      return;
    }
    if (allowedRoles && user.role === 'student' && restrictedPaths.some(p => location.pathname.startsWith(p))) {
      if (membershipStatus !== 'approved' && !hasRedirected.current) {
        hasRedirected.current = true;
        toast.error('You must join and be approved into a group first');
        navigate('/instructors', { replace: true });
      }
    }
  }, [user, allowedRoles, membershipStatus, checkingMembership, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
