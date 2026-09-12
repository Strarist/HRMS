import React, { useState } from 'react';
import { Play, Calendar, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ManualAccrual = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accrualType: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const triggerMonthlyAccrual = async () => {
    try {
      setLoading(true);
      const response = await api.post('/leave-accrual/trigger/monthly', {
        year: formData.year,
        month: formData.month
      });
      toast.success(response.data.message || 'Monthly accrual triggered successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to trigger monthly accrual');
    } finally {
      setLoading(false);
    }
  };

  const triggerYearlyAccrual = async () => {
    try {
      setLoading(true);
      const response = await api.post('/leave-accrual/trigger/yearly', {
        year: formData.year
      });
      toast.success(response.data.message || 'Yearly accrual triggered successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to trigger yearly accrual');
    } finally {
      setLoading(false);
    }
  };

  const triggerCarryForward = async () => {
    try {
      setLoading(true);
      const fromYear = formData.year - 1;
      const toYear = formData.year;
      const response = await api.post('/leave-accrual/trigger/carry-forward', {
        fromYear,
        toYear
      });
      toast.success(response.data.message || 'Carry forward processed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process carry forward');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manual Accrual Processing</h1>
        <p className="text-gray-400 mt-2">Trigger leave accrual processes manually</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Accrual Type</label>
            <select
              name="accrualType"
              value={formData.accrualType}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="monthly">Monthly Accrual</option>
              <option value="yearly">Yearly Accrual</option>
              <option value="carry-forward">Carry Forward</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          {formData.accrualType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Month</label>
              <input
                type="number"
                name="month"
                value={formData.month}
                onChange={handleChange}
                min="1"
                max="12"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {formData.accrualType === 'monthly' && (
            <button
              onClick={triggerMonthlyAccrual}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Play size={20} />
              Trigger Monthly Accrual
            </button>
          )}
          {formData.accrualType === 'yearly' && (
            <button
              onClick={triggerYearlyAccrual}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Calendar size={20} />
              Trigger Yearly Accrual
            </button>
          )}
          {formData.accrualType === 'carry-forward' && (
            <button
              onClick={triggerCarryForward}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={20} />
              Process Carry Forward
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Instructions</h2>
        <ul className="space-y-2 text-gray-300">
          <li>• Monthly Accrual: Processes accrual for a specific month and year</li>
          <li>• Yearly Accrual: Processes accrual for the entire year</li>
          <li>• Carry Forward: Transfers unused leave balance from previous year to current year</li>
          <li>• Ensure all accrual policies are configured before triggering</li>
          <li>• Processing may take a few minutes depending on the number of employees</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualAccrual;

