import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getPayslipHistory } from '../../api/employeeDashboard';
import toast from '../../utils/toast';
import { DollarSign, Download, Eye, Calendar } from 'lucide-react';

const EmployeePayslips = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const response = await getPayslipHistory(12);
      setPayslips(response.data);
    } catch (error) {
      console.error('Error fetching payslips:', error);
      toast.error('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading payslips...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Payslips & Salary
        </h1>
        <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          View and download your salary slips
        </p>
      </div>

      {/* Latest Payslip Summary */}
      {payslips.length > 0 && (
        <div className={`rounded-xl p-6 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-primary-900 to-primary-800' 
            : 'bg-gradient-to-r from-primary-600 to-primary-700'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white">
            <div>
              <p className="text-primary-100 text-sm mb-1">Latest Month</p>
              <p className="text-2xl font-bold">
                {getMonthName(payslips[0].month)} {payslips[0].year}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Gross Salary</p>
              <p className="text-2xl font-bold">
                {formatCurrency(payslips[0].totalEarnings)}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Deductions</p>
              <p className="text-2xl font-bold">
                {formatCurrency(payslips[0].totalDeductions)}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Net Salary</p>
              <p className="text-3xl font-bold">
                {formatCurrency(payslips[0].netSalary)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payslip List */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Payslip History
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payslips.map((payslip, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                theme === 'dark'
                  ? 'bg-dark-700 border-dark-600 hover:border-primary-600'
                  : 'bg-gray-50 border-gray-200 hover:border-primary-600'
              }`}
              onClick={() => setSelectedPayslip(payslip)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getMonthName(payslip.month)} {payslip.year}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {payslip.paymentDate 
                      ? new Date(payslip.paymentDate).toLocaleDateString()
                      : 'Not paid yet'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(payslip.paymentStatus)}`}>
                  {payslip.paymentStatus}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Gross
                  </span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(payslip.totalEarnings)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Deductions
                  </span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(payslip.totalDeductions)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-dark-600">
                  <div className="flex justify-between">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Net Pay
                    </span>
                    <span className="font-bold text-primary-600 text-lg">
                      {formatCurrency(payslip.netSalary)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
        {payslips.length === 0 && (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No payslips available
          </p>
        )}
      </div>

      {/* Detailed Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-dark-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Payslip Details - {getMonthName(selectedPayslip.month)} {selectedPayslip.year}
                </h2>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-dark-700' : 'hover:bg-gray-100'
                  }`}
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Earnings */}
                <div>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Earnings
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Basic Salary
                      </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(selectedPayslip.basicSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        HRA
                      </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(selectedPayslip.allowances?.hra)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Transport Allowance
                      </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(selectedPayslip.allowances?.transport)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Medical Allowance
                      </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(selectedPayslip.allowances?.medical)}
                      </span>
                    </div>
                    {selectedPayslip.bonus > 0 && (
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Bonus
                        </span>
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {formatCurrency(selectedPayslip.bonus)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 dark:border-dark-600">
                      <div className="flex justify-between font-semibold">
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          Total Earnings
                        </span>
                        <span className="text-green-600">
                          {formatCurrency(selectedPayslip.totalEarnings)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Deductions
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Tax (TDS)
                      </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(selectedPayslip.deductions?.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Provident Fund
                      </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(selectedPayslip.deductions?.providentFund)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Insurance
                      </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(selectedPayslip.deductions?.insurance)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-dark-600">
                      <div className="flex justify-between font-semibold">
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          Total Deductions
                        </span>
                        <span className="text-red-600">
                          {formatCurrency(selectedPayslip.totalDeductions)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-primary-900' : 'bg-primary-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Net Salary
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(selectedPayslip.netSalary)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <Download className="w-4 h-4 inline mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedPayslip(null)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayslips;
