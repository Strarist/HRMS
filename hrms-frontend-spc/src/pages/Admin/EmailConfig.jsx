import React, { useState, useEffect } from 'react';
import { Mail, Settings, Save, TestTube, Plus, X, Edit2, Trash2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from '../../utils/toast';
import api from '../../api/axios';

const EmailConfig = () => {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    smtp: {
      host: '',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      }
    },
    from: {
      name: 'SPC HRMS',
      email: 'noreply@spchrms.com'
    },
    settings: {
      enableEmailNotifications: true,
      enableLeaveAlerts: true,
      enableBirthdayWishes: true,
      enableAnnouncementEmails: true,
      enablePasswordResetEmails: true,
      enableOnboardingEmails: true
    }
  });

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Email',
      subject: 'Welcome to SPC HRMS',
      type: 'onboarding',
      enabled: true,
      variables: ['{{firstName}}', '{{lastName}}', '{{email}}', '{{password}}'],
      content: `Dear {{firstName}} {{lastName}},

Welcome to SPC HRMS! Your account has been successfully created.

Login Details:
Email: {{email}}
Temporary Password: {{password}}

Please login and change your password immediately.

Best regards,
SPC HRMS Team`
    },
    {
      id: 2,
      name: 'Leave Approval',
      subject: 'Leave Request Approved',
      type: 'leave',
      enabled: true,
      variables: ['{{firstName}}', '{{leaveType}}', '{{startDate}}', '{{endDate}}'],
      content: `Dear {{firstName}},

Your leave request has been approved.

Leave Details:
Type: {{leaveType}}
From: {{startDate}}
To: {{endDate}}

Enjoy your time off!

Best regards,
SPC HRMS Team`
    },
    {
      id: 3,
      name: 'Password Reset',
      subject: 'Password Reset Request',
      type: 'security',
      enabled: true,
      variables: ['{{firstName}}', '{{resetLink}}'],
      content: `Dear {{firstName}},

You requested a password reset. Click the link below to reset your password:

{{resetLink}}

This link will expire in 24 hours.

Best regards,
SPC HRMS Team`
    }
  ]);

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      setLoading(true);
      // This would be the actual API call
      // const response = await api.get('/api/email-config');
      
      // For now, set mock data
      setEmailConfig({
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'spchrms@gmail.com',
            pass: 'app-password-here'
          }
        },
        from: {
          name: 'SPC HRMS',
          email: 'noreply@spchrms.com'
        },
        settings: {
          enableEmailNotifications: true,
          enableLeaveAlerts: true,
          enableBirthdayWishes: true,
          enableAnnouncementEmails: true,
          enablePasswordResetEmails: true,
          enableOnboardingEmails: true
        }
      });
    } catch (error) {
      console.error('Error fetching email config:', error);
      toast.error('Failed to load email configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      // This would be the actual API call
      // await api.put('/api/email-config', emailConfig);
      
      toast.success('Email configuration saved successfully');
    } catch (error) {
      console.error('Error saving email config:', error);
      toast.error('Failed to save email configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestLoading(true);
      // This would be the actual API call
      // await api.post('/api/email-config/test', emailConfig);
      
      toast.success('Test email sent successfully!');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setTestLoading(false);
    }
  };

  const handleToggleTemplate = (id) => {
    setTemplates(templates.map(template =>
      template.id === id ? { ...template, enabled: !template.enabled } : template
    ));
  };

  const handleEditTemplate = (template) => {
    // This would open a modal for editing the template
    toast.info(`Editing template: ${template.name}`);
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(template => template.id !== id));
      toast.success('Template deleted successfully');
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Mail className="w-8 h-8 text-[#A88BFF]" />
              Email Configuration
            </h1>
            <p className="text-gray-400 mt-1">Configure SMTP settings and email templates</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestEmail}
              disabled={testLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#2A2A3A] border border-gray-700 text-white rounded-lg hover:border-[#A88BFF] transition-colors disabled:opacity-50"
            >
              <TestTube className="w-4 h-4" />
              <span>{testLoading ? 'Sending...' : 'Test Email'}</span>
            </button>
            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SMTP Configuration */}
          <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#A88BFF]" />
              <h2 className="text-xl font-semibold text-white">SMTP Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={emailConfig.smtp.host}
                  onChange={(e) => setEmailConfig({
                    ...emailConfig,
                    smtp: { ...emailConfig.smtp, host: e.target.value }
                  })}
                  className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={emailConfig.smtp.port}
                    onChange={(e) => setEmailConfig({
                      ...emailConfig,
                      smtp: { ...emailConfig.smtp, port: parseInt(e.target.value) }
                    })}
                    className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Security
                  </label>
                  <select
                    value={emailConfig.smtp.secure ? 'ssl' : 'tls'}
                    onChange={(e) => setEmailConfig({
                      ...emailConfig,
                      smtp: { ...emailConfig.smtp, secure: e.target.value === 'ssl' }
                    })}
                    className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailConfig.smtp.auth.user}
                  onChange={(e) => setEmailConfig({
                    ...emailConfig,
                    smtp: {
                      ...emailConfig.smtp,
                      auth: { ...emailConfig.smtp.auth, user: e.target.value }
                    }
                  })}
                  className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={emailConfig.smtp.auth.pass}
                    onChange={(e) => setEmailConfig({
                      ...emailConfig,
                      smtp: {
                        ...emailConfig.smtp,
                        auth: { ...emailConfig.smtp.auth, pass: e.target.value }
                      }
                    })}
                    className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                    placeholder="App password or token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* From Settings */}
          <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-[#A88BFF]" />
              <h2 className="text-xl font-semibold text-white">From Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={emailConfig.from.name}
                  onChange={(e) => setEmailConfig({
                    ...emailConfig,
                    from: { ...emailConfig.from, name: e.target.value }
                  })}
                  className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                  placeholder="SPC HRMS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={emailConfig.from.email}
                  onChange={(e) => setEmailConfig({
                    ...emailConfig,
                    from: { ...emailConfig.from, email: e.target.value }
                  })}
                  className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                  placeholder="noreply@spchrms.com"
                />
              </div>

              <div className="pt-6 border-t border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(emailConfig.settings).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setEmailConfig({
                          ...emailConfig,
                          settings: { ...emailConfig.settings, [key]: e.target.checked }
                        })}
                        className="w-4 h-4 text-[#A88BFF] bg-gray-700 border-gray-600 rounded focus:ring-[#A88BFF]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="mt-8 bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-[#A88BFF]" />
              <h2 className="text-xl font-semibold text-white">Email Templates</h2>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Template</span>
            </button>
          </div>

          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-[#1E1E2A] rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.enabled
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                      }`}>
                        {template.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {template.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Subject: {template.subject}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleTemplate(template.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        template.enabled
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                      }`}
                      title={template.enabled ? 'Disable' : 'Enable'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Available Variables:</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#2A2A3A] border border-gray-600 rounded text-xs text-gray-300 font-mono"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Preview:</h4>
                  <div className="bg-[#2A2A3A] rounded-lg p-4 border border-gray-700">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                      {template.content.substring(0, 200)}
                      {template.content.length > 200 && '...'}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Status */}
        <div className="mt-8 bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Configuration Status</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${emailConfig.smtp.host ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-gray-300">SMTP Configuration</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${emailConfig.smtp.auth.user ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-gray-300">Authentication</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${emailConfig.settings.enableEmailNotifications ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-gray-300">Email Notifications</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Important:</strong> Make sure to use an app-specific password for Gmail accounts or generate an API token for other email services. 
              Never use your primary email password directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfig;
