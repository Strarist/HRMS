import React, { useState } from 'react';
import { Upload, FileText, User, Mail, Phone, MapPin, Briefcase, DollarSign, Calendar, Code, Eye, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ResumeParser = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please select a PDF, DOC, or DOCX file');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a resume file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/candidates/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for resume extraction (can take time with chunked processing)
      });

      if (response.data.success) {
        setParsedData(response.data.data);
        setShowForm(true);

        // Different success messages based on parsing method
        if (response.data.data.metadata?.source === 'reducto') {
          toast.success('Resume parsed successfully with AI!');
        } else if (response.data.data.metadata?.source === 'local-parser') {
          toast.success('Resume parsed with local parser!');
        } else {
          toast.success('Resume uploaded successfully!');
        }
      } else {
        // Handle API failure gracefully - still show form with empty data for manual entry
        console.log('Resume parsing failed, showing manual entry form:', response.data);
        setParsedData({
          extractedData: response.data.data || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            appliedFor: '',
            currentLocation: '',
            preferredLocation: '',
            source: '',
            experienceYears: null,
            experienceMonths: null,
            currentCompany: '',
            currentDesignation: '',
            currentCTC: null,
            expectedCTC: null,
            noticePeriod: '',
            skills: [],
            stage: null,
            notes: response.data.message || 'Resume parsing failed. Please enter details manually.'
          },
          rawText: response.data.rawText || '',
          confidence: response.data.confidence || {},
          metadata: response.data.metadata || {}
        });
        setShowForm(true);

        // Different error messages based on what failed
        if (response.data.data?.metadata?.source === 'local-parser') {
          toast.error('AI parsing unavailable, but local parsing worked!');
        } else {
          toast.error(response.data.message || 'Parsing failed, but you can enter details manually');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Still open manual entry so HR is not blocked
      setParsedData({
        extractedData: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          appliedFor: '',
          currentLocation: '',
          preferredLocation: '',
          source: '',
          experienceYears: null,
          experienceMonths: null,
          currentCompany: '',
          currentDesignation: '',
          currentCTC: null,
          expectedCTC: null,
          noticePeriod: '',
          skills: [],
          stage: null,
          notes: error.response?.data?.message || 'Upload failed. Enter details manually.',
        },
        rawText: '',
        confidence: {},
        metadata: { source: 'error-fallback' },
      });
      setShowForm(true);
      toast.error(error.response?.data?.message || 'Automatic parsing failed — enter details manually');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCandidate = async () => {
    if (!parsedData?.extractedData) {
      toast.error('No data to save');
      return;
    }

    setSaving(true);
    try {
      // Ensure data types are correct before sending
      const extractedData = parsedData.extractedData || {};

      const candidateData = {
        // Basic info with proper types
        firstName: extractedData.firstName || null,
        lastName: extractedData.lastName || null,
        email: extractedData.email || null,
        phone: extractedData.phone || null,
        alternatePhone: extractedData.alternatePhone || null,

        // Job related
        appliedFor: extractedData.appliedFor || null,
        appliedForTitle: extractedData.appliedFor || null, // Store job title as string

        // Location
        currentLocation: extractedData.currentLocation || null,
        preferredLocation: Array.isArray(extractedData.preferredLocation)
          ? extractedData.preferredLocation
          : [],

        // Other fields
        source: extractedData.source || 'other',
        experience: {
          years: extractedData.experienceYears ? parseInt(extractedData.experienceYears) : 0,
          months: extractedData.experienceMonths ? parseInt(extractedData.experienceMonths) : 0
        },
        currentCompany: extractedData.currentCompany || null,
        currentDesignation: extractedData.currentDesignation || null,
        currentCTC: extractedData.currentCTC ? parseFloat(extractedData.currentCTC) : null,
        expectedCTC: extractedData.expectedCTC ? parseFloat(extractedData.expectedCTC) : null,
        noticePeriod: extractedData.noticePeriod || null,
        skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
        notes: extractedData.notes || null,

        // Set defaults
        stage: 'applied',
        status: 'active',

        // Store parsing metadata
        resumeParsing: {
          rawText: parsedData.rawText,
          confidence: parsedData.confidence,
          parsedAt: new Date(),
          parserVersion: parsedData.metadata?.version || '1.0',
          parsingSource: parsedData.metadata?.fallback ? 'manual' : 'reducto',
          parsingMetadata: {
            fileName: file?.name,
            fileSize: file?.size,
            mimeType: file?.type,
            fallback: parsedData.metadata?.fallback || false,
            error: parsedData.metadata?.error,
            // Include S3 file information if available
            s3File: parsedData.s3File || null
          },
          // Store complete Reducto JSON response for future reference
          reductoResponse: parsedData,
          // Store extracted data separately
          extractedData: parsedData.extractedData
        },

        // Store resume file information from S3
        resume: parsedData.s3File ? {
          url: parsedData.s3File.url,
          filename: parsedData.s3File.fileName,
          originalName: parsedData.s3File.fileName,
          size: parsedData.s3File.size,
          mimetype: parsedData.s3File.fileName?.endsWith('.pdf') ? 'application/pdf' :
                   parsedData.s3File.fileName?.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                   'application/msword',
          uploadedAt: parsedData.s3File.uploadedAt,
          s3Key: parsedData.s3File.key,
          s3Bucket: parsedData.s3File.bucket
        } : null
      };

      console.log('Sending candidate data to save:', candidateData);

      const response = await api.post('/candidates', candidateData);

      if (response.data.success) {
        toast.success('Candidate saved successfully!');
        // Reset form
        setFile(null);
        setParsedData(null);
        setShowForm(false);
      } else {
        toast.error(response.data.message || 'Failed to save candidate');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save candidate');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, value, icon, confidence = null) => {
    const hasValue = value && value !== '' && value !== null;
    const confidenceColor = confidence >= 0.8 ? 'text-green-600' : confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">{label}</div>
          <div className="text-sm text-gray-900">
            {hasValue ? value : <span className="text-gray-400 italic">Not found</span>}
          </div>
        </div>
        {confidence !== null && (
          <div className={`text-xs font-medium ${confidenceColor}`}>
            {Math.round(confidence * 100)}% confident
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Resume Parser
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload a resume to automatically extract candidate information using AI
          </p>
        </div>

        <div className="p-6">
          {!showForm ? (
            // Upload Section
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    {file ? file.name : 'Choose a resume file'}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    PDF, DOC, or DOCX up to 10MB
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => document.getElementById('resume-upload').click()}
                  >
                    Select File
                  </button>
                </label>
              </div>

              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Extracting candidate details... (this may take a few minutes)
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Parse Resume
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Review Section
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Extracted Information</h3>
                  {parsedData?.metadata?.source === 'local-parser' && (
                    <p className="text-sm text-blue-600 mt-1">
                      🔄 Using local parser - limited AI capabilities
                    </p>
                  )}
                  {parsedData?.metadata?.source === 'manual-entry' && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ All parsing failed - please enter details manually
                    </p>
                  )}
                  {parsedData?.metadata?.source === 'reducto' && !parsedData?.metadata?.fallback && (
                    <p className="text-sm text-green-600 mt-1">
                      ✅ AI parsing successful
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to upload
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(
                  'Full Name',
                  `${parsedData.extractedData.firstName || ''} ${parsedData.extractedData.lastName || ''}`.trim() || null,
                  <User className="w-5 h-5 text-blue-600" />,
                  parsedData.confidence?.firstName || null
                )}

                {renderField(
                  'Email',
                  parsedData.extractedData.email,
                  <Mail className="w-5 h-5 text-green-600" />,
                  parsedData.confidence?.email || null
                )}

                {renderField(
                  'Phone',
                  parsedData.extractedData.phone,
                  <Phone className="w-5 h-5 text-purple-600" />,
                  parsedData.confidence?.phone || null
                )}

                {renderField(
                  'Location',
                  parsedData.extractedData.currentLocation,
                  <MapPin className="w-5 h-5 text-orange-600" />,
                  parsedData.confidence?.currentLocation || null
                )}

                {renderField(
                  'Job Title',
                  parsedData.extractedData.appliedFor,
                  <Briefcase className="w-5 h-5 text-indigo-600" />,
                  parsedData.confidence?.appliedFor || null
                )}

                {renderField(
                  'Current Company',
                  parsedData.extractedData.currentCompany,
                  <Briefcase className="w-5 h-5 text-teal-600" />,
                  parsedData.confidence?.currentCompany || null
                )}

                {renderField(
                  'Experience',
                  parsedData.extractedData.experienceYears ?
                    `${parsedData.extractedData.experienceYears} years${parsedData.extractedData.experienceMonths ? ` ${parsedData.extractedData.experienceMonths} months` : ''}` :
                    null,
                  <Calendar className="w-5 h-5 text-red-600" />,
                  parsedData.confidence?.experienceYears || null
                )}

                {renderField(
                  'Skills',
                  parsedData.extractedData.skills?.join(', '),
                  <Code className="w-5 h-5 text-pink-600" />,
                  parsedData.confidence?.skills || null
                )}

                {renderField(
                  'Current CTC',
                  parsedData.extractedData.currentCTC ? `₹${parsedData.extractedData.currentCTC.toLocaleString()}` : null,
                  <DollarSign className="w-5 h-5 text-yellow-600" />,
                  parsedData.confidence?.currentCTC || null
                )}

                {renderField(
                  'Expected CTC',
                  parsedData.extractedData.expectedCTC ? `₹${parsedData.extractedData.expectedCTC.toLocaleString()}` : null,
                  <DollarSign className="w-5 h-5 text-emerald-600" />,
                  parsedData.confidence?.expectedCTC || null
                )}
              </div>

              {/* Raw Text Preview */}
              {parsedData.rawText && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Extracted Text Preview
                    </h4>
                    <span className="text-xs text-gray-500">
                      {parsedData.rawText.length} characters
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {parsedData.rawText.substring(0, 500)}...
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCandidate}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Candidate
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeParser;