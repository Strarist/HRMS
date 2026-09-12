import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Server, 
  Database, 
  HardDrive, 
  Download, 
  Upload, 
  RefreshCw,
  Shield,
  Clock,
  Archive,
  Trash2,
  AlertCircle,
  FileText,
  Lock,
  Cloud,
  Copy,
  RotateCcw
} from 'lucide-react';

const DataManagement = () => {
  const { theme } = useTheme();

  const dataManagementFeatures = [
    {
      icon: Database,
      title: "Database Backups",
      description: "Automated and manual database backup solutions with multiple restore points and integrity verification.",
      features: ["Scheduled backups", "Point-in-time recovery", "Backup verification", "Cross-region storage"]
    },
    {
      icon: Archive,
      title: "Data Archival",
      description: "Intelligent data archival system for long-term storage and compliance with automated lifecycle management.",
      features: ["Automated archival", "Compliance retention", "Data compression", "Retrieval on demand"]
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Comprehensive data export capabilities with multiple formats and customizable data selection.",
      features: ["Multiple formats", "Selective export", "Bulk operations", "API integration"]
    },
    {
      icon: Upload,
      title: "Data Import",
      description: "Secure data import tools with validation, transformation, and error handling capabilities.",
      features: ["Data validation", "Format conversion", "Error handling", "Progress tracking"]
    },
    {
      icon: RefreshCw,
      title: "Data Migration",
      description: "Safe and efficient data migration tools for system upgrades and platform transitions.",
      features: ["Zero-downtime migration", "Data mapping", "Rollback capability", "Progress monitoring"]
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Advanced data protection with encryption, access controls, and audit trails for sensitive information.",
      features: ["End-to-end encryption", "Access logging", "Data masking", "Compliance reporting"]
    }
  ];

  const backupTypes = [
    {
      icon: Clock,
      title: "Incremental Backups",
      description: "Daily incremental backups capturing only changed data",
      frequency: "Every 6 hours"
    },
    {
      icon: Database,
      title: "Full System Backups",
      description: "Complete system snapshots including all databases and files",
      frequency: "Weekly"
    },
    {
      icon: Cloud,
      title: "Cloud Backups",
      description: "Secure cloud storage with geographic redundancy",
      frequency: "Real-time sync"
    },
    {
      icon: Copy,
      title: "Mirror Backups",
      description: "Real-time database mirroring for instant failover",
      frequency: "Continuous"
    }
  ];

  const dataOperations = [
    {
      icon: RotateCcw,
      title: "Point-in-Time Recovery",
      description: "Restore data to any specific point in time"
    },
    {
      icon: FileText,
      title: "Data Audit Trails",
      description: "Complete tracking of all data modifications"
    },
    {
      icon: Lock,
      title: "Data Encryption",
      description: "Advanced encryption for data at rest and in transit"
    },
    {
      icon: Trash2,
      title: "Secure Data Deletion",
      description: "GDPR-compliant secure data removal processes"
    }
  ];

  const upcomingFeatures = [
    "AI-powered backup optimization",
    "Automated disaster recovery testing",
    "Multi-cloud backup strategies",
    "Real-time data synchronization",
    "Advanced data deduplication",
    "Blockchain-based data integrity",
    "Automated compliance reporting",
    "Smart data lifecycle management"
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Server className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Data Management
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Comprehensive data backup, archival, and management solutions
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
                  Advanced data management features are being developed. Basic backup functionality is available.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {dataManagementFeatures.map((feature, index) => {
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
                <div className="flex items-start space-x-4 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Backup Types Section */}
        <div className={`p-8 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border mb-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Backup Strategies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {backupTypes.map((backup, index) => {
              const Icon = backup.icon;
              return (
                <div key={index} className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {backup.title}
                      </h3>
                      <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {backup.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {backup.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Operations */}
        <div className={`p-8 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border mb-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Advanced Data Operations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataOperations.map((operation, index) => {
              const Icon = operation.icon;
              return (
                <div key={index} className="text-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {operation.title}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {operation.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className={`p-8 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border mb-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Data Management Workflow
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <HardDrive className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Collect
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Automated data collection and preparation for backup
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Secure
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Encryption and security validation before storage
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Archive className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Store
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Multi-location storage with redundancy and verification
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <RotateCcw className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Restore
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Fast and reliable data recovery when needed
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Features */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Upcoming Data Management Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
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

export default DataManagement;
