import React, { useState } from 'react';
import BottomNavigation from '../../components/BottomNavigation';
import { Download, FileText, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const ModernPayslips = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const payslips = [
    {
      month: 'November 2024',
      salary: '₹75,000',
      netPay: '₹68,500',
      date: 'Nov 30, 2024',
      status: 'paid'
    },
    {
      month: 'October 2024',
      salary: '₹75,000',
      netPay: '₹68,500',
      date: 'Oct 31, 2024',
      status: 'paid'
    },
    {
      month: 'September 2024',
      salary: '₹75,000',
      netPay: '₹68,500',
      date: 'Sep 30, 2024',
      status: 'paid'
    }
  ];

  const salaryBreakdown = {
    basic: '₹45,000',
    hra: '₹18,000',
    allowances: '₹12,000',
    gross: '₹75,000',
    deductions: '₹6,500',
    netPay: '₹68,500'
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Payslips</h1>
            <p className="text-gray-400 mt-1">View and download your salary slips</p>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-[#2A2A3A] text-white px-4 py-2 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
        </div>

        {/* Salary Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Gross Salary</p>
              <DollarSign className="w-5 h-5 text-[#A88BFF]" />
            </div>
            <h3 className="text-2xl font-bold text-white">{salaryBreakdown.gross}</h3>
            <p className="text-green-400 text-sm mt-1">Per month</p>
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Deductions</p>
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{salaryBreakdown.deductions}</h3>
            <p className="text-gray-400 text-sm mt-1">Tax + PF</p>
          </div>

          <div className="bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm">Net Pay</p>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">{salaryBreakdown.netPay}</h3>
            <p className="text-white/80 text-sm mt-1">Take home</p>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4">Salary Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#1E1E2A] rounded-xl">
                <span className="text-gray-400">Basic Salary</span>
                <span className="text-white font-medium">{salaryBreakdown.basic}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1E1E2A] rounded-xl">
                <span className="text-gray-400">HRA</span>
                <span className="text-white font-medium">{salaryBreakdown.hra}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1E1E2A] rounded-xl">
                <span className="text-gray-400">Allowances</span>
                <span className="text-white font-medium">{salaryBreakdown.allowances}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#1E1E2A] rounded-xl">
                <span className="text-gray-400">Gross Salary</span>
                <span className="text-green-400 font-medium">{salaryBreakdown.gross}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1E1E2A] rounded-xl">
                <span className="text-gray-400">Deductions</span>
                <span className="text-red-400 font-medium">-{salaryBreakdown.deductions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#A88BFF]/20 to-[#8B6FE8]/20 rounded-xl border border-[#A88BFF]/30">
                <span className="text-white font-medium">Net Pay</span>
                <span className="text-[#A88BFF] font-bold">{salaryBreakdown.netPay}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payslip History */}
        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4">Payslip History</h3>
          <div className="space-y-3">
            {payslips.map((slip, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#1E1E2A] rounded-xl hover:border hover:border-[#A88BFF] transition-all cursor-pointer gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{slip.month}</h4>
                    <p className="text-gray-400 text-sm">{slip.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:space-x-6">
                  <div className="text-left md:text-right">
                    <p className="text-gray-400 text-sm">Net Pay</p>
                    <p className="text-white font-semibold">{slip.netPay}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      {slip.status.toUpperCase()}
                    </span>
                    <button className="p-2 rounded-xl bg-[#2A2A3A] hover:bg-[#A88BFF] transition-colors">
                      <Download className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModernPayslips;
