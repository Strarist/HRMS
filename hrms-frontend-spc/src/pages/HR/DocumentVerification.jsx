import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Download, Eye, AlertCircle, Search, Filter } from 'lucide-react';
import { 
  getCandidatesWithDocuments, 
  getCandidateDocuments, 
  verifyDocument, 
  unverifyDocument,
  bulkVerifyDocuments,
  downloadDocument,
  getVerificationStats,
  getDocumentViewUrl
} from '../../api/documentUpload';
import toast from '../../utils/toast';

const DocumentVerification = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, [filterStatus]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await getCandidatesWithDocuments(filterStatus);
      if (response.success) {
        setCandidates(response.data);
      }
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getVerificationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const fetchCandidateDocuments = async (onboardingId) => {
    try {
      const response = await getCandidateDocuments(onboardingId);
      if (response.success) {
        setSelectedCandidate(response.data.candidate);
        setDocuments(response.data.documents);
      }
    } catch (error) {
      toast.error('Failed to load documents');
    }
  };

  const handleVerify = async (documentId) => {
    try {
      const response = await verifyDocument(documentId, 'Document verified');
      if (response.success) {
        toast.success('Document verified successfully');
        fetchCandidateDocuments(selectedCandidate.onboardingId);
        fetchCandidates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to verify document');
    }
  };

  const handleUnverify = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await unverifyDocument(rejectingDoc._id, rejectionReason);
      if (response.success) {
        toast.success('Document rejected. Re-submission email sent to candidate.');
        setShowRejectModal(false);
        setRejectingDoc(null);
        setRejectionReason('');
        fetchCandidateDocuments(selectedCandidate.onboardingId);
        fetchCandidates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to reject document');
    }
  };

  const handleBulkVerify = async () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select documents to verify');
      return;
    }

    try {
      const response = await bulkVerifyDocuments(selectedDocs, 'Bulk verified');
      if (response.success) {
        toast.success(`${selectedDocs.length} documents verified successfully`);
        setSelectedDocs([]);
        fetchCandidateDocuments(selectedCandidate.onboardingId);
        fetchCandidates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to bulk verify documents');
    }
  };

  const handleView = async (doc) => {
  try {
    const response = await getDocumentViewUrl(doc._id);
    if (response.success) {
      // Open the view URL in a new tab
      window.open(response.data.viewUrl, '_blank');
    }
  } catch (error) {
    console.error('View error:', error);
    toast.error('Failed to view document');
  }
};

const handleDownload = async (doc) => {
    try {
      // Always use secure download API so it works in all environments
      const blob = await downloadDocument(doc._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFileName || doc.documentName || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Document downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.candidateId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'bg-green-100 text-green-800',
      unverified: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resubmitted: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Verification</h1>
          <p className="text-gray-400 mt-1">Review and verify candidate documents</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Documents</p>
                <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Review</p>
                <h3 className="text-2xl font-bold text-yellow-500">{stats.pending}</h3>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Verified</p>
                <h3 className="text-2xl font-bold text-green-500">{stats.verified}</h3>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rejected</p>
                <h3 className="text-2xl font-bold text-red-500">{stats.unverified}</h3>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">Candidates</h3>
              
              <div className="space-y-4">
                {/* Search Bar */}
                <div>
                  <label htmlFor="candidate-search" className="block text-sm font-medium text-gray-300 mb-2">
                    <Search className="inline w-4 h-4 mr-1 mb-0.5" />
                    Search Candidates
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                    <input
                      id="candidate-search"
                      type="text"
                      placeholder="Search by name, email, or candidate ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-12 w-full bg-dark-800/50 border border-dark-600/60 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-dark-800 transition-all duration-200 placeholder:text-gray-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-dark-700 text-gray-400 hover:text-gray-200 transition-colors"
                        aria-label="Clear search"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300 mb-2">
                    <Filter className="inline w-4 h-4 mr-1 mb-0.5" />
                    Filter by Status
                  </label>
                  <div className="relative group">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-400 transition-colors pointer-events-none" />
                    <select
                      id="status-filter"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input pl-12 pr-10 w-full bg-dark-800/50 border border-dark-600/60 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-dark-800 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">All Status</option>
                      <option value="pending">🕐 Pending Review</option>
                      <option value="verified">✅ Verified</option>
                      <option value="unverified">❌ Rejected</option>
                      <option value="resubmitted">🔄 Resubmitted</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-dark-800/30 rounded-lg p-3 border border-dark-700/50">
                  <p className="text-xs text-gray-400 mb-2">Quick Stats</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1.5"></span>
                      {candidates.filter(c => c.documentStats?.pending > 0).length} with pending
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                      {candidates.filter(c => c.documentStats?.verified === c.documentStats?.total).length} fully verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.onboardingId}
                  onClick={() => fetchCandidateDocuments(candidate.onboardingId)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedCandidate?.onboardingId === candidate.onboardingId
                      ? 'bg-primary-600'
                      : 'bg-dark-800 hover:bg-dark-700'
                  }`}
                >
                  <h4 className="font-medium text-white">{candidate.candidateName}</h4>
                  <p className="text-sm text-gray-400">{candidate.position}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-gray-400">
                      {candidate.documentStats.total} docs
                    </span>
                    {candidate.documentStats.pending > 0 && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        {candidate.documentStats.pending} pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Panel */}
        <div className="lg:col-span-2">
          <div className="card">
            {selectedCandidate ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {selectedCandidate.candidateName}
                      </h3>
                      <p className="text-sm text-gray-400">{selectedCandidate.candidateEmail}</p>
                      <p className="text-sm text-gray-400">{selectedCandidate.position}</p>
                    </div>
                    {selectedDocs.length > 0 && (
                      <button
                        onClick={handleBulkVerify}
                        className="btn-primary"
                      >
                        Verify Selected ({selectedDocs.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc._id} className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocs([...selectedDocs, doc._id]);
                              } else {
                                setSelectedDocs(selectedDocs.filter(id => id !== doc._id));
                              }
                            }}
                            className="mt-1 w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <h4 className="font-medium text-white">{doc.documentName}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(doc.verificationStatus)}`}>
                                {doc.verificationStatus}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{doc.originalFileName}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                            </p>
                            {doc.unverificationReason && (
                              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-red-400">
                                  <strong>Rejection Reason:</strong> {doc.unverificationReason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(doc)}
                            className="p-2.5 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-all duration-200 group"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2.5 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-all duration-200 group"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </button>
                          {doc.verificationStatus !== 'verified' && (
                            <button
                              onClick={() => handleVerify(doc._id)}
                              className="p-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/30 rounded-lg transition-all duration-200 group"
                              title="Verify"
                            >
                              <CheckCircle className="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors" />
                            </button>
                          )}
                          {doc.verificationStatus !== 'unverified' && (
                            <button
                              onClick={() => {
                                setRejectingDoc(doc);
                                setShowRejectModal(true);
                              }}
                              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-all duration-200 group"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No documents uploaded yet
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a candidate to view their documents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Reject Document</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Please provide a reason for rejecting <span className="font-medium text-white">{rejectingDoc?.documentName}</span>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="input w-full h-32 mb-4 bg-dark-800/50 border border-dark-600/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingDoc(null);
                  setRejectionReason('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUnverify}
                className="btn-danger flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Reject & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
