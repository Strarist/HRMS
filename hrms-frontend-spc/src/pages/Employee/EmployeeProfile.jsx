import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Edit3,
  Shield,
  Building,
  Clock
} from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const EmployeeProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    leaveTaken: 0,
    leaveBalance: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch employee profile data
      const profileResponse = await api.get('/employees/profile');
      setProfile(profileResponse.data.data);

      // Fetch additional stats (leave information, etc.)
      try {
        const statsResponse = await api.get('/employees/profile/stats');
        setStats(statsResponse.data.data);
      } catch (statsError) {
        // Stats might not be available, set defaults
        console.log('Stats not available:', statsError);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');

      // Fallback to user data from auth context
      if (user) {
        setProfile({
          id: user.id,
          firstName: user.firstName || user.name?.split(' ')[0] || 'User',
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          employeeCode: user.employeeCode || 'EMP001',
          designation: user.designation || 'Employee',
          department: user.department || { name: 'General' },
          joiningDate: user.joiningDate || new Date().toISOString(),
          status: 'active',
          phone: user.phone || '+1-555-0123',
          employmentType: user.employmentType || 'full-time',
          salary: user.salary || {
            basic: 50000,
            hra: 10000,
            allowances: 5000,
            total: 65000
          },
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address || {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          },
          emergencyContact: user.emergencyContact || {
            name: 'John Doe',
            relationship: 'Brother',
            phone: '+1-555-0124'
          },
          reportingManager: user.reportingManager
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/settings/profile');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Profile Not Available</h3>
        <p className="text-gray-400">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 mt-1">Manage your personal and professional information</p>
        </div>
        <button
          onClick={handleEditProfile}
          className="btn-primary flex items-center space-x-2"
        >
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="card">
        <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-4xl">
                {profile.firstName[0]}{profile.lastName[0]}
              </span>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-primary-400 font-medium">{profile.designation}</p>
              <p className="text-gray-400 text-sm">{profile.employeeCode}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-primary-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalDays}</div>
              <div className="text-gray-400 text-sm">Days Employed</div>
            </div>
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.leaveTaken}</div>
              <div className="text-gray-400 text-sm">Leave Taken</div>
            </div>
            <div className="bg-dark-800 rounded-lg p-4 text-center">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.leaveBalance}</div>
              <div className="text-gray-400 text-sm">Leave Balance</div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-6">
          <span className={`badge ${
            profile.status === 'active' ? 'badge-success' :
            profile.status === 'on-leave' ? 'badge-warning' :
            'badge-danger'
          }`}>
            {profile.status?.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <User size={20} className="text-primary-400" />
            <span>Personal Information</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="text-white">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Phone Number</p>
                <p className="text-white">{profile.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Date of Birth</p>
                <p className="text-white">
                  {profile.dateOfBirth ?
                    new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) :
                    'Not specified'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Gender</p>
                <p className="text-white capitalize">{profile.gender || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Briefcase size={20} className="text-primary-400" />
            <span>Employment Information</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Department</p>
                <p className="text-white">{profile.department?.name || 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Employment Type</p>
                <p className="text-white capitalize">{profile.employmentType?.replace('-', ' ') || 'Full-time'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Joining Date</p>
                <p className="text-white">
                  {new Date(profile.joiningDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Reporting Manager</p>
                <p className="text-white">
                  {profile.reportingManager ?
                    `${profile.reportingManager.firstName} ${profile.reportingManager.lastName}` :
                    'Not assigned'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <MapPin size={20} className="text-primary-400" />
            <span>Address Information</span>
          </h3>
          <div className="space-y-2">
            {profile.address ? (
              <div className="text-white">
                <p>{profile.address.street}</p>
                <p>{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
                {profile.address.country && <p>{profile.address.country}</p>}
              </div>
            ) : (
              <p className="text-gray-400">Address not provided</p>
            )}
          </div>
        </div>

        {/* Salary Information */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <DollarSign size={20} className="text-primary-400" />
            <span>Salary Information</span>
          </h3>
          <div className="space-y-3">
            {profile.salary ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Basic Salary</span>
                  <span className="text-white font-medium">${profile.salary.basic?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">HRA</span>
                  <span className="text-white font-medium">${profile.salary.hra?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Allowances</span>
                  <span className="text-white font-medium">${profile.salary.allowances?.toLocaleString() || 0}</span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total Salary</span>
                  <span className="text-primary-400 font-bold text-lg">${profile.salary.total?.toLocaleString() || 0}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Salary information not available</p>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Phone size={20} className="text-primary-400" />
            <span>Emergency Contact</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile.emergencyContact ? (
              <>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Name</p>
                  <p className="text-white font-medium">{profile.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Relationship</p>
                  <p className="text-white font-medium">{profile.emergencyContact.relationship}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                  <p className="text-white font-medium">{profile.emergencyContact.phone}</p>
                </div>
              </>
            ) : (
              <div className="md:col-span-3">
                <p className="text-gray-400">Emergency contact information not provided</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;