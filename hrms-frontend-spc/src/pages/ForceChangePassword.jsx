import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from '../utils/toast';

/**
 * Forced password change after admin reset / first login.
 * Uses PUT /api/auth/updatepassword (tenant-aware).
 */
const ForceChangePassword = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const valid =
    formData.newPassword.length >= 8 &&
    formData.newPassword === formData.confirmPassword &&
    formData.currentPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) {
      toast.error('Check password requirements');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put('/auth/updatepassword', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      if (res.data?.data?.token) {
        localStorage.setItem('token', res.data.data.token);
      }
      const updated = {
        ...(user || {}),
        ...(res.data?.data?.user || {}),
        mustChangePassword: false,
        isFirstLogin: false
      };
      updateUser(updated);
      toast.success('Password updated');

      const role = updated.role;
      if (role === 'hr') navigate('/job-desk', { replace: true });
      else if (role === 'manager') navigate('/manager/dashboard', { replace: true });
      else if (role === 'employee') navigate('/employee/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-md card space-y-6">
        <div className="text-center space-y-2">
          <Shield className="w-10 h-10 text-primary-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Change your password</h1>
          <p className="text-gray-400 text-sm">
            You must set a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current / temporary password', showKey: 'current' },
            { key: 'newPassword', label: 'New password (min 8 chars)', showKey: 'next' },
            { key: 'confirmPassword', label: 'Confirm new password', showKey: 'confirm' }
          ].map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-sm text-gray-300 mb-1">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  className="input w-full pl-10 pr-10"
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
                >
                  {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading || !valid} className="btn-primary w-full">
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePassword;
