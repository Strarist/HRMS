/**
 * Contract Create Page
 * Form to create a new employee contract
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { createContract } from '../../api/contracts';
import { getEmployees } from '../../api/employees';

const ContractCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    contractType: 'fixed-deliverable',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    
    // Fixed Deliverable fields
    deliverables: [],
    totalAmount: '',
    
    // Rate-Based fields
    rateAmount: '',
    ratePeriod: 'monthly',
    
    // Hourly-Based fields
    hourlyRate: '',
    estimatedHours: '',
    maxHoursPerWeek: '',
    
    // Common fields
    paymentTerms: '',
    invoiceCycle: 'monthly',
    isRenewable: false,
    autoRenew: false,
    renewalTerms: '',
    renewalReminderDays: 30
  });

  const [currentDeliverable, setCurrentDeliverable] = useState({
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await getEmployees({ limit: 1000 });
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddDeliverable = () => {
    if (!currentDeliverable.description || !currentDeliverable.dueDate) {
      toast.error('Please fill in all deliverable fields');
      return;
    }

    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, { ...currentDeliverable, status: 'pending' }]
    }));

    setCurrentDeliverable({ description: '', dueDate: '' });
  };

  const handleRemoveDeliverable = (index) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    
    // Type-specific validation
    if (formData.contractType === 'fixed-deliverable' && formData.deliverables.length === 0) {
      toast.error('Please add at least one deliverable');
      return;
    }
    
    if (formData.contractType === 'rate-based' && !formData.rateAmount) {
      toast.error('Please enter the rate amount');
      return;
    }
    
    if (formData.contractType === 'hourly-based' && (!formData.hourlyRate || !formData.estimatedHours)) {
      toast.error('Please enter hourly rate and estimated hours');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare contract data
      const contractData = {
        employeeId: formData.employeeId,
        contractType: formData.contractType,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        paymentTerms: formData.paymentTerms,
        invoiceCycle: formData.invoiceCycle,
        isRenewable: formData.isRenewable,
        autoRenew: formData.autoRenew,
        renewalTerms: formData.renewalTerms,
        renewalReminderDays: parseInt(formData.renewalReminderDays)
      };
      
      // Add type-specific fields
      if (formData.contractType === 'fixed-deliverable') {
        contractData.deliverables = formData.deliverables;
        contractData.totalAmount = parseFloat(formData.totalAmount);
      } else if (formData.contractType === 'rate-based') {
        contractData.rateAmount = parseFloat(formData.rateAmount);
        contractData.ratePeriod = formData.ratePeriod;
      } else if (formData.contractType === 'hourly-based') {
        contractData.hourlyRate = parseFloat(formData.hourlyRate);
        contractData.estimatedHours = parseFloat(formData.estimatedHours);
        contractData.maxHoursPerWeek = formData.maxHoursPerWeek ? parseFloat(formData.maxHoursPerWeek) : undefined;
      }
      
      const response = await createContract(contractData);
      
      toast.success('Contract created successfully');
      navigate(`/contracts/${response.data._id}`);
      
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error(error.response?.data?.message || 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/contracts')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Contract</h1>
          <p className="text-gray-400 mt-1">Fill in the details to create an employee contract</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Selection */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Employee *</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                disabled={loadingEmployees}
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Contract Type */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Contract Type *</label>
              <select
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                required
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fixed-deliverable">Fixed Deliverable</option>
                <option value="rate-based">Rate Based</option>
                <option value="hourly-based">Hourly Based</option>
              </select>
            </div>

            {/* Contract Title */}
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-2">Contract Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Software Development Contract"
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the contract"
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Contract Type Specific Fields */}
        {formData.contractType === 'fixed-deliverable' && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Deliverables</h2>
            
            {/* Total Amount */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Total Contract Amount *</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                required
                placeholder="Enter amount"
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Add Deliverable */}
            <div className="border border-dark-600 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-medium">Add Deliverable</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={currentDeliverable.description}
                  onChange={(e) => setCurrentDeliverable(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deliverable description"
                  className="bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={currentDeliverable.dueDate}
                    onChange={(e) => setCurrentDeliverable(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="flex-1 bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Deliverables List */}
            {formData.deliverables.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white font-medium">Deliverables List</h3>
                {formData.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center justify-between bg-dark-700 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white">{deliverable.description}</p>
                      <p className="text-gray-400 text-sm">Due: {new Date(deliverable.dueDate).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {formData.contractType === 'rate-based' && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Rate Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Rate Amount *</label>
                <input
                  type="number"
                  name="rateAmount"
                  value={formData.rateAmount}
                  onChange={handleChange}
                  required
                  placeholder="Enter rate amount"
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Rate Period *</label>
                <select
                  name="ratePeriod"
                  value={formData.ratePeriod}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="milestone-based">Milestone Based</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {formData.contractType === 'hourly-based' && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Hourly Rate Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Hourly Rate *</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                  placeholder="Rate per hour"
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Estimated Hours *</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  required
                  placeholder="Total estimated hours"
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Max Hours/Week</label>
                <input
                  type="number"
                  name="maxHoursPerWeek"
                  value={formData.maxHoursPerWeek}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Terms */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Payment Terms</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Invoice Cycle</label>
              <select
                name="invoiceCycle"
                value={formData.invoiceCycle}
                onChange={handleChange}
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="on-completion">On Completion</option>
                <option value="milestone-based">Milestone Based</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-2">Payment Terms</label>
              <textarea
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                rows={3}
                placeholder="Describe payment terms and conditions"
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Renewal Settings */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Renewal Settings</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isRenewable"
                checked={formData.isRenewable}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <span className="text-white">This contract is renewable</span>
            </label>

            {formData.isRenewable && (
              <>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoRenew"
                    checked={formData.autoRenew}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-white">Enable automatic renewal</span>
                </label>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Renewal Reminder (Days before expiry)</label>
                  <input
                    type="number"
                    name="renewalReminderDays"
                    value={formData.renewalReminderDays}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Renewal Terms</label>
                  <textarea
                    name="renewalTerms"
                    value={formData.renewalTerms}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe renewal terms and conditions"
                    className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/contracts')}
            className="px-6 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Contract'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractCreate;
