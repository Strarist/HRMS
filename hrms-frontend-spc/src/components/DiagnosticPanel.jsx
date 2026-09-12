import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const DiagnosticPanel = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    // Check 1: Authentication Token
    const token = localStorage.getItem('token');
    results.checks.push({
      name: 'Authentication Token',
      status: token ? 'success' : 'error',
      message: token ? `Token exists (${token.length} chars)` : 'No authentication token found',
      details: token ? `Preview: ${token.substring(0, 20)}...` : 'Please log in again'
    });

    // Check 2: User Object
    results.checks.push({
      name: 'User Object',
      status: user ? 'success' : 'error',
      message: user ? `User logged in: ${user.email}` : 'No user object found',
      details: user ? `Role: ${user.role}` : 'User context is missing'
    });

    // Check 3: API Base URL
    try {
      const config = await import('../config/api.config');
      results.checks.push({
        name: 'API Configuration',
        status: 'success',
        message: `API Base URL: ${config.default.apiBaseUrl}`,
        details: `Environment: ${config.default.env}`
      });
    } catch (error) {
      results.checks.push({
        name: 'API Configuration',
        status: 'error',
        message: 'Failed to load API configuration',
        details: error.message
      });
    }

    // Check 4: Backend Connectivity
    try {
      const response = await fetch('/api/super-admin/roles/my-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        results.checks.push({
          name: 'Backend Connectivity',
          status: 'success',
          message: 'Successfully connected to backend',
          details: `Response: ${response.status} ${response.statusText}`
        });

        // Check 5: Permissions API
        results.checks.push({
          name: 'Permissions API',
          status: data.success ? 'success' : 'warning',
          message: data.success ? 'Permissions loaded successfully' : 'Permissions API returned error',
          details: data.success ? `Internal Role: ${data.data?.internalRole || 'undefined'}` : data.message
        });
      } else {
        results.checks.push({
          name: 'Backend Connectivity',
          status: 'error',
          message: `Backend responded with error: ${response.status}`,
          details: `${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      results.checks.push({
        name: 'Backend Connectivity',
        status: 'error',
        message: 'Cannot connect to backend server',
        details: error.message || 'Network error - check if backend is running on port 5000'
      });
    }

    // Check 6: Billing API
    try {
      const response = await fetch('/api/super-admin/subscriptions?page=1&limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      results.checks.push({
        name: 'Billing API',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Billing API accessible' : `Billing API error: ${response.status}`,
        details: `${response.status} ${response.statusText}`
      });
    } catch (error) {
      results.checks.push({
        name: 'Billing API',
        status: 'error',
        message: 'Billing API connection failed',
        details: error.message
      });
    }

    setDiagnostics(results);
    setLoading(false);
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          System Diagnostics
        </h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Run Diagnostics
        </button>
      </div>

      {diagnostics && (
        <div className="space-y-3">
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Last run: {new Date(diagnostics.timestamp).toLocaleString()}
          </div>
          
          {diagnostics.checks.map((check, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-md ${
                check.status === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : check.status === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              {getStatusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {check.name}
                </div>
                <div className={`text-sm ${
                  check.status === 'success' 
                    ? 'text-green-700 dark:text-green-300' 
                    : check.status === 'warning'
                    ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {check.message}
                </div>
                {check.details && (
                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {check.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!diagnostics && !loading && (
        <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Click "Run Diagnostics" to check system connectivity and authentication
        </div>
      )}
    </div>
  );
};

export default DiagnosticPanel;
