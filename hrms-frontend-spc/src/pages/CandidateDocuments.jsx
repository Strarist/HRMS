import React, { useState } from 'react';
import { Upload, FileText, CreditCard, Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { config } from '../config/api.config';

const CandidateDocuments = () => {
  const [step, setStep] = useState('login'); // 'login' or 'upload'
  const [candidateCode, setCandidateCode] = useState('');
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    aadharFile: null,
    panFile: null,
    bankProofFile: null,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });

  const [uploadProgress, setUploadProgress] = useState({
    aadhar: false,
    pan: false,
    bankProof: false
  });

  // Validate Candidate ID
  const handleValidate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/candidate-documents/public/validate`,
        {
          candidateCode: candidateCode.trim(),
          companyId: import.meta.env.VITE_PUBLIC_COMPANY_ID
        }
      );

      if (response.data.success) {
        setCandidateData(response.data.data);
        setStep('upload');
        
        // Pre-fill account holder name with candidate name
        setFormData(prev => ({
          ...prev,
          accountHolderName: response.data.data.name
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Candidate ID. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${fieldName} file size should not exceed 5MB`);
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError(`${fieldName} must be a PDF or image file (JPEG, JPG, PNG)`);
        return;
      }

      setFormData(prev => ({ ...prev, [fieldName]: file }));
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate all required fields
    if (!formData.aadharFile || !formData.panFile || !formData.bankProofFile) {
      setError('Please upload all required documents');
      setLoading(false);
      return;
    }

    if (!formData.bankName || !formData.accountNumber || !formData.ifscCode || !formData.accountHolderName) {
      setError('Please fill all bank details');
      setLoading(false);
      return;
    }

    try {
      // Create FormData
      const submitData = new FormData();
      submitData.append('candidateCode', candidateCode);
      submitData.append('companyId', import.meta.env.VITE_PUBLIC_COMPANY_ID || '');
      submitData.append('aadhar', formData.aadharFile);
      submitData.append('pan', formData.panFile);
      submitData.append('bankProof', formData.bankProofFile);
      submitData.append('bankDetails', JSON.stringify({
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        accountHolderName: formData.accountHolderName
      }));

      const response = await axios.post(
        `${config.apiBaseUrl}/candidate-documents/public/submit`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted);
          }
        }
      );

      if (response.data.success) {
        setSuccess('Documents submitted successfully! You will receive a confirmation email shortly.');
        // Reset form
        setFormData({
          aadharFile: null,
          panFile: null,
          bankProofFile: null,
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Onboarding Document Submission
          </h1>
          <p className="text-gray-600">
            Submit your documents to complete the onboarding process
          </p>
        </div>

        {/* Login Step */}
        {step === 'login' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Enter Your Candidate ID
              </h2>
              <p className="text-gray-600">
                You received this ID in your onboarding email
              </p>
            </div>

            <form onSubmit={handleValidate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate ID
                </label>
                <input
                  type="text"
                  value={candidateCode}
                  onChange={(e) => setCandidateCode(e.target.value.toUpperCase())}
                  placeholder="e.g., CAN00001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg font-mono"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !candidateCode}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your Candidate ID was sent to your email when you were moved to onboarding. Please check your inbox.
              </p>
            </div>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && candidateData && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Candidate Info */}
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">Welcome, {candidateData.name}!</h3>
              <p className="text-sm text-indigo-700">
                <strong>Candidate ID:</strong> {candidateData.candidateCode}
              </p>
              <p className="text-sm text-indigo-700">
                <strong>Email:</strong> {candidateData.email}
              </p>
            </div>

            {success && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Aadhar Card */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Aadhar Card</h3>
                  <span className="text-red-500">*</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'aadharFile')}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
                {formData.aadharFile && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {formData.aadharFile.name}
                  </p>
                )}
              </div>

              {/* PAN Card */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">PAN Card</h3>
                  <span className="text-red-500">*</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'panFile')}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
                {formData.panFile && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {formData.panFile.name}
                  </p>
                )}
              </div>

              {/* Bank Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Bank Details</h3>
                  <span className="text-red-500">*</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="e.g., HDFC Bank"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      placeholder="As per bank records"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Enter account number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                      placeholder="e.g., HDFC0001234"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Proof (Cancelled Cheque / Passbook)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'bankProofFile')}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      required
                    />
                    {formData.bankProofFile && (
                      <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {formData.bankProofFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('login');
                    setCandidateData(null);
                    setError('');
                    setSuccess('');
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Submit Documents
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please ensure all documents are clear and readable. Maximum file size: 5MB per file. Accepted formats: PDF, JPG, PNG.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDocuments;
