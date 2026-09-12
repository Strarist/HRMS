import React from 'react';
import { Download } from 'lucide-react';

const PayrollSlips = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Salary Slips</h1>
        <p className="text-gray-400 mt-1">Download your salary slips</p>
      </div>

      <div className="card">
        <p className="text-gray-400">Salary slips will be available here for download</p>
      </div>
    </div>
  );
};

export default PayrollSlips;
