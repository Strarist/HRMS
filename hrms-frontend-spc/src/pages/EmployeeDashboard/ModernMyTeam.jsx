import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview } from '../../api/employeeDashboard';
import toast from '../../utils/toast';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Search, Users, Clock, CheckCircle, Mail, Phone } from 'lucide-react';

const ModernMyTeam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardOverview();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error(error.response?.data?.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateRange = (start, end) => {
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const filteredTeamMembers = dashboardData?.teamMembers?.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1E1E2A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading team...</p>
        </div>
      </div>
    );
  }

  const { employee, teamMembers, manager, offThisWeek } = dashboardData || {};

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/employee/home')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-xl font-bold">My Team</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2A2A3A] text-white pl-12 pr-4 py-3 rounded-2xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Department Card */}
        <div className="bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Department</p>
              <h2 className="text-2xl font-bold">{employee?.department || 'Technology'}</h2>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm mt-2">{teamMembers?.length || 0} people</p>
            </div>
          </div>
        </div>

        {/* Off This Week */}
        {offThisWeek && offThisWeek.length > 0 && (
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Off This Week</h3>
            <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
              {offThisWeek.map((leave, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center mb-2">
                    {leave.employee.profileImage ? (
                      <img 
                        src={leave.employee.profileImage} 
                        alt={leave.employee.name} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {leave.employee.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium w-20 truncate">
                    {leave.employee.name.split(' ')[0]}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Filters */}
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-[#A88BFF] text-white'
                : 'bg-[#2A2A3A] text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('late')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'late'
                ? 'bg-[#A88BFF] text-white'
                : 'bg-[#2A2A3A] text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            Late arrivals
          </button>
          <button
            onClick={() => setActiveFilter('ontime')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'ontime'
                ? 'bg-[#A88BFF] text-white'
                : 'bg-[#2A2A3A] text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            On Time
          </button>
        </div>

        {/* Manager Section */}
        {manager && (
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Manager</h3>
            <div className="flex items-center space-x-4 p-4 bg-[#1E1E2A] rounded-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center flex-shrink-0">
                {manager.profileImage ? (
                  <img 
                    src={manager.profileImage} 
                    alt={manager.name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {manager.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-lg">{manager.name}</h4>
                <p className="text-gray-400 text-sm">{manager.designation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4">
            Team Members ({filteredTeamMembers.length})
          </h3>
          <div className="space-y-3">
            {filteredTeamMembers.length > 0 ? (
              filteredTeamMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-[#1E1E2A] rounded-xl hover:border hover:border-[#A88BFF] transition-all"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center flex-shrink-0">
                      {member.profileImage ? (
                        <img 
                          src={member.profileImage} 
                          alt={member.name} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {member.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{member.name}</h4>
                      <p className="text-gray-400 text-sm truncate">{member.designation}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        {member.email && (
                          <a 
                            href={`mailto:${member.email}`}
                            className="flex items-center space-x-1 text-gray-500 hover:text-[#A88BFF] text-xs transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{member.email}</span>
                          </a>
                        )}
                        {member.phone && (
                          <a 
                            href={`tel:${member.phone}`}
                            className="flex items-center space-x-1 text-gray-500 hover:text-[#A88BFF] text-xs transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{member.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {activeFilter === 'ontime' && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-xs font-medium">On Time</span>
                      </div>
                    )}
                    {activeFilter === 'late' && (
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Clock className="w-5 h-5" />
                        <span className="text-xs font-medium">Late</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No team members found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModernMyTeam;
