import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';
import {
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Users,
  Search,
  FileText,
  ShieldCheck,
  Calendar,
  Clock,
  MessageSquare
} from 'lucide-react';

const EmployeeDashboardLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Hidden on mobile by default
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isHR = user?.role === 'hr';
  const isEmployee = user?.role === 'employee';

  // HR Navigation - allowed features
  const hrNavigation = [
    { name: 'Job Desk', href: '/job-desk', icon: Briefcase },
    { name: 'Onboarding', href: '/employees/onboarding', icon: Users },
    { name: 'Candidate Pool', href: '/employee/hr/candidate-pool', icon: Users },
    { name: 'Resume Parser', href: '/employee/hr/resume-parser', icon: FileText },
    { name: 'Resume Search', href: '/employee/hr/resume-search', icon: Search },
    { name: 'Document Verification', href: '/employee/hr/document-verification', icon: ShieldCheck },
    { name: 'My Profile', href: '/employee/profile', icon: User },
  ];

  const employeeNavigation = [
    { name: 'My Dashboard', href: '/employee/dashboard', icon: Briefcase },
    { name: 'Leave Management', href: '/employee/leave', icon: Calendar },
    { name: 'Attendance', href: '/employee/attendance', icon: Clock },
    { name: 'Payslips', href: '/employee/payslips', icon: FileText },
    { name: 'My Projects', href: '/employee/projects', icon: Briefcase },
    { name: 'Requests', href: '/employee/requests', icon: MessageSquare },
    { name: 'My Profile', href: '/employee/profile', icon: User },
  ];

  const navigation = isHR ? hrNavigation : isEmployee ? employeeNavigation : employeeNavigation;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-[#2A2A3A] border-r border-gray-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ width: '260px' }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 px-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  HRMS Portal
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white shadow-lg'
                      : 'text-gray-400 hover:bg-[#1E1E2A] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-[260px] transition-all duration-300">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-[#2A2A3A] border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-[#1E1E2A] hover:text-white transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications((open) => !open);
                      setProfileMenuOpen(false);
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:bg-[#1E1E2A] hover:text-white transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[0.5rem] h-2 px-0.5 bg-[#A88BFF] rounded-full" />
                    )}
                  </button>
                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(!profileMenuOpen);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-[#1E1E2A] transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-[#2A2A3A] border border-gray-700">
                      <div className="py-1">
                        <Link
                          to="/employee/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#1E1E2A] rounded-lg transition-colors"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4 inline mr-2" />
                          My Profile
                        </Link>
                        <hr className="my-1 border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1E1E2A] rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4 inline mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default EmployeeDashboardLayout;
