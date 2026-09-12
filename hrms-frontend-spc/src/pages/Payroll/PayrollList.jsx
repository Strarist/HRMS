import React, { useEffect, useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from '../../utils/toast';

const PayrollList = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll');
      setPayrolls(response.data.data);
    } catch (error) {
      toast.error('Failed to load payroll');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      processing: 'badge-info',
      paid: 'badge-success',
      failed: 'badge-danger'
    };
    return badges[status] || 'badge-default';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payroll</h1>
          <p className="text-gray-400 mt-1">Manage employee payroll</p>
        </div>
        <Link to="/payroll/generate" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Generate Payroll</span>
        </Link>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month/Year</th>
                <th>Basic Salary</th>
                <th>Total Earnings</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((payroll) => (
                <tr key={payroll._id}>
                  <td>{payroll.employee?.firstName} {payroll.employee?.lastName}</td>
                  <td>{payroll.month}/{payroll.year}</td>
                  <td>${payroll.basicSalary}</td>
                  <td>${payroll.totalEarnings}</td>
                  <td>${payroll.totalDeductions}</td>
                  <td className="font-bold">${payroll.netSalary}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(payroll.paymentStatus)}`}>
                      {payroll.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollList;
