import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Award, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const Certifications = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCert, setCurrentCert] = useState(null);
  const [formData, setFormData] = useState({
    certificationName: '',
    issuingOrganization: '',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    isPermanent: false,
    documentUrl: '',
    skills: [],
    description: ''
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/profile/certifications');
      setCertifications(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'isPermanent') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'skills') {
      const skills = value.split(',').map(s => s.trim()).filter(s => s);
      setFormData(prev => ({ ...prev, [name]: skills }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCert) {
        await api.put(`/employee/profile/certifications/${currentCert._id}`, formData);
        toast.success('Certification updated successfully');
      } else {
        await api.post('/employee/profile/certifications', formData);
        toast.success('Certification added successfully');
      }
      setIsModalOpen(false);
      setCurrentCert(null);
      setFormData({
        certificationName: '',
        issuingOrganization: '',
        certificateNumber: '',
        issueDate: '',
        expiryDate: '',
        isPermanent: false,
        documentUrl: '',
        skills: [],
        description: ''
      });
      fetchCertifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save certification');
    }
  };

  const handleEdit = (cert) => {
    setCurrentCert(cert);
    setFormData({
      certificationName: cert.certificationName || '',
      issuingOrganization: cert.issuingOrganization || '',
      certificateNumber: cert.certificateNumber || '',
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
      isPermanent: cert.isPermanent || false,
      documentUrl: cert.documentUrl || '',
      skills: cert.skills || [],
      description: cert.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      await api.delete(`/employee/profile/certifications/${id}`);
      toast.success('Certification deleted successfully');
      fetchCertifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete certification');
    }
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Award size={20} /> Certifications
        </h2>
        <button
          onClick={() => {
            setCurrentCert(null);
            setFormData({
              certificationName: '',
              issuingOrganization: '',
              certificateNumber: '',
              issueDate: '',
              expiryDate: '',
              isPermanent: false,
              documentUrl: '',
              skills: [],
              description: ''
            });
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} /> Add Certification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certifications.map((cert) => {
          const isExpired = cert.isExpired;
          const expiringSoon = isExpiringSoon(cert.expiryDate);
          
          return (
            <div
              key={cert._id}
              className={`bg-dark-700 p-4 rounded-lg ${
                isExpired ? 'border-l-4 border-red-500' : expiringSoon ? 'border-l-4 border-yellow-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{cert.certificationName}</h3>
                  <p className="text-gray-400 text-sm">{cert.issuingOrganization}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cert)} className="text-primary-400 hover:text-primary-300">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(cert._id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {cert.certificateNumber && (
                <p className="text-gray-400 text-sm">Cert #: {cert.certificateNumber}</p>
              )}

              <div className="mt-2 space-y-1">
                <p className="text-gray-400 text-sm">
                  Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}
                </p>
                {!cert.isPermanent && cert.expiryDate && (
                  <p className={`text-sm ${isExpired ? 'text-red-400' : expiringSoon ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {isExpired ? (
                      <span className="flex items-center gap-1">
                        <AlertCircle size={14} /> Expired: {new Date(cert.expiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      `Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`
                    )}
                  </p>
                )}
                {cert.isPermanent && (
                  <p className="text-green-400 text-sm">Permanent</p>
                )}
              </div>

              {cert.skills && cert.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {cert.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-700 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {currentCert ? 'Edit Certification' : 'Add Certification'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Certification Name *</label>
                  <input
                    type="text"
                    name="certificationName"
                    value={formData.certificationName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Issuing Organization *</label>
                  <input
                    type="text"
                    name="issuingOrganization"
                    value={formData.issuingOrganization}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Certificate Number</label>
                  <input
                    type="text"
                    name="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    disabled={formData.isPermanent}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPermanent"
                    checked={formData.isPermanent}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Permanent (No Expiry)</label>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills.join(', ')}
                    onChange={handleChange}
                    placeholder="e.g., JavaScript, React, Node.js"
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Document URL</label>
                  <input
                    type="url"
                    name="documentUrl"
                    value={formData.documentUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={20} /> {currentCert ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certifications;

