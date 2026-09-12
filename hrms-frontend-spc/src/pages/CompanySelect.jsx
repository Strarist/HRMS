import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, ArrowLeft, Loader2 } from 'lucide-react';
import toast from '../utils/toast';
import axios from 'axios';
import { config } from '../config/api.config';

const CompanySelect = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company =>
        company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.companyCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies]);

  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies from:', `${config.apiBaseUrl}/auth/companies`);
      const response = await axios.get(`${config.apiBaseUrl}/auth/companies`);
      console.log('Companies response:', response.data);
      if (response.data.success) {
        setCompanies(response.data.data);
        setFilteredCompanies(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load companies');
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company) => {
    // Store selected company in localStorage
    const companyData = {
      id: company.companyId || company._id,
      name: company.companyName,
      code: company.companyCode,
      databaseName: company.tenantDatabaseName || company.databaseName
    };
    
    localStorage.setItem('selectedCompany', JSON.stringify(companyData));
    
    // Navigate to company-specific login page with company code in URL
    const companySlug = company.companyName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/login/${companySlug}`, { state: { company: companyData } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo2.png" 
              alt="Company Logo" 
              className="h-16 w-auto rounded-2xl shadow-md border-2 border-white/10" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Select Your Company</h1>
          <p className="text-gray-400">Choose your organization to continue</p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to login options
        </button>

        {/* Search Bar */}
        <div className="card mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by company name or code..."
            />
          </div>
        </div>

        {/* Companies List */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={40} className="text-primary-500 animate-spin" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No companies found matching your search' : 'No companies available'}
              </p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <div className="grid gap-3">
                {filteredCompanies.map((company) => (
                  <button
                    key={company._id}
                    onClick={() => handleCompanySelect(company)}
                    className="flex items-center p-4 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-primary-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors mr-4">
                      <Building2 size={24} className="text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{company.companyName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Code: {company.companyCode}</span>
                        {company.subscription?.plan && (
                          <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 text-xs">
                            {company.subscription.plan}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          company.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {company.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Can't find your company? Contact your system administrator
        </p>
      </div>
    </div>
  );
};

export default CompanySelect;
