import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect = () => {
  const { user } = useAuth();
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Role-based redirection
  if (user.role === 'superadmin') {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  if (user.role === 'hr') {
    return <Navigate to="/job-desk" replace />;
  }

  if (user.role === 'admin' || user.role === 'company_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  if (user.role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default HomeRedirect;
