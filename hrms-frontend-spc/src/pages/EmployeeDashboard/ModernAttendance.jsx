import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Clock, Home, Briefcase, Calendar, FileText, ChevronRight, Award } from 'lucide-react';

const ModernAttendance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('time');

  const tabs = [
    { id: 'time', label: 'Time', icon: Clock },
    { id: 'finances', label: 'Finances', icon: Briefcase },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  const timeOptions = [
    { title: 'Raise Request', subtitle: 'WFH, On Duty, Partial Day', icon: FileText, action: '/employee/attendance/request' },
    { title: 'Logs & Shifts', subtitle: 'View attendance logs', icon: Clock, action: '/employee/attendance/logs' },
    { title: 'Requests History', subtitle: 'View past requests', icon: Calendar, action: '/employee/attendance/history' },
    { title: 'Leave', subtitle: 'Apply and manage leaves', icon: Calendar, action: '/employee/leave/balance' },
    { title: 'Upcoming Holidays', subtitle: 'View holiday calendar', icon: Calendar, action: '/employee/holidays' }
  ];

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/employee/home')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-xl font-bold">Attendance & More</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#A88BFF] text-white'
                    : 'bg-[#2A2A3A] text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Tab Content */}
        {activeTab === 'time' && (
          <div className="space-y-4">
            {timeOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => navigate(option.action)}
                className="w-full bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 hover:border-[#A88BFF] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#A88BFF]/20 flex items-center justify-center group-hover:bg-[#A88BFF] transition-colors">
                    <option.icon className="w-6 h-6 text-[#A88BFF] group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-semibold text-lg">{option.title}</h3>
                    <p className="text-gray-400 text-sm">{option.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#A88BFF] transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Finances Tab Content */}
        {activeTab === 'finances' && (
          <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-700 text-center">
            <div className="w-20 h-20 rounded-full bg-[#A88BFF]/20 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-[#A88BFF]" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Finances are not configured</h3>
            <p className="text-gray-400">Your salary and expenses have not been configured yet.</p>
          </div>
        )}

        {/* Performance Tab Content */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 hover:border-[#A88BFF] transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#A88BFF]/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#A88BFF]" />
                </div>
                <h3 className="text-white text-lg font-semibold">Personal Feedback</h3>
              </div>
              <p className="text-gray-400 text-sm">No feedback available at the moment</p>
            </div>
            <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 hover:border-[#A88BFF] transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#A88BFF]/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#A88BFF]" />
                </div>
                <h3 className="text-white text-lg font-semibold">Praise</h3>
              </div>
              <p className="text-gray-400 text-sm">No praise received yet</p>
            </div>
          </div>
        )}

        {/* Documents Tab Content */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 hover:border-[#A88BFF] transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#A88BFF]/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#A88BFF]" />
                </div>
                <h3 className="text-white text-lg font-semibold">Org Documents</h3>
              </div>
              <p className="text-gray-400 text-sm">No organization documents available</p>
            </div>
            <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 hover:border-[#A88BFF] transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#A88BFF]/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#A88BFF]" />
                </div>
                <h3 className="text-white text-lg font-semibold">My Documents</h3>
              </div>
              <p className="text-gray-400 text-sm">No personal documents uploaded</p>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModernAttendance;
