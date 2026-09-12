import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-gray-400 mt-1">Manage organization departments</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept._id} className="card">
            <h3 className="text-lg font-semibold text-white mb-2">{dept.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{dept.code}</p>
            <p className="text-sm text-gray-300">{dept.description || 'No description'}</p>
            {dept.head && (
              <div className="mt-4 pt-4 border-t border-dark-800">
                <p className="text-xs text-gray-400">Department Head</p>
                <p className="text-sm text-white">{dept.head.firstName} {dept.head.lastName}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
