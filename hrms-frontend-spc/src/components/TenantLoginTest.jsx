import React, { useState } from 'react';
import { LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import tenantRolesAPI from '../api/tenantRoles';

const TenantLoginTest = () => {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: 'password123'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🔐 Testing tenant login with:', loginForm);
      const response = await tenantRolesAPI.tenantLogin(loginForm);
      console.log('✅ Login response:', response);
      
      if (response.data.success) {
        setResult({
          success: true,
          message: 'Login successful!',
          data: response.data.data
        });
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <LogIn className="h-5 w-5" />
        Tenant Login Test
      </h2>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {result?.success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">{result.message}</span>
          </div>
          <div className="text-sm text-gray-300 ml-8">
            <p><strong>User:</strong> {result.data?.user?.name}</p>
            <p><strong>Email:</strong> {result.data?.user?.email}</p>
            <p><strong>Role:</strong> {result.data?.user?.roleName}</p>
            <p><strong>Token:</strong> {result.data?.token?.substring(0, 20)}...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter tenant user email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter password"
            required
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-400">
            <strong>Target Tenant:</strong> 6914486fef016d63d6ac03ce
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This will login to the tenant-specific database
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Testing Login...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Test Tenant Login
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-400">
        <p><strong>Note:</strong> This tests the tenant authentication system.</p>
        <p>Use email addresses of users created via the role management system.</p>
      </div>
    </div>
  );
};

export default TenantLoginTest;
