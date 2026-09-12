import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from '../../utils/toast';

const PayrollGenerate = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleGenerate = async () => {
    if (!month || !year) {
      toast.error('Please select month and year');
      return;
    }

    setLoading(true);
    setResults(null);
    try {
      const response = await api.post('/payroll/bulk-generate', { month: parseInt(month), year: parseInt(year) });
      if (response.data.success) {
        toast.success(response.data.message);
        setResults(response.data.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/payroll')} className="p-2 hover:bg-dark-800 rounded-lg">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Generate Payroll</h1>
          <p className="text-gray-400 mt-1">Generate payroll for selected period</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
              className="input-field"
              disabled={loading}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              className="input-field"
              disabled={loading}
              min="2020"
              max="2099"
            />
          </div>
        </div>
        <button 
          onClick={handleGenerate} 
          className="btn-primary mt-6 flex items-center space-x-2"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{loading ? 'Generating...' : 'Generate Payroll'}</span>
        </button>

        {results && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-semibold mb-3">Generation Results</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-green-400 font-bold text-xl">{results.created?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Skipped</p>
                <p className="text-yellow-400 font-bold text-xl">{results.skipped?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Errors</p>
                <p className="text-red-400 font-bold text-xl">{results.errors?.length || 0}</p>
              </div>
            </div>
            {results.errors && results.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-red-400 text-sm font-semibold mb-2">Errors:</p>
                <ul className="list-disc list-inside text-sm text-gray-400">
                  {results.errors.map((err, idx) => (
                    <li key={idx}>{err.employee}: {err.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollGenerate;
