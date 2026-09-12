import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { AuthContext } from '../../context/AuthContext';

const SPCProtectedRoute = ({ children, allowedRoles, requireProject = false }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle={`Sorry, you don't have permission to access this page. Your role is: ${user.role?.replace('_', ' ').toUpperCase()}`}
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    );
  }

  // Check if user has project assignment (if required)
  if (requireProject && !user.hasProjectAssignment) {
    return (
      <Result
        status="403"
        title="No Project Assignment"
        subTitle="You need to be assigned to a project to access this feature. Please contact your administrator."
        extra={
          <Button type="primary" href="/dashboard">
            Go to Dashboard
          </Button>
        }
      />
    );
  }

  return children;
};

export default SPCProtectedRoute;
