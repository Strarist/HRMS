import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  FileText, 
  Shield, 
  Clock, 
  User, 
  Activity, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';

const AuditLogs = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: FileText,
      title: "Comprehensive Audit Trail",
      description: "Complete logging of all system activities, user actions, and data modifications with detailed timestamps and user attribution."
    },
    {
      icon: Shield,
      title: "Security Event Monitoring",
      description: "Real-time tracking of security events including login attempts, permission changes, and suspicious activities."
    },
    {
      icon: User,
      title: "User Activity Tracking",
      description: "Detailed logs of user sessions, actions performed, and access patterns across all system modules."
    },
    {
      icon: Activity,
      title: "System Performance Logs",
      description: "Monitor system performance metrics, API calls, database queries, and resource utilization patterns."
    },
    {
      icon: Search,
      title: "Advanced Search & Filtering",
      description: "Powerful search capabilities with filters by date range, user, action type, and severity level."
    },
    {
      icon: Download,
      title: "Export & Compliance Reports",
      description: "Generate compliance reports and export audit data in various formats for regulatory requirements."
    }
  ];

  const upcomingFeatures = [
    "Real-time log streaming and alerts",
    "Automated compliance report generation",
    "Integration with SIEM systems",
    "Advanced analytics and anomaly detection",
    "Custom audit rule configuration",
    "Multi-level log retention policies"
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Audit Logs
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Comprehensive audit trails and security monitoring
              </p>
            </div>
          </div>
          
          {/* Development Status Banner */}
          <div className={`p-4 rounded-lg border-l-4 border-yellow-400 ${
            theme === 'dark' ? 'bg-yellow-900/20 border-yellow-400' : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                  Under Development
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  This module is currently being developed. Full functionality will be available soon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } transition-all duration-200 hover:shadow-lg`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works Section */}
        <div className={`p-8 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border mb-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            How Audit Logs Work
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Automatic Logging
              </h3>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>Real-time capture of all system events</span>
                </li>
                <li className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-green-500" />
                  <span>User action tracking with full context</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Security event monitoring and alerts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>System performance and health metrics</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Analysis & Reporting
              </h3>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span>Advanced search and filtering capabilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-blue-500" />
                  <span>Custom filters by date, user, and action type</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Export logs for compliance and analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Detailed event inspection and drill-down</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Features */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Upcoming Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
