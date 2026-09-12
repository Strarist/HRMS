import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, Building2, Search, Filter, X, Upload } from 'lucide-react';
import axios from 'axios';
import toast from '../../utils/toast';
import JobApplicationModal from '../../components/JobApplicationModal';
import ResumeSubmissionModal from '../../components/ResumeSubmissionModal';
import { config } from '../../config/api.config';

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [stats, setStats] = useState(null);

  // Get API base URL from centralized config
  const API_BASE_URL = config.apiBaseUrl;
  const PUBLIC_COMPANY_ID = import.meta.env.VITE_PUBLIC_COMPANY_ID;

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedDepartment, selectedLocation, selectedType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      if (!PUBLIC_COMPANY_ID) {
        toast.error('Careers page is not configured (missing VITE_PUBLIC_COMPANY_ID)');
        setJobs([]);
        return;
      }
      // Add cache-busting and companyId
      const response = await axios.get(`${API_BASE_URL}/public/jobs`, {
        params: { 
          companyId: PUBLIC_COMPANY_ID,
          _t: Date.now() 
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('📋 Public Jobs API Response:', response.data);
      console.log('📊 Jobs Data:', response.data.data);
      console.log('📈 Jobs Count:', response.data.data?.length);
      
      if (response.data.success && response.data.data) {
        setJobs(response.data.data);
        setFilteredJobs(response.data.data);
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        setJobs([]);
        setFilteredJobs([]);
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load job postings');
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (!PUBLIC_COMPANY_ID) return;
      const response = await axios.get(`${API_BASE_URL}/public/jobs/stats`, {
        params: { companyId: PUBLIC_COMPANY_ID }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(job => job.department?._id === selectedDepartment);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    // Employment type filter
    if (selectedType) {
      filtered = filtered.filter(job => job.employmentType === selectedType);
    }

    setFilteredJobs(filtered);
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      if (!PUBLIC_COMPANY_ID) {
        toast.error('Careers page is not configured (missing VITE_PUBLIC_COMPANY_ID)');
        return;
      }
      const response = await axios.post(
        `${API_BASE_URL}/public/jobs/${selectedJob._id}/apply`,
        applicationData,
        {
          params: { companyId: PUBLIC_COMPANY_ID },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      toast.success(response.data.message);
      setShowApplicationModal(false);
      setSelectedJob(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      toast.error(errorMessage);
      throw error;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedLocation('');
    setSelectedType('');
  };

  // Get unique values for filters
  const departments = [...new Set(jobs.map(job => job.department).filter(Boolean))];
  const locations = [...new Set(jobs.map(job => job.location).filter(Boolean))];
  const employmentTypes = [...new Set(jobs.map(job => job.employmentType).filter(Boolean))];

  const hasActiveFilters = searchTerm || selectedDepartment || selectedLocation || selectedType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-900 to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Discover exciting career opportunities and grow with us
            </p>
            {stats && (
              <div className="flex justify-center space-x-8 text-center">
                <div>
                  <div className="text-3xl font-bold">{stats.totalJobs}</div>
                  <div className="text-primary-200">Open Positions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.byDepartment?.length || 0}</div>
                  <div className="text-primary-200">Departments</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.byLocation?.length || 0}</div>
                  <div className="text-primary-200">Locations</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-dark-800 rounded-lg shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 text-sm"
              >
                <X size={16} />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Jobs Found</h3>
            <p className="text-gray-400">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'No job openings available at the moment. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-dark-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-700 hover:border-primary-500"
              >
                <div className="p-6">
                  {/* Job Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <Building2 size={16} />
                      <span>{job.department?.name || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-300 text-sm">
                      <MapPin size={16} className="text-primary-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 text-sm">
                      <Clock size={16} className="text-primary-400" />
                      <span className="capitalize">
                        {job.employmentType.split('-').join(' ')}
                      </span>
                    </div>
                    {job.experience && (
                      <div className="flex items-center space-x-2 text-gray-300 text-sm">
                        <Briefcase size={16} className="text-primary-400" />
                        <span>
                          {job.experience.min}-{job.experience.max} years
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Openings */}
                  {job.openings > 1 && (
                    <div className="mb-4">
                      <span className="inline-block bg-primary-900/30 text-primary-400 text-xs px-3 py-1 rounded-full">
                        {job.openings} Openings
                      </span>
                    </div>
                  )}

                  {/* Apply Button */}
                  <button
                    onClick={() => handleApplyClick(job)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Resume Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 text-center">
          <Upload size={48} className="mx-auto text-white mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Didn't Find a Suitable Job?
          </h2>
          <p className="text-primary-100 mb-6">
            Submit your resume and we'll contact you when a matching opportunity becomes available
          </p>
          <button
            onClick={() => setShowResumeModal(true)}
            className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Submit Your Resume
          </button>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          onSubmit={handleApplicationSubmit}
        />
      )}

      {/* Resume Submission Modal */}
      <ResumeSubmissionModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
      />
    </div>
  );
};

export default CareersPage;
