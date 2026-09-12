import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Copy, FileText, 
  Filter, Search, MoreHorizontal, CheckCircle,
  AlertCircle, Settings, Mail, Calendar, X, Save
} from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const OfferTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [filterStatus, filterCategory, searchTerm]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterCategory) params.append('category', filterCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/offer-templates?${params.toString()}`);
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Failed to load offer templates:', error);

      // Provide fallback templates for testing when backend is not available
      const fallbackTemplates = [
        {
          _id: 'default-template-1',
          name: 'Full-Time Offer Template',
          category: 'full-time',
          description: 'Standard full-time employment offer template',
          subject: '🎉 Congratulations! Offer Letter - {{position}} at {{companyName}}',
          content: `Dear {{candidateName}},

We are thrilled to extend an offer for the position of {{position}} at {{companyName}}!

OFFER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position: {{position}}
Department: {{department}}
Employment Type: Full-Time
Annual CTC: ₹{{offeredCTC}}
Proposed Start Date: {{startDate}}

This offer is valid until {{expiryDate}}. Please confirm your acceptance by replying to this email.

We look forward to welcoming you to our team!

Best regards,
{{hrName}}
{{companyName}}
{{hrEmail}} | {{hrPhone}}`,
          status: 'active',
          isDefault: true,
          expiryDays: 7,
          version: '1.0',
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'default-template-2',
          name: 'Internship Offer Template',
          category: 'intern',
          description: 'Internship offer template with stipend details',
          subject: 'Welcome Aboard! Internship Offer - {{position}} at {{companyName}}',
          content: `Dear {{candidateName}},

Congratulations! We are excited to offer you an internship position as {{position}} at {{companyName}}.

INTERNSHIP DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position: {{position}}
Department: {{department}}
Type: Internship
Monthly Stipend: ₹{{offeredCTC}}
Start Date: {{startDate}}

LEARNING OPPORTUNITIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Work on real-world projects
• Learn from experienced professionals
• Mentorship and guidance

ACCEPTANCE DEADLINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please confirm your acceptance by {{expiryDate}} by replying to this email.

We're excited to have you join our team!

Best regards,
{{hrName}}
{{companyName}}
{{hrEmail}} | {{hrPhone}}`,
          status: 'active',
          isDefault: false,
          expiryDays: 7,
          version: '1.0',
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'default-template-3',
          name: 'Part-Time Offer Template',
          category: 'part-time',
          description: 'Part-time position offer template',
          subject: 'Part-Time Position Offer - {{position}} at {{companyName}}',
          content: `Dear {{candidateName}},

We are pleased to offer you a part-time position as {{position}} at {{companyName}}.

POSITION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position: {{position}}
Department: {{department}}
Employment Type: Part-Time
Annual Compensation: ₹{{offeredCTC}}
Start Date: {{startDate}}

WORK ARRANGEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Flexible working hours
• Part-time benefits included
• Remote work options available

This offer is valid until {{expiryDate}}. Please confirm your acceptance by replying to this email.

We look forward to having you as part of our team!

Best regards,
{{hrName}}
{{companyName}}
{{hrEmail}} | {{hrPhone}}`,
          status: 'active',
          isDefault: false,
          expiryDays: 7,
          version: '1.0',
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'default-template-4',
          name: 'Contract Offer Template',
          category: 'contract',
          description: 'Contract position offer template',
          subject: 'Contract Offer - {{position}} at {{companyName}}',
          content: `Dear {{candidateName}},

We are pleased to offer you a contract position as {{position}} with {{companyName}}.

CONTRACT TERMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position: {{position}}
Department: {{department}}
Contract Type: Fixed-term Contract
Annual Compensation: ₹{{offeredCTC}}
Contract Start Date: {{startDate}}

PROJECT SCOPE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You will be working with the {{department}} team on specialized projects requiring your expertise.

TERMS & CONDITIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Detailed contract agreement will be provided
• Payment terms as per contract
• Project deliverables and milestones

ACCEPTANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This offer is valid until {{expiryDate}}. Please confirm your acceptance by replying to this email.

We look forward to working with you!

Best regards,
{{hrName}}
{{companyName}}
{{hrEmail}} | {{hrPhone}}`,
          status: 'active',
          isDefault: false,
          expiryDays: 7,
          version: '1.0',
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'default-template-5',
          name: 'Executive Offer Template',
          category: 'executive',
          description: 'Executive/senior leadership position offer template',
          subject: 'Executive Offer - {{position}} at {{companyName}}',
          content: `Dear {{candidateName}},

On behalf of {{companyName}}, I am delighted to extend an offer for the executive position of {{position}}.

Your extensive experience and proven track record make you an ideal candidate to lead our {{department}} team and drive strategic initiatives.

POSITION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: {{position}}
Department: {{department}}
Reporting Structure: [To be discussed]
Annual Compensation: ₹{{offeredCTC}}
Anticipated Start Date: {{startDate}}

COMPENSATION PACKAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Competitive base salary
• Performance-based incentives
• Executive benefits package
• Flexible work arrangements

STRATEGIC RESPONSIBILITIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Leadership of {{department}} department
• Strategic planning and execution
• Team development and mentorship

NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This offer is valid until {{expiryDate}}. We would be pleased to schedule a call to discuss any questions you may have.

Please confirm your acceptance by replying to this email.

Sincerely,
{{hrName}}
{{companyName}} Leadership Team
{{hrEmail}}
{{hrPhone}}`,
          status: 'active',
          isDefault: false,
          expiryDays: 7,
          version: '1.0',
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setTemplates(fallbackTemplates.filter(template => {
        // Apply filters to fallback templates
        if (filterStatus && template.status !== filterStatus) return false;
        if (filterCategory && template.category !== filterCategory) return false;
        if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      }));

      // Only show error toast if it's not a 404 (endpoint doesn't exist)
      if (error.response?.status !== 404) {
        toast.error('Failed to load offer templates, using default templates');
      } else {
        console.warn('⚠️ Offer templates API not available, using fallback templates for testing');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTemplateStatus = async (id, status) => {
    try {
      await api.put(`/offer-templates/${id}/status`, { status });
      toast.success(`Template ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update template status');
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await api.delete(`/offer-templates/${id}`);
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const previewTemplate = async (template) => {
    try {
      const response = await api.post(`/offer-templates/${template._id}/preview`, {
        sampleData: {
          candidateName: 'John Doe',
          designation: 'Software Engineer',
          ctc: '500000',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          companyName: 'Your Company'
        }
      });
      setPreviewData(response.data.data);
      setSelectedTemplate(template);
      setShowPreviewModal(true);
    } catch (error) {
      toast.error('Failed to preview template');
    }
  };

  const duplicateTemplate = async (template) => {
    try {
      const duplicateData = {
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false,
        status: 'draft'
      };
      delete duplicateData._id;
      delete duplicateData.templateId;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.createdBy;
      delete duplicateData.updatedBy;

      await api.post('/offer-templates', duplicateData);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      'inactive': { color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle },
      'draft': { color: 'bg-yellow-500/20 text-yellow-400', icon: Edit }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {React.createElement(config.icon, { size: 12, className: 'mr-1' })}
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = {
      'full-time': 'bg-blue-500/20 text-blue-400',
      'part-time': 'bg-purple-500/20 text-purple-400',
      'contract': 'bg-orange-500/20 text-orange-400',
      'intern': 'bg-pink-500/20 text-pink-400',
      'executive': 'bg-red-500/20 text-red-400',
      'general': 'bg-gray-500/20 text-gray-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[category] || colors.general}`}>
        {category}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Offer Letter Email Templates</h1>
          <p className="text-gray-400 mt-1">Create and manage customizable email templates for different offer types</p>
        </div>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setShowCreateModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Template</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Categories</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
            <option value="executive">Executive</option>
            <option value="general">General</option>
          </select>
          
          <button
            onClick={() => {
              setFilterStatus('');
              setFilterCategory('');
              setSearchTerm('');
            }}
            className="btn-outline text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template._id}
            template={template}
            onPreview={previewTemplate}
            onEdit={(template) => {
              setSelectedTemplate(template);
              setShowCreateModal(true);
            }}
            onDuplicate={duplicateTemplate}
            onDelete={deleteTemplate}
            onStatusChange={updateTemplateStatus}
            getStatusBadge={getStatusBadge}
            getCategoryBadge={getCategoryBadge}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No offer templates found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || filterStatus || filterCategory 
              ? 'Try adjusting your filters' 
              : 'Create your first offer template to get started'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          onSave={() => {
            fetchTemplates();
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <PreviewModal
          template={selectedTemplate}
          previewData={previewData}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewData(null);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Template Card Component
const TemplateCard = ({ 
  template, 
  onPreview, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onStatusChange,
  getStatusBadge,
  getCategoryBadge 
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{template.name}</h3>
            {template.isDefault && (
              <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>
          
          <div className="flex items-center space-x-2 mb-3">
            {getStatusBadge(template.status)}
            {getCategoryBadge(template.category)}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreHorizontal size={16} className="text-gray-400" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onPreview(template);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>
              <button
                onClick={() => {
                  onEdit(template);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onDuplicate(template);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Copy size={14} />
                <span>Duplicate</span>
              </button>
              <button
                onClick={() => {
                  onStatusChange(template._id, template.status === 'active' ? 'inactive' : 'active');
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Settings size={14} />
                <span>{template.status === 'active' ? 'Deactivate' : 'Activate'}</span>
              </button>
              <button
                onClick={() => {
                  onDelete(template._id);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <Mail size={14} />
          <span className="truncate">{template.subject}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar size={14} />
          <span>Version {template.version || '1.0'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FileText size={14} />
          <span>Used {template.usageCount || 0} times</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Created {new Date(template.createdAt).toLocaleDateString()}
        </span>
        <button
          onClick={() => onPreview(template)}
          className="btn-outline text-sm"
        >
          Preview
        </button>
      </div>
    </div>
  );
};

// Template Modal Component
const TemplateModal = ({ template, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'full-time',
    subject: template?.subject || '',
    content: template?.content || '',
    status: template?.status || 'draft',
    isDefault: template?.isDefault || false,
    expiryDays: template?.expiryDays || 7
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const availableVariables = [
    { value: 'candidateName', label: 'Candidate Name' },
    { value: 'candidateEmail', label: 'Candidate Email' },
    { value: 'position', label: 'Position/Designation' },
    { value: 'department', label: 'Department' },
    { value: 'offeredCTC', label: 'Offered CTC' },
    { value: 'startDate', label: 'Start Date' },
    { value: 'joiningDate', label: 'Joining Date' },
    { value: 'companyName', label: 'Company Name' },
    { value: 'hrName', label: 'HR Name' },
    { value: 'hrEmail', label: 'HR Email' },
    { value: 'hrPhone', label: 'HR Phone' },
    { value: 'expiryDate', label: 'Offer Expiry Date' }
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Template name is required';
    if (!formData.subject.trim()) newErrors.subject = 'Email subject is required';
    if (!formData.content.trim()) newErrors.content = 'Email content is required';
    if (formData.expiryDays < 1) newErrors.expiryDays = 'Expiry days must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (template?._id) {
        await api.put(`/offer-templates/${template._id}`, formData);
        toast.success('Template updated successfully');
      } else {
        await api.post('/offer-templates', formData);
        toast.success('Template created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable) => {
    setFormData({
      ...formData,
      content: formData.content + `{{${variable}}}`
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {template ? 'Edit Template' : 'Create New Template'}
        </h2>
            <p className="text-gray-400 mt-1">Design your offer letter email template</p>
          </div>
          <button onClick={onClose} className="btn-outline p-2">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g., Full-Time Offer Email"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field w-full"
              >
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
                <option value="executive">Executive</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field w-full"
              rows="2"
              placeholder="Brief description of this template's purpose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`input-field w-full ${errors.subject ? 'border-red-500' : ''}`}
              placeholder="e.g., Congratulations! Offer Letter - {{position}} at {{companyName}}"
            />
            {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Use {`{{variableName}}`} for dynamic content
            </p>
          </div>

          {/* Template Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Content *
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Insert Variable:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      insertVariable(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="input-field text-xs py-1 px-2"
                >
                  <option value="">Select...</option>
                  {availableVariables.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className={`input-field w-full font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
              rows="16"
              placeholder={`Dear {{candidateName}},

We are delighted to extend an offer for the position of {{position}} at {{companyName}}.

Position: {{position}}
Department: {{department}}
Annual CTC: ₹{{offeredCTC}}
Proposed Start Date: {{startDate}}

This offer is valid until {{expiryDate}}. Please confirm your acceptance by responding to this email.

We look forward to welcoming you to our team!

Best regards,
{{hrName}}
{{companyName}}
{{hrEmail}} | {{hrPhone}}`}
            />
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Use double curly braces for variables, e.g., {`{{candidateName}}`}
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field w-full"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Offer Expiry (Days) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}
                className={`input-field w-full ${errors.expiryDays ? 'border-red-500' : ''}`}
              />
              {errors.expiryDays && <p className="text-red-400 text-sm mt-1">{errors.expiryDays}</p>}
            </div>

            <div className="flex items-center pt-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-300">Set as Default</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={saving}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ template, previewData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">Template Preview</h2>
          <button onClick={onClose} className="btn-outline p-2">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
            <div className="p-3 bg-dark-800 border border-dark-700 rounded-lg text-white">
              {previewData.subject}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Content</label>
            <div className="p-4 bg-dark-800 border border-dark-700 rounded-lg text-white whitespace-pre-wrap max-h-96 overflow-y-auto">
              {previewData.content}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> This preview uses sample data. Actual values will be replaced when sending offers.
            </p>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 p-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default OfferTemplates;
