import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Settings, 
  Server, 
  Database, 
  Shield, 
  Mail, 
  Bell,
  Globe,
  Key,
  Palette,
  Clock,
  AlertCircle,
  Zap,
  Lock,
  Monitor
} from 'lucide-react';

const SystemConfiguration = () => {
  const { theme } = useTheme();

  const configurationSections = [
    {
      icon: Server,
      title: "System Settings",
      description: "Core system configuration including server settings, performance tuning, and resource allocation.",
      features: ["Server configuration", "Performance optimization", "Resource limits", "Cache settings"]
    },
    {
      icon: Database,
      title: "Database Configuration",
      description: "Database connection settings, backup schedules, and data retention policies.",
      features: ["Connection pools", "Backup automation", "Data retention", "Query optimization"]
    },
    {
      icon: Shield,
      title: "Security Settings",
      description: "Security policies, authentication methods, and access control configurations.",
      features: ["Password policies", "2FA settings", "Session management", "IP restrictions"]
    },
    {
      icon: Mail,
      title: "Email Configuration",
      description: "SMTP settings, email templates, and notification preferences for system communications.",
      features: ["SMTP configuration", "Email templates", "Delivery settings", "Bounce handling"]
    },
    {
      icon: Bell,
      title: "Notification Settings",
      description: "System-wide notification preferences, alert thresholds, and communication channels.",
      features: ["Alert thresholds", "Notification channels", "Escalation rules", "Quiet hours"]
    },
    {
      icon: Globe,
      title: "Localization",
      description: "Multi-language support, timezone settings, and regional formatting preferences.",
      features: ["Language packs", "Timezone settings", "Date formats", "Currency settings"]
    }
  ];

  const advancedSettings = [
    {
      icon: Key,
      title: "API Configuration",
      description: "API rate limits, authentication keys, and integration settings"
    },
    {
      icon: Palette,
      title: "UI Customization",
      description: "Branding, themes, and user interface customization options"
    },
    {
      icon: Clock,
      title: "Scheduling",
      description: "Automated tasks, maintenance windows, and system schedules"
    },
    {
      icon: Zap,
      title: "Performance Monitoring",
      description: "System health monitoring, alerts, and performance metrics"
    },
    {
      icon: Lock,
      title: "Compliance Settings",
      description: "GDPR, data protection, and regulatory compliance configurations"
    },
    {
      icon: Monitor,
      title: "System Monitoring",
      description: "Real-time monitoring, logging levels, and diagnostic tools"
    }
  ];

  const upcomingFeatures = [
    "Advanced backup and disaster recovery",
    "Multi-tenant configuration management",
    "Automated system health checks",
    "Configuration version control",
    "Environment-specific settings",
    "Advanced security hardening options",
    "Custom workflow configurations",
    "Integration marketplace"
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Settings className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                System Configuration
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                System-wide settings and configuration management
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
                  Advanced system configuration features are being developed. Basic settings are available in individual modules.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {configurationSections.map((section, index) => {
            const Icon = section.icon;
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
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {section.title}
                    </h3>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {section.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {section.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced Settings */}
        <div className={`p-8 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border mb-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Advanced Configuration Options
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedSettings.map((setting, index) => {
              const Icon = setting.icon;
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {setting.title}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {setting.description}
                      </p>
                    </div>
                  </div>
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
            Configuration Management Process
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Configure
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Set up system parameters and preferences
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Validate
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Verify configuration integrity and security
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Apply
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Deploy changes across the system
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Monitor className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Monitor
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Track system performance and health
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Features */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Upcoming Configuration Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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

export default SystemConfiguration;
