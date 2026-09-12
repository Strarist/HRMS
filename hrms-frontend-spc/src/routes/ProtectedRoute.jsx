import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [], allowPasswordChange = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const mustChange = !!(user?.mustChangePassword || user?.isFirstLogin);
  if (mustChange && !allowPasswordChange && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  const role = user?.role === 'admin' ? 'company_admin' : user?.role;

  if (role === 'superadmin') {
    if (roles.length === 0 || roles.includes('superadmin')) {
      return children;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  if (roles.length > 0) {
    const allowed = roles.map((r) => (r === 'admin' ? 'company_admin' : r));
    if (!allowed.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
