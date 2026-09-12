import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  LineChart, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  AlertCircle,
  Target,
  Activity,
  Globe
} from 'lucide-react';

const AnalyticsReports = () => {
  const { theme } = useTheme();

  const analyticsFeatures = [
    {
      icon: BarChart3,
      title: "Revenue Analytics",
      description: "Comprehensive revenue tracking, growth analysis, and financial performance metrics across all clients and packages."
    },
    {
      icon: Users,
      title: "Client Analytics",
      description: "Client behavior analysis, subscription patterns, churn rates, and customer lifetime value calculations."
    },
    {
      icon: TrendingUp,
      title: "Growth Metrics",
      description: "Track business growth with KPIs, conversion rates, market expansion, and performance benchmarking."
    },
    {
      icon: PieChart,
      title: "Package Performance",
      description: "Analyze package popularity, pricing effectiveness, and feature utilization across different client segments."
    },
    {
      icon: Activity,
      title: "System Usage Analytics",
      description: "Monitor system performance, user engagement, feature adoption, and resource utilization patterns."
    },
    {
      icon: Globe,
      title: "Geographic Analytics",
      description: "Regional performance analysis, market penetration insights, and location-based growth opportunities."
    }
  ];

  const reportTypes = [
    {
      icon: DollarSign,
      title: "Financial Reports",
      description: "Revenue, profit margins, billing cycles, payment analytics",
      frequency: "Daily, Weekly, Monthly, Quarterly"
    },
    {
      icon: Users,
      title: "Client Reports",
      description: "User activity, subscription status, engagement metrics",
      frequency: "Real-time, Daily, Weekly"
    },
    {
      icon: Target,
      title: "Performance Reports",
      description: "KPI tracking, goal achievement, benchmark analysis",
      frequency: "Weekly, Monthly, Quarterly"
    },
    {
      icon: LineChart,
      title: "Trend Analysis",
      description: "Growth trends, seasonal patterns, predictive insights",
      frequency: "Monthly, Quarterly, Yearly"
    }
  ];

  const upcomingFeatures = [
    "AI-powered predictive analytics",
    "Custom dashboard builder",
    "Real-time data streaming",
    "Advanced data visualization tools",
    "Automated report scheduling",
    "Integration with external BI tools",
    "Machine learning insights",
    "Custom KPI tracking"
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Analytics & Reports
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Comprehensive business intelligence and reporting suite
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
                  Advanced analytics and reporting features are being developed. Basic reporting is available in other modules.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {analyticsFeatures.map((feature, index) => {
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
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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

        {/* Report Types Section */}
        <div className={`p-8 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border mb-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Available Report Types
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
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
                        {report.title}
                      </h3>
                      <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {report.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {report.frequency}
                        </span>
                      </div>
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
            How Analytics & Reports Work
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Data Collection
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Automatic collection of business metrics, user interactions, and system performance data
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Filter className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Data Processing
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Advanced algorithms process and analyze data to generate meaningful insights and trends
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Report Generation
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Interactive dashboards and exportable reports with customizable views and scheduling
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Features */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Upcoming Advanced Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
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

export default AnalyticsReports;
