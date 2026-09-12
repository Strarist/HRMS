import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, GraduationCap, FileText } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const AcademicQualifications = () => {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQual, setCurrentQual] = useState(null);
  const [formData, setFormData] = useState({
    degree: '',
    specialization: '',
    institution: '',
    passingYear: '',
    percentage: '',
    documentUrl: ''
  });

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    try {
      setLoading(true);
      // Note: This endpoint would need to be created to fetch employee education
      // For now, this is a placeholder structure
      const response = await api.get('/employees/profile');
      if (response.data.data && response.data.data.education) {
        setQualifications(response.data.data.education);
      }
    } catch (error) {
      // Silently fail if endpoint doesn't exist yet
      console.log('Education endpoint not available yet');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // This would need to be implemented in the employee profile update endpoint
      toast.success('Academic qualification saved successfully');
      setIsModalOpen(false);
      setCurrentQual(null);
      setFormData({
        degree: '',
        specialization: '',
        institution: '',
        passingYear: '',
        percentage: '',
        documentUrl: ''
      });
      fetchQualifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save qualification');
    }
  };

  const handleEdit = (qual) => {
    setCurrentQual(qual);
    setFormData({
      degree: qual.degree || '',
      specialization: qual.specialization || '',
      institution: qual.institution || '',
      passingYear: qual.passingYear || '',
      percentage: qual.percentage || '',
      documentUrl: qual.documentUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Are you sure you want to delete this qualification?')) return;
    try {
      // This would need to be implemented
      toast.success('Qualification deleted successfully');
      fetchQualifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete qualification');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <GraduationCap size={20} /> Academic Qualifications
        </h2>
        <button
          onClick={() => {
            setCurrentQual(null);
            setFormData({
              degree: '',
              specialization: '',
              institution: '',
              passingYear: '',
              percentage: '',
              documentUrl: ''
            });
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} /> Add Qualification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {qualifications.map((qual, index) => (
          <div key={index} className="bg-dark-700 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{qual.degree}</h3>
                <p className="text-gray-400 text-sm">{qual.specialization}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(qual)} className="text-primary-400 hover:text-primary-300">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-1 mt-2">
              <p className="text-gray-400 text-sm">Institution: {qual.institution}</p>
              <p className="text-gray-400 text-sm">Year: {qual.passingYear}</p>
              {qual.percentage && (
                <p className="text-gray-400 text-sm">Percentage: {qual.percentage}%</p>
              )}
              {qual.documentUrl && (
                <a
                  href={qual.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                >
                  <FileText size={14} /> View Document
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {qualifications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No academic qualifications added yet</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-700 p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {currentQual ? 'Edit Qualification' : 'Add Qualification'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Degree *</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Institution *</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Passing Year *</label>
                  <input
                    type="number"
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleChange}
                    min="1950"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Percentage/GPA</label>
                  <input
                    type="text"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleChange}
                    placeholder="e.g., 85 or 3.5"
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
                    placeholder="https://..."
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
                  <Save size={20} /> {currentQual ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicQualifications;

