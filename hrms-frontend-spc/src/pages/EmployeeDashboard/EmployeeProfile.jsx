import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getEmployeeProfile, updateEmployeeProfile } from '../../api/employeeDashboard';
import toast from '../../utils/toast';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit2, Save, X } from 'lucide-react';

const EmployeeProfile = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeProfile();
      setProfile(response.data);
      setFormData({
        phone: response.data.phone || '',
        alternatePhone: response.data.alternatePhone || '',
        address: response.data.address || {},
        emergencyContact: response.data.emergencyContact || {}
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateEmployeeProfile(formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            My Profile
          </h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage your personal information
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Edit2 className="w-5 h-5 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-5 h-5 mr-2" />
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                fetchProfile();
              }}
              className={`flex items-center px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-dark-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-white">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {profile?.designation}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {profile?.employeeCode} • {profile?.department?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-3 text-primary-600" />
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {profile?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-3 text-primary-600" />
            <div className="flex-1">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-1 rounded border ${
                    theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              ) : (
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-3 text-primary-600" />
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date of Birth</p>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Briefcase className="w-5 h-5 mr-3 text-primary-600" />
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Joining Date</p>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Address
        </h3>
        {editing ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Street"
              value={formData.address?.street || ''}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={formData.address?.city || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                placeholder="State"
                value={formData.address?.state || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value }
                })}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Zip Code"
                value={formData.address?.zipCode || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zipCode: e.target.value }
                })}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.address?.country || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, country: e.target.value }
                })}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-start">
            <MapPin className="w-5 h-5 mr-3 text-primary-600 mt-1" />
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {profile?.address?.street && `${profile.address.street}, `}
              {profile?.address?.city && `${profile.address.city}, `}
              {profile?.address?.state && `${profile.address.state} `}
              {profile?.address?.zipCode && `${profile.address.zipCode}, `}
              {profile?.address?.country || 'No address provided'}
            </p>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Emergency Contact
        </h3>
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Contact Name"
              value={formData.emergencyContact?.name || ''}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, name: e.target.value }
              })}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <input
              type="tel"
              placeholder="Contact Phone"
              value={formData.emergencyContact?.phone || ''}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
              })}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Name</p>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {profile?.emergencyContact?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {profile?.emergencyContact?.phone || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
