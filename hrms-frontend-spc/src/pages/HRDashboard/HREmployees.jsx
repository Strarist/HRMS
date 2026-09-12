import React from 'react';
import EmployeeList from '../Employee/EmployeeList';

const HREmployees = () => {
  // HR Employee Management uses the same EmployeeList component
  // This provides consistent employee management experience
  return <EmployeeList />;
};

export default HREmployees;
