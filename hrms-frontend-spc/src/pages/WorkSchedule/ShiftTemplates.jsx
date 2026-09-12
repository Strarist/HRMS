import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Clock, MapPin, Building } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';

const ShiftTemplates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 60,
    breakStartTime: '13:00',
    isNightShift: false,
    applicableDays: [1, 2, 3, 4, 5],
    location: '',
    department: '',
    description: ''
  });

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/work-schedule/shifts');
      setTemplates(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch shift templates');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = [...prev.applicableDays];
      if (days.includes(day)) {
        return { ...prev, applicableDays: days.filter(d => d !== day) };
      } else {
        return { ...prev, applicableDays: [...days, day] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/work-schedule/shifts/${editingTemplate._id}`, formData);
        toast.success('Shift template updated successfully');
      } else {
        await api.post('/work-schedule/shifts', formData);
        toast.success('Shift template created successfully');
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        code: '',
        startTime: '09:00',
        endTime: '18:00',
        breakDuration: 60,
        breakStartTime: '13:00',
        isNightShift: false,
        applicableDays: [1, 2, 3, 4, 5],
        location: '',
        department: '',
        description: ''
      });
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save shift template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      code: template.code,
      startTime: template.startTime,
      endTime: template.endTime,
      breakDuration: template.breakDuration || 60,
      breakStartTime: template.breakStartTime || '13:00',
      isNightShift: template.isNightShift || false,
      applicableDays: template.applicableDays || [1, 2, 3, 4, 5],
      location: template.location || '',
      department: template.department?._id || '',
      description: template.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift template?')) {
      return;
    }
    try {
      await api.delete(`/work-schedule/shifts/${id}`);
      toast.success('Shift template deleted successfully');
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete shift template');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading shift templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shift Templates</h1>
          <p className="text-gray-400 mt-1">Manage work shift patterns</p>
        </div>
        {(user.role === 'admin' || user.role === 'hr') && (
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Shift Template</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <div key={template._id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                <p className="text-sm text-gray-400">Code: {template.code}</p>
              </div>
              {(user.role === 'admin' || user.role === 'hr') && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1 hover:bg-dark-800 rounded"
                  >
                    <Edit2 size={16} className="text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="p-1 hover:bg-dark-800 rounded"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-300">
                  {template.startTime} - {template.endTime}
                </span>
              </div>
              {template.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-300">{template.location}</span>
                </div>
              )}
              <div className="text-sm text-gray-400">
                Break: {template.breakDuration} min
              </div>
              {template.isNightShift && (
                <span className="inline-block px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                  Night Shift
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-bold text-white">
                {editingTemplate ? 'Edit Shift Template' : 'Add Shift Template'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="input-field"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="breakDuration"
                    value={formData.breakDuration}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Break Start Time
                  </label>
                  <input
                    type="time"
                    name="breakStartTime"
                    value={formData.breakStartTime}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isNightShift"
                    checked={formData.isNightShift}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Night Shift</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Applicable Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-3 py-1 rounded text-sm ${
                        formData.applicableDays.includes(day.value)
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-dark-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftTemplates;

