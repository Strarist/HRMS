import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { validateToken, uploadDocument, getUploadedDocuments } from '../../api/documentUpload';
import toast from '../../utils/toast';

const DocumentUpload = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenantId');

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [documentConfigs, setDocumentConfigs] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [rejectedDocs, setRejectedDocs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    if (token && tenantId) {
      validateUploadToken();
    } else {
      toast.error('Invalid upload link. Missing token or tenant ID.');
      setLoading(false);
    }
  }, [token, tenantId]);

  const validateUploadToken = async () => {
    try {
      const response = await validateToken(token, tenantId);
      if (response.success) {
        setTokenValid(true);
        setCandidateInfo(response.data.candidate);
        setDocumentConfigs(response.data.documentConfigurations || []);
        setUploadedDocs(response.data.uploadedDocuments || []);
        setRejectedDocs(response.data.rejectedDocuments || []);
      } else {
        toast.error(response.message || 'Invalid upload link');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      toast.error(error.response?.data?.message || 'Failed to validate upload link');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (documentType, file, originalDocumentId = null) => {
    if (!file) return;

    const docConfig = documentConfigs.find(dc => dc.documentType === documentType);
    if (!docConfig) {
      toast.error('Invalid document type');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > docConfig.maxFileSizeMB) {
      toast.error(`File size exceeds ${docConfig.maxFileSizeMB}MB limit`);
      return;
    }

    // Validate file format
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!docConfig.allowedFormats.includes(fileExt)) {
      toast.error(`Invalid file format. Allowed: ${docConfig.allowedFormats.join(', ')}`);
      return;
    }

    setUploading(prev => ({ ...prev, [documentType]: true }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    try {
      const response = await uploadDocument(
        token,
        tenantId,
        documentType,
        file,
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [documentType]: progress }));
        },
        originalDocumentId
      );

      if (response.success) {
        toast.success('Document uploaded successfully');
        // Refresh uploaded documents
        const docsResponse = await getUploadedDocuments(token, tenantId);
        if (docsResponse.success) {
          setUploadedDocs(docsResponse.data);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    }
  };

  const getDocumentsByType = (documentType) => {
    return uploadedDocs.filter(doc => doc.documentType === documentType);
  };

  const getRejectionReason = (documentType) => {
    const rejected = rejectedDocs.find(doc => doc.documentType === documentType);
    return rejected?.reason || null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unverified':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'resubmitted':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'unverified':
        return 'Rejected';
      case 'resubmitted':
        return 'Re-submitted';
      case 'pending':
        return 'Pending Review';
      default:
        return 'Not Uploaded';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating upload link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Upload Link</h1>
          <p className="text-gray-600">
            This upload link is invalid, expired, or has been revoked. Please contact HR for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Upload Portal</h1>
            <p className="text-gray-600">Upload your onboarding documents securely</p>
          </div>

          {/* Candidate Info */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-indigo-100 text-sm">Candidate ID</p>
                <p className="font-semibold text-lg">{candidateInfo?.candidateId}</p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Name</p>
                <p className="font-semibold text-lg">{candidateInfo?.name}</p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Email</p>
                <p className="font-semibold text-lg">{candidateInfo?.email}</p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Position</p>
                <p className="font-semibold text-lg">{candidateInfo?.position}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rejected Documents Alert */}
        {rejectedDocs.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Documents Requiring Re-submission
                </h3>
                <p className="text-red-700 mb-3">
                  The following documents were rejected. Please review the reasons and re-upload corrected versions.
                </p>
                <ul className="space-y-2">
                  {rejectedDocs.map((doc, index) => (
                    <li key={index} className="text-red-700">
                      <strong>{doc.documentType.replace(/_/g, ' ').toUpperCase()}:</strong> {doc.reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Upload Guidelines</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Ensure all documents are clear and readable</li>
            <li>• Upload documents in the correct format (PDF, JPG, PNG)</li>
            <li>• File size should not exceed the specified limit</li>
            <li>• Make sure all required information is visible</li>
          </ul>
        </div>

        {/* Document Upload Cards */}
        <div className="space-y-4">
          {documentConfigs.map((docConfig) => {
            const docsForType = getDocumentsByType(docConfig.documentType);
            const latestDoc = docsForType[0] || null;
            const status = latestDoc?.verificationStatus || null;
            const rejectionReason = getRejectionReason(docConfig.documentType);
            const isUploading = uploading[docConfig.documentType];
            const progress = uploadProgress[docConfig.documentType] || 0;
            const isMultiUploadType = ['educational_certificate', 'experience_letter', 'training_certificate', 'other'].includes(docConfig.documentType);

            return (
              <div key={docConfig.documentType} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {docConfig.displayName}
                        {docConfig.isMandatory && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h3>
                    </div>
                    {docConfig.description && (
                      <p className="text-sm text-gray-600 mb-2">{docConfig.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Formats: {docConfig.allowedFormats.join(', ').toUpperCase()} | 
                      Max size: {docConfig.maxFileSizeMB}MB
                    </p>
                    {docConfig.uploadInstructions && (
                      <p className="text-xs text-blue-600 mt-1">{docConfig.uploadInstructions}</p>
                    )}
                    {isMultiUploadType && (
                      <p className="text-xs text-indigo-600 mt-1">
                        You can upload multiple documents for this category.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {status && getStatusIcon(status)}
                    {status && (
                      <span className={`text-sm font-medium ${
                        status === 'verified' ? 'text-green-600' :
                        status === 'unverified' ? 'text-red-600' :
                        status === 'resubmitted' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {getStatusText(status)}
                      </span>
                    )}
                  </div>
                </div>

                {docsForType.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Uploaded document{docsForType.length > 1 ? 's' : ''}:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {docsForType.map((doc, index) => (
                        <li
                          key={doc.documentId || `${doc.documentType}-${index}`}
                          className="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                        >
                          <span className="truncate">{doc.fileName}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              {getStatusIcon(doc.verificationStatus)}
                              <span className="text-xs">
                                {getStatusText(doc.verificationStatus)}
                              </span>
                            </span>
                            <div>
                              <input
                                type="file"
                                id={`file-${docConfig.documentType}-${doc.documentId || index}`}
                                className="hidden"
                                accept={docConfig.allowedFormats.map(f => `.${f}`).join(',')}
                                onChange={(e) =>
                                  handleFileSelect(
                                    docConfig.documentType,
                                    e.target.files[0],
                                    doc.documentId
                                  )
                                }
                              />
                              <label
                                htmlFor={`file-${docConfig.documentType}-${doc.documentId || index}`}
                                className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md cursor-pointer bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                              >
                                Re-upload
                              </label>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rejectionReason && (
                  <div className="bg-red-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {rejectionReason}
                    </p>
                  </div>
                )}

                {isUploading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-indigo-600 font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {/* Main upload / add more button */}
                    <div>
                      <input
                        type="file"
                        id={`file-${docConfig.documentType}`}
                        className="hidden"
                        accept={docConfig.allowedFormats.map(f => `.${f}`).join(',')}
                        onChange={(e) => handleFileSelect(docConfig.documentType, e.target.files[0])}
                      />
                      <label
                        htmlFor={`file-${docConfig.documentType}`}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                          status === 'verified'
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        {isMultiUploadType
                          ? (docsForType.length > 0 ? 'Add more' : 'Upload Document')
                          : (status ? 'Re-upload Document' : 'Upload Document')}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6 text-center">
          <p className="text-gray-600 text-sm">
            If you have any questions or need assistance, please contact our HR team.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            This is a secure upload portal. Your documents are encrypted and stored safely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
