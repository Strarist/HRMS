import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Users } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const FamilyDetails = () => {
  const [familyDetails, setFamilyDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [formData, setFormData] = useState({
    relationship: '',
    name: '',
    dateOfBirth: '',
    gender: '',
    aadhaarNumber: '',
    panNumber: '',
    isNominee: false,
    nomineeFor: [],
    nomineePercentage: 100,
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  useEffect(() => {
    fetchFamilyDetails();
  }, []);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/profile/family');
      setFamilyDetails(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch family details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name === 'isNominee') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'nomineeFor') {
      const options = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: options }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentFamily) {
        await api.put(`/employee/profile/family/${currentFamily._id}`, formData);
        toast.success('Family detail updated successfully');
      } else {
        await api.post('/employee/profile/family', formData);
        toast.success('Family detail added successfully');
      }
      setIsModalOpen(false);
      setCurrentFamily(null);
      setFormData({
        relationship: '',
        name: '',
        dateOfBirth: '',
        gender: '',
        aadhaarNumber: '',
        panNumber: '',
        isNominee: false,
        nomineeFor: [],
        nomineePercentage: 100,
        contactNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      });
      fetchFamilyDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save family detail');
    }
  };

  const handleEdit = (family) => {
    setCurrentFamily(family);
    setFormData({
      relationship: family.relationship || '',
      name: family.name || '',
      dateOfBirth: family.dateOfBirth ? new Date(family.dateOfBirth).toISOString().split('T')[0] : '',
      gender: family.gender || '',
      aadhaarNumber: family.aadhaarNumber || '',
      panNumber: family.panNumber || '',
      isNominee: family.isNominee || false,
      nomineeFor: family.nomineeFor || [],
      nomineePercentage: family.nomineePercentage || 100,
      contactNumber: family.contactNumber || '',
      address: family.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this family detail?')) return;
    try {
      await api.delete(`/employee/profile/family/${id}`);
      toast.success('Family detail deleted successfully');
      fetchFamilyDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete family detail');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Users size={20} /> Family Details
        </h2>
        <button
          onClick={() => {
            setCurrentFamily(null);
            setFormData({
              relationship: '',
              name: '',
              dateOfBirth: '',
              gender: '',
              aadhaarNumber: '',
              panNumber: '',
              isNominee: false,
              nomineeFor: [],
              nomineePercentage: 100,
              contactNumber: '',
              address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'India'
              }
            });
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} /> Add Family Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyDetails.map((family) => (
          <div key={family._id} className="bg-dark-700 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{family.name}</h3>
                <p className="text-gray-400 text-sm capitalize">{family.relationship}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(family)} className="text-primary-400 hover:text-primary-300">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(family._id)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {family.isNominee && (
              <div className="mt-2 p-2 bg-primary-900/20 rounded">
                <p className="text-primary-400 text-sm">Nominee for: {family.nomineeFor.join(', ')}</p>
                <p className="text-primary-400 text-sm">Percentage: {family.nomineePercentage}%</p>
              </div>
            )}
            {family.dateOfBirth && (
              <p className="text-gray-400 text-sm mt-2">
                DOB: {new Date(family.dateOfBirth).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-700 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {currentFamily ? 'Edit Family Member' : 'Add Family Member'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Relationship *</label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  >
                    <option value="">Select</option>
                    <option value="spouse">Spouse</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="father_in_law">Father-in-law</option>
                    <option value="mother_in_law">Mother-in-law</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isNominee"
                    checked={formData.isNominee}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Is Nominee</label>
                </div>

                {formData.isNominee && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nominee For</label>
                      <select
                        name="nomineeFor"
                        multiple
                        value={formData.nomineeFor}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                      >
                        <option value="PF">PF</option>
                        <option value="ESI">ESI</option>
                        <option value="Gratuity">Gratuity</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Pension">Pension</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nominee Percentage</label>
                      <input
                        type="number"
                        name="nomineePercentage"
                        value={formData.nomineePercentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Street</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Zip Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={20} /> {currentFamily ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyDetails;

