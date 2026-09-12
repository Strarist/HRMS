import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, Trash2, UserCheck, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from '../../utils/toast';

const TalentPoolList = () => {
  const navigate = useNavigate();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('');

  useEffect(() => {
    fetchTalents();
  }, []);

  const fetchTalents = async () => {
    try {
      const response = await api.get('/talent-pool');
      setTalents(response.data.data);
    } catch (error) {
      toast.error('Failed to load talent pool');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await api.delete(`/talent-pool/${id}`);
      setTalents(prev => prev.filter(talent => talent._id !== id));
      toast.success('Entry deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/talent-pool/${id}/status`, { status: newStatus });
      setTalents(prev => prev.map(talent => 
        talent._id === id ? response.data.data : talent
      ));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredTalents = talents.filter(talent => {
    const matchesSearch = 
      talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.talentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.desiredPosition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || talent.status === filterStatus;
    const matchesDepartment = !filterDepartment || 
      talent.desiredDepartment.toLowerCase().includes(filterDepartment.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusBadge = (status) => {
    const badges = {
      new: 'bg-blue-600 text-white',
      reviewed: 'bg-yellow-600 text-white',
      contacted: 'bg-purple-600 text-white',
      shortlisted: 'bg-green-600 text-white',
      rejected: 'bg-red-600 text-white',
      hired: 'bg-emerald-600 text-white'
    };
    return badges[status] || 'bg-gray-600 text-white';
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
          <h1 className="text-2xl font-bold text-white">Talent Pool</h1>
          <p className="text-gray-400 mt-1">Manage general resume submissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Total Submissions:</span>
          <span className="text-2xl font-bold text-white">{talents.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, code, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by department..."
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="input-field md:w-64"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="contacted">Contacted</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      {/* Talent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTalents.map((talent) => (
          <div key={talent._id} className="card hover:border-primary-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">{talent.name}</h3>
                  {talent.isExEmployee && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-600/20 text-orange-400 border border-orange-600/30">
                      Ex-Employee
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {talent.talentCode}
                  {talent.exEmployeeCode && (
                    <span className="ml-2 text-gray-500">• Ex: {talent.exEmployeeCode}</span>
                  )}
                </p>
              </div>
              <select
                value={talent.status}
                onChange={(e) => handleStatusChange(talent._id, e.target.value)}
                className={`badge ${getStatusBadge(talent.status)} cursor-pointer hover:opacity-80 text-xs`}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-32">Email:</span>
                <span className="truncate">{talent.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-32">Phone:</span>
                <span>{talent.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-32">Department:</span>
                <span>{talent.desiredDepartment}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-32">Position:</span>
                <span>{talent.desiredPosition}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-32">Experience:</span>
                <span>
                  {talent.experience?.years || 0} years {talent.experience?.months || 0} months
                </span>
              </div>
              {talent.comments && talent.isExEmployee && (
                <div className="mt-2 p-2 bg-orange-600/10 border border-orange-600/20 rounded text-xs text-orange-300">
                  <span className="font-medium">Note:</span> {talent.comments}
                </div>
              )}
              {talent.skills && talent.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {talent.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block bg-primary-900/30 text-primary-400 text-xs px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {talent.skills.length > 3 && (
                    <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                      +{talent.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-dark-800">
              <button 
                onClick={() => navigate(`/talent-pool/${talent._id}`)}
                className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1"
              >
                <Eye size={16} />
                <span>View</span>
              </button>
              <button 
                className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1"
                title="Move to Job Posting"
              >
                <Briefcase size={16} />
                <span>Move</span>
              </button>
              <button 
                onClick={() => handleDelete(talent._id)}
                className="btn-outline text-sm py-2 px-3 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Submitted: {new Date(talent.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {filteredTalents.length === 0 && (
        <div className="text-center py-12">
          <UserCheck size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No talent pool submissions found</p>
        </div>
      )}
    </div>
  );
};

export default TalentPoolList;
