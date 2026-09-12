import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/** Dev-only auth diagnostics — disabled in production builds. */
const DebugAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log('🔍 Debug Auth Context:', {
      loading,
      isAuthenticated,
      role: user?.role,
      email: user?.email,
      hasToken: !!localStorage.getItem('token')
    });
  }, [user, isAuthenticated, loading]);

  if (!import.meta.env.DEV) {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', background: '#1e1e2a', color: 'white', minHeight: '100vh' }}>
      <h1>Debug Auth Context</h1>
      <pre style={{ background: '#2a2a3a', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify({ user, isAuthenticated, loading }, null, 2)}
      </pre>
    </div>
  );
};

export default DebugAuth;
