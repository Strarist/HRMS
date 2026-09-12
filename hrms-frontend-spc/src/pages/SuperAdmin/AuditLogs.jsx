import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  getAuditLogs, 
  getAuditStats, 
  getSecurityEvents,
  getComplianceLogs,
  exportAuditLogs 
} from '../../api/superAdmin';
import toast from '../../utils/toast';
import {
  Shield,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  FileText,
  Search,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react';

const AuditLogs = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    module: '',
    action: '',
    userRole: '',
    severity: '',
    result: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'all') {
        const [logsRes, statsRes] = await Promise.all([
          getAuditLogs(filters),
          getAuditStats({ days: 30 })
        ]);
        setLogs(logsRes.data.auditLogs);
        setStats(statsRes.data);
      } else if (activeTab === 'security') {
        const [securityRes, statsRes] = await Promise.all([
          getSecurityEvents({ page: filters.page, limit: filters.limit }),
          getAuditStats({ days: 30 })
        ]);
        setSecurityEvents(securityRes.data.securityEvents);
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast.error('Failed to fetch audit data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      setExporting(true);
      const response = await exportAuditLogs({ ...filters, format });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export audit logs');
    } finally {
      setExporting(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colorMap = {
      low: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      critical: 'text-red-600 bg-red-100 dark:bg-red-900/20'
    };
    return colorMap[severity] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'unauthorized':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className={`p-6 rounded-xl border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const FilterPanel = () => (
    <div className={`p-4 border rounded-lg mb-6 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Module
          </label>
          <select
            value={filters.module}
            onChange={(e) => setFilters({...filters, module: e.target.value, page: 1})}
            className={`w-full p-2 border rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Modules</option>
            <option value="client_management">Client Management</option>
            <option value="role_management">Role Management</option>
            <option value="analytics_monitoring">Analytics & Monitoring</option>
            <option value="audit_logs">Audit Logs</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Severity
          </label>
          <select
            value={filters.severity}
            onChange={(e) => setFilters({...filters, severity: e.target.value, page: 1})}
            className={`w-full p-2 border rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Result
          </label>
          <select
            value={filters.result}
            onChange={(e) => setFilters({...filters, result: e.target.value, page: 1})}
            className={`w-full p-2 border rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Results</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="unauthorized">Unauthorized</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value, page: 1})}
            className={`w-full p-2 border rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value, page: 1})}
            className={`w-full p-2 border rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>
    </div>
  );

  const LogEntry = ({ log }) => (
    <div className={`p-4 border rounded-lg ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getResultIcon(log.result)}
            <span className={`font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {log.action.replace(/_/g, ' ')}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getSeverityColor(log.severity)
            }`}>
              {log.severity}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                User:
              </span>
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {log.userId?.email || 'Unknown'}
              </span>
            </div>
            <div>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Module:
              </span>
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {log.module.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Time:
              </span>
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {log.requestMetadata?.ip && (
            <div className="mt-2 text-sm">
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                IP:
              </span>
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {log.requestMetadata.ip}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Audit Logs
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Comprehensive audit trail for all Super Admin operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Logs"
            value={stats.overview?.totalLogs || 0}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Security Events"
            value={stats.overview?.securityEvents || 0}
            icon={Shield}
            color="red"
          />
          <StatCard
            title="Active Users"
            value={stats.users?.mostActive?.length || 0}
            icon={User}
            color="green"
          />
          <StatCard
            title="Period"
            value={stats.overview?.period || '30 days'}
            icon={Calendar}
            color="purple"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1">
        {[
          { id: 'all', label: 'All Logs', icon: Activity },
          { id: 'security', label: 'Security Events', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          type="text"
          placeholder="Search logs..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
      </div>

      {/* Filters */}
      {showFilters && <FilterPanel />}

      {/* Logs */}
      <div className="space-y-4">
        {activeTab === 'all' && logs.map((log) => (
          <LogEntry key={log._id} log={log} />
        ))}
        
        {activeTab === 'security' && securityEvents.map((event) => (
          <LogEntry key={event._id} log={event} />
        ))}
        
        {((activeTab === 'all' && logs.length === 0) || 
          (activeTab === 'security' && securityEvents.length === 0)) && (
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No logs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
