import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BottomNavigation from '../../components/BottomNavigation';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, 
  Edit2, Save, X, Camera, Building, Award, Users, GraduationCap, FileEdit
} from 'lucide-react';
import FamilyDetails from '../EmployeeProfile/FamilyDetails';
import Certifications from '../EmployeeProfile/Certifications';
import AcademicQualifications from '../EmployeeProfile/AcademicQualifications';
import ProfileUpdateRequest from '../EmployeeProfile/ProfileUpdateRequest';

const ModernProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@company.com',
    phone: '+91 9876543210',
    designation: 'Senior Software Engineer',
    department: 'Technology',
    employeeId: 'EMP001',
    joiningDate: 'Jan 15, 2022',
    reportingTo: 'Jane Smith',
    location: 'Bangalore, India',
    address: '123 Tech Park, Whitefield, Bangalore - 560066'
  });

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'employment', label: 'Employment' },
    { id: 'family', label: 'Family Details', icon: Users },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'update-requests', label: 'Update Requests', icon: FileEdit },
    { id: 'documents', label: 'Documents' }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // TODO: API call to save profile
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-[#2A2A3A] rounded-2xl p-4 md:p-8 border border-gray-700">
          <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4 md:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#A88BFF] rounded-full flex items-center justify-center hover:bg-[#8B6FE8] transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Basic Info */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-[#A88BFF] font-medium mt-1">{profileData.designation}</p>
                <p className="text-gray-400 text-sm mt-1">{profileData.department}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    ACTIVE
                  </span>
                  <span className="text-gray-400 text-sm">ID: {profileData.employeeId}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#1E1E2A] text-gray-400 rounded-xl hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Years at Company</p>
              <p className="text-white text-xl font-bold">2.9</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Projects Completed</p>
              <p className="text-white text-xl font-bold">12</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Performance Rating</p>
              <p className="text-[#A88BFF] text-xl font-bold">4.5/5</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-700 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 md:px-6 py-3 font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#A88BFF]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A88BFF]"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'personal' && (
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">First Name</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.firstName}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="bg-transparent text-white flex-1 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Last Name</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.lastName}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="bg-transparent text-white flex-1 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Email</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-transparent text-gray-500 flex-1 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Phone</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="bg-transparent text-white flex-1 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-400 text-sm mb-2 block">Address</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.address}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    className="bg-transparent text-white flex-1 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Employee ID</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-white">{profileData.employeeId}</span>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Designation</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span className="text-white">{profileData.designation}</span>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Department</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <Building className="w-5 h-5 text-gray-400" />
                  <span className="text-white">{profileData.department}</span>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Joining Date</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-white">{profileData.joiningDate}</span>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Reporting To</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-white">{profileData.reportingTo}</span>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Location</label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E1E2A] rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-white">{profileData.location}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'family' && (
          <div className="bg-[#2A2A3A] rounded-2xl p-4 md:p-6 border border-gray-700">
            <FamilyDetails />
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="bg-[#2A2A3A] rounded-2xl p-4 md:p-6 border border-gray-700">
            <Certifications />
          </div>
        )}

        {activeTab === 'education' && (
          <div className="bg-[#2A2A3A] rounded-2xl p-4 md:p-6 border border-gray-700">
            <AcademicQualifications />
          </div>
        )}

        {activeTab === 'update-requests' && (
          <div className="bg-[#2A2A3A] rounded-2xl p-4 md:p-6 border border-gray-700">
            <ProfileUpdateRequest />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-700 text-center">
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No Documents</h3>
            <p className="text-gray-400">Document management feature coming soon</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModernProfile;
