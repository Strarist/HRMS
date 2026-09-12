import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  User,
  FileText,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  UserPlus,
  Sparkles,
  TrendingUp,
  Brain,
  BarChart3,
  Loader,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../api/axios';
import toast from '../utils/toast';
import AIInsights from '../components/AIInsights';

const ViewApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStats, setAnalysisStats] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState({});

  useEffect(() => {
    fetchApplicants();
    fetchAnalysisStats();
  }, [jobId, filterStage, filterStatus]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStage !== 'all') params.append('stage', filterStage);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/jobs/${jobId}/applicants?${params.toString()}`);
      let applicantsData = response.data.data;
      
      // Sort applicants based on selected sort option
      applicantsData = sortApplicants(applicantsData, sortBy);
      
      setApplicants(applicantsData);
      setJobDetails(response.data.job);
    } catch (error) {
      toast.error('Failed to load applicants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisStats = async () => {
    try {
      const response = await api.get(`/ai-analysis/jobs/${jobId}/stats`);
      setAnalysisStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analysis stats:', error);
    }
  };

  const sortApplicants = (data, sortOption) => {
    const sorted = [...data];
    switch (sortOption) {
      case 'ai-score':
        return sorted.sort((a, b) => {
          const scoreA = a.aiAnalysis?.matchScore || 0;
          const scoreB = b.aiAnalysis?.matchScore || 0;
          return scoreB - scoreA;
        });
      case 'date':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'name':
        return sorted.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
      default:
        return sorted;
    }
  };

  const handleAnalyzeCandidates = async () => {
    if (!window.confirm('Analyze all candidates for this job? This may take a few moments.')) {
      return;
    }

    try {
      setAnalyzing(true);
      const response = await api.post(`/ai-analysis/jobs/${jobId}/analyze`);
      toast.success(response.data.message);
      
      // Refresh applicants and stats
      await fetchApplicants();
      await fetchAnalysisStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze candidates');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleAIInsights = (candidateId) => {
    setShowAIInsights(prev => ({
      ...prev,
      [candidateId]: !prev[candidateId]
    }));
  };

  const handleSearch = () => {
    fetchApplicants();
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setApplicants(prev => sortApplicants(prev, newSort));
  };

  const getStageColor = (stage) => {
    const colors = {
      'applied': 'bg-blue-500/20 text-blue-400',
      'screening': 'bg-yellow-500/20 text-yellow-400',
      'shortlisted': 'bg-purple-500/20 text-purple-400',
      'interview-scheduled': 'bg-indigo-500/20 text-indigo-400',
      'interview-completed': 'bg-cyan-500/20 text-cyan-400',
      'offer-extended': 'bg-green-500/20 text-green-400',
      'offer-accepted': 'bg-emerald-500/20 text-emerald-400',
      'offer-rejected': 'bg-red-500/20 text-red-400',
      'sent-to-onboarding': 'bg-orange-500/20 text-orange-400',
      'joined': 'bg-teal-500/20 text-teal-400',
      'rejected': 'bg-gray-500/20 text-gray-400'
    };
    return colors[stage] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'badge-success',
      'hired': 'badge-info',
      'rejected': 'badge-danger',
      'withdrawn': 'badge-warning'
    };
    return badges[status] || 'badge-default';
  };

  const formatExperience = (experience) => {
    if (!experience) return 'N/A';
    const { years = 0, months = 0 } = experience;
    if (years === 0 && months === 0) return 'Fresher';
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} years`;
    return `${years}y ${months}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewCandidate = (candidateId) => {
    if (location.pathname.includes('/hr/recruitment')) {
      navigate(`/employee/hr/recruitment/candidates/${candidateId}/timeline`);
    } else {
      navigate(`/candidates/${candidateId}/timeline`);
    }
  };

  const handleMoveToOnboarding = async (applicant, e) => {
    e.stopPropagation();

    if (!window.confirm(`Send ${applicant.firstName} ${applicant.lastName} to comprehensive onboarding process?`)) {
      return;
    }

    try {
      // First, move candidate to offer-accepted stage if they're not already in a valid stage
      const validStages = ['offer-accepted', 'interview-completed', 'offer-extended', 'shortlisted'];
      if (!validStages.includes(applicant.stage)) {
        console.log(`Moving candidate from ${applicant.stage} to offer-accepted stage first`);
        await api.post(`/candidates/${applicant._id}/move-to-stage`, {
          targetStage: 'offer-accepted',
          skipIntermediate: true,
          reason: 'Auto-stage change for onboarding process'
        });
      }

      // Now send to onboarding
      const response = await api.post(`/candidates/${applicant._id}/send-to-onboarding`, {
        notes: `Candidate sent to onboarding from job application review`
      });

      toast.success('Candidate successfully sent to onboarding!');

      // Show additional success info
      const onboardingData = response.data.data.onboarding;
      toast.success(`Onboarding record created: ${onboardingData.onboardingId}`, {
        duration: 4000
      });

      // Refresh the applicants list to show updated status
      fetchApplicants();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send candidate to onboarding';
      toast.error(errorMessage);
      console.error('Onboarding error:', error.response?.data);
    }
  };

  const canMoveToOnboarding = (applicant) => {
    // Allow onboarding for all active candidates who haven't been sent to onboarding yet
    const notAlreadySentToOnboarding = applicant.stage !== 'sent-to-onboarding' && applicant.stage !== 'joined';
    const isActive = applicant.status === 'active';

    return notAlreadySentToOnboarding && isActive;
  };

  const isInOnboardingProcess = (applicant) => {
    // Check if candidate is already in onboarding stages (BLOCKED)
    const onboardingStages = ['sent-to-onboarding', 'joined', 'completed'];
    return onboardingStages.includes(applicant.stage);
  };

  const canPerformHiringActions = (applicant) => {
    // Block all hiring actions for candidates in onboarding
    return !isInOnboardingProcess(applicant) && applicant.status === 'active';
  };

  const handleExportApplicants = () => {
    try {
      // Prepare CSV data
      const headers = [
        'Candidate Code',
        'Name',
        'Email',
        'Phone',
        'Current Location',
        'Experience',
        'Current Company',
        'Current Designation',
        'Expected CTC',
        'Notice Period',
        'Stage',
        'Status',
        'Applied On',
        'Skills'
      ];

      const csvRows = [headers.join(',')];

      applicants.forEach(applicant => {
        const row = [
          applicant.candidateCode || '',
          `"${applicant.firstName} ${applicant.lastName}"`,
          applicant.email || '',
          applicant.phone || '',
          `"${applicant.currentLocation || ''}"`,
          formatExperience(applicant.experience),
          `"${applicant.currentCompany || ''}"`,
          `"${applicant.currentDesignation || ''}"`,
          applicant.expectedCTC || '',
          applicant.noticePeriod !== undefined ? applicant.noticePeriod : '',
          applicant.stage || '',
          applicant.status || '',
          formatDate(applicant.createdAt),
          `"${applicant.skills ? applicant.skills.join(', ') : ''}"`
        ];
        csvRows.push(row.join(','));
      });

      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `applicants_${jobDetails?.title || 'job'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Applicants exported successfully!');
    } catch (error) {
      toast.error('Failed to export applicants');
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={location.pathname.includes('/hr/recruitment')
          ? "w-12 h-12 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin"
          : "w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: location.pathname.includes('/hr/recruitment') ? '#1E1E2A' : undefined }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (location.pathname.includes('/hr/recruitment')) {
                navigate('/employee/hr/recruitment');
              } else {
                navigate('/job-desk');
              }
            }}
            className={location.pathname.includes('/hr/recruitment')
              ? "bg-[#2A2A3A] text-white p-2 rounded-xl border border-gray-700 hover:border-[#A88BFF] transition-all"
              : "btn-outline p-2"}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {jobDetails?.title || 'Job'} - Applicants
            </h1>
            <p className="text-gray-400 mt-1">
              {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'} found
              {analysisStats && analysisStats.analyzed > 0 && (
                <span className={location.pathname.includes('/hr/recruitment')
                  ? "ml-2 text-[#A88BFF]"
                  : "ml-2 text-primary-500"}>
                  • {analysisStats.analyzed} analyzed
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAnalyzeCandidates}
            disabled={analyzing}
            className={location.pathname.includes('/hr/recruitment')
              ? "bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
              : "btn-primary flex items-center space-x-2"}
          >
            {analyzing ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze Candidates</span>
              </>
            )}
          </button>
          <button
            onClick={handleExportApplicants}
            className={location.pathname.includes('/hr/recruitment')
              ? "bg-[#2A2A3A] text-white px-6 py-2.5 rounded-xl border border-gray-700 hover:border-[#A88BFF] transition-all flex items-center space-x-2 disabled:opacity-50"
              : "btn-outline flex items-center space-x-2"}
            disabled={applicants.length === 0}
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Stats */}
      {analysisStats && analysisStats.analyzed > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-primary-600/20 to-primary-800/20 border-primary-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white mt-1">{analysisStats.averageScore}%</p>
              </div>
              <BarChart3 size={32} className="text-primary-500" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Excellent Fit</p>
                <p className="text-2xl font-bold text-white mt-1">{analysisStats.fitDistribution.excellent}</p>
              </div>
              <TrendingUp size={32} className="text-green-500" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Good Fit</p>
                <p className="text-2xl font-bold text-white mt-1">{analysisStats.fitDistribution.good}</p>
              </div>
              <Brain size={32} className="text-blue-500" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Top Score</p>
                <p className="text-2xl font-bold text-white mt-1">{analysisStats.topScore}%</p>
              </div>
              <Sparkles size={32} className="text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={location.pathname.includes('/hr/recruitment')
        ? "bg-[#2A2A3A] rounded-2xl p-6 border border-gray-800"
        : "card"}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or candidate code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={location.pathname.includes('/hr/recruitment')
                ? "w-full bg-[#1E1E2A] text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none transition-colors"
                : "input-field pl-10"}
            />
          </div>
          <button
            onClick={handleSearch}
            className={location.pathname.includes('/hr/recruitment')
              ? "bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all md:w-auto"
              : "btn-primary md:w-auto"}
          >
            Search
          </button>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className={location.pathname.includes('/hr/recruitment')
              ? "bg-[#1E1E2A] text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none transition-colors md:w-48"
              : "input-field md:w-48"}
          >
            <option value="date">Sort by Date</option>
            <option value="ai-score">Sort by AI Score</option>
            <option value="name">Sort by Name</option>
          </select>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className={location.pathname.includes('/hr/recruitment')
              ? "bg-[#1E1E2A] text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none transition-colors md:w-48"
              : "input-field md:w-48"}
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview-scheduled">Interview Scheduled</option>
            <option value="interview-completed">Interview Completed</option>
            <option value="offer-extended">Offer Extended</option>
            <option value="offer-accepted">Offer Accepted</option>
            <option value="offer-rejected">Offer Rejected</option>
            <option value="joined">Joined</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={location.pathname.includes('/hr/recruitment')
              ? "bg-[#1E1E2A] text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none transition-colors md:w-48"
              : "input-field md:w-48"}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <div className={location.pathname.includes('/hr/recruitment')
          ? "bg-[#2A2A3A] rounded-2xl p-12 border border-gray-800 text-center"
          : "card text-center py-12"}>
          <User size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No applicants found for this job posting</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <div
              key={applicant._id}
              className={`relative ${location.pathname.includes('/hr/recruitment')
                ? "bg-[#2A2A3A] rounded-2xl p-6 border border-gray-800 hover:border-[#A88BFF] transition-all cursor-pointer"
                : "card hover:border-primary-600 transition-all cursor-pointer"} ${isInOnboardingProcess(applicant) ? 'opacity-75' : ''}`}
              onClick={() => handleViewCandidate(applicant._id)}
            >
              {/* BLOCKED OVERLAY for candidates in onboarding */}
              {isInOnboardingProcess(applicant) && (
                <div className="absolute inset-0 bg-red-600/10 border-2 border-red-600/30 rounded-2xl flex items-center justify-center z-10">
                  <div className="bg-red-600/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium">
                    <XCircle size={16} />
                    <span>Hiring Process Blocked - In Onboarding</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Section - Basic Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className={location.pathname.includes('/hr/recruitment')
                    ? "w-12 h-12 bg-gradient-to-br from-[#A88BFF]/20 to-[#8B6FE8]/20 rounded-full flex items-center justify-center flex-shrink-0"
                    : "w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0"}>
                    <User size={24} className={location.pathname.includes('/hr/recruitment') ? "text-[#A88BFF]" : "text-primary-500"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <span className={`badge ${getStatusBadge(applicant.status)}`}>
                        {applicant.status}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStageColor(applicant.stage)} ${
                        isInOnboardingProcess(applicant) ? 'bg-red-600/20 text-red-400 border border-red-600/30' : ''
                      }`}>
                        {applicant.stage.replace(/-/g, ' ')}
                        {isInOnboardingProcess(applicant) && ' 🔒'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-400">
                        <Mail size={14} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{applicant.email}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Phone size={14} className="mr-2 flex-shrink-0" />
                        <span>{applicant.phone}</span>
                      </div>
                      {applicant.currentLocation && (
                        <div className="flex items-center text-gray-400">
                          <MapPin size={14} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{applicant.currentLocation}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-400">
                        <Briefcase size={14} className="mr-2 flex-shrink-0" />
                        <span>{formatExperience(applicant.experience)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Section - Additional Details */}
                <div className="flex flex-wrap gap-4 lg:gap-6 text-sm">
                  {applicant.currentCompany && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Current Company</p>
                      <p className="text-white font-medium">{applicant.currentCompany}</p>
                    </div>
                  )}
                  {applicant.currentDesignation && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Current Role</p>
                      <p className="text-white font-medium">{applicant.currentDesignation}</p>
                    </div>
                  )}
                  {applicant.expectedCTC && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Expected CTC</p>
                      <p className="text-white font-medium flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        {applicant.expectedCTC.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {applicant.noticePeriod !== undefined && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Notice Period</p>
                      <p className="text-white font-medium flex items-center">
                        <Clock size={14} className="mr-1" />
                        {applicant.noticePeriod} days
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs mb-1">Applied On</p>
                    <p className="text-white text-sm font-medium flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(applicant.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {applicant.resume?.url && (
                      <a
                        href={applicant.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={location.pathname.includes('/hr/recruitment')
                          ? "bg-[#1E1E2A] text-white text-sm py-2 px-4 rounded-xl border border-gray-700 hover:border-[#A88BFF] transition-all flex items-center space-x-2"
                          : "btn-outline text-sm py-2 px-4 flex items-center space-x-2"}
                      >
                        <FileText size={16} />
                        <span>Resume</span>
                      </a>
                    )}
                    {isInOnboardingProcess(applicant) ? (
                      // BLOCKED: Candidate is in onboarding - show blocked status
                      <div className={location.pathname.includes('/hr/recruitment')
                        ? "bg-red-600/20 border border-red-600/50 text-red-400 text-sm py-2 px-4 rounded-xl flex items-center space-x-2 whitespace-nowrap"
                        : "bg-red-600/20 border border-red-600/50 text-red-400 text-sm py-2 px-4 rounded-lg flex items-center space-x-2 whitespace-nowrap"}>
                        <XCircle size={16} />
                        <span>Blocked - In Onboarding</span>
                      </div>
                    ) : canMoveToOnboarding(applicant) ? (
                      <button
                        onClick={(e) => handleMoveToOnboarding(applicant, e)}
                        className={location.pathname.includes('/hr/recruitment')
                          ? "bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white text-sm py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all flex items-center space-x-2 whitespace-nowrap"
                          : "btn-primary text-sm py-2 px-4 flex items-center space-x-2 whitespace-nowrap"}
                        title={`Send ${applicant.firstName} ${applicant.lastName} to comprehensive onboarding process`}
                      >
                        <UserPlus size={16} />
                        <span>Onboarding</span>
                      </button>
                    ) : (
                      // No action available for this candidate
                      <span className={location.pathname.includes('/hr/recruitment')
                        ? "text-gray-500 text-sm py-2 px-4 flex items-center space-x-2 whitespace-nowrap"
                        : "text-gray-500 text-sm py-2 px-4 flex items-center space-x-2 whitespace-nowrap"}>
                        <Clock size={16} />
                        <span>Waiting</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              {applicant.skills && applicant.skills.length > 0 && (
                <div className={location.pathname.includes('/hr/recruitment')
                  ? "mt-4 pt-4 border-t border-gray-700"
                  : "mt-4 pt-4 border-t border-dark-800"}>
                  <p className="text-gray-500 text-xs mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {applicant.skills.slice(0, 8).map((skill, index) => (
                      <span
                        key={index}
                        className={location.pathname.includes('/hr/recruitment')
                          ? "px-2 py-1 bg-[#1E1E2A] text-gray-300 rounded-lg text-xs"
                          : "px-2 py-1 bg-dark-800 text-gray-300 rounded text-xs"}
                      >
                        {skill}
                      </span>
                    ))}
                    {applicant.skills.length > 8 && (
                      <span className={location.pathname.includes('/hr/recruitment')
                        ? "px-2 py-1 bg-[#1E1E2A] text-gray-400 rounded-lg text-xs"
                        : "px-2 py-1 bg-dark-800 text-gray-400 rounded text-xs"}>
                        +{applicant.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* AI Insights Section */}
              {applicant.aiAnalysis?.isAnalyzed && (
                <div>
                  <AIInsights analysis={applicant.aiAnalysis} compact={true} />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAIInsights(applicant._id);
                    }}
                    className={location.pathname.includes('/hr/recruitment')
                      ? "mt-3 text-sm text-[#A88BFF] hover:text-[#8B6FE8] flex items-center space-x-1"
                      : "mt-3 text-sm text-primary-500 hover:text-primary-400 flex items-center space-x-1"}
                  >
                    <Brain size={14} />
                    <span>{showAIInsights[applicant._id] ? 'Hide' : 'View'} Detailed AI Insights</span>
                  </button>

                  {showAIInsights[applicant._id] && (
                    <div className={location.pathname.includes('/hr/recruitment')
                      ? "mt-4 pt-4 border-t border-gray-700"
                      : "mt-4 pt-4 border-t border-dark-800"}>
                      <AIInsights analysis={applicant.aiAnalysis} compact={false} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewApplicants;
