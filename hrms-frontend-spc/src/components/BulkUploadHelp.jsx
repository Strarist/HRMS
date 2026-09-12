import React, { useState } from 'react';
import { HelpCircle, X, CheckCircle, AlertCircle } from 'lucide-react';

const BulkUploadHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg z-50 transition-all"
        title="Help & Guide"
      >
        <HelpCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Bulk Upload Guide</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-dark-800 rounded-lg"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Start */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Quick Start</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Download the template using the "Download Template" button</li>
                  <li>Fill in your employee data following the format</li>
                  <li>Upload the file or paste Google Sheets URL</li>
                  <li>Click "Validate" to check for errors</li>
                  <li>Review validation results and fix any errors</li>
                  <li>Click "Upload Employees" to complete the import</li>
                </ol>
              </section>

              {/* Required Fields */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Required Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">firstName</p>
                        <p className="text-gray-400 text-sm">Employee's first name</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">lastName</p>
                        <p className="text-gray-400 text-sm">Employee's last name</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">email</p>
                        <p className="text-gray-400 text-sm">Must be unique (e.g., john@example.com)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">phone</p>
                        <p className="text-gray-400 text-sm">10-15 digits (e.g., 1234567890)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">department</p>
                        <p className="text-gray-400 text-sm">Department name or ID</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">designation</p>
                        <p className="text-gray-400 text-sm">Job title/position</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">joiningDate</p>
                        <p className="text-gray-400 text-sm">Format: YYYY-MM-DD (e.g., 2024-01-01)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Format Examples */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Data Format Examples</h3>
                <div className="space-y-4">
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <p className="text-white font-medium mb-2">Date Format</p>
                    <code className="text-green-400">YYYY-MM-DD</code>
                    <p className="text-gray-400 text-sm mt-1">Example: 2024-01-15, 1990-05-20</p>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <p className="text-white font-medium mb-2">Gender</p>
                    <code className="text-green-400">male, female, other</code>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <p className="text-white font-medium mb-2">Blood Group</p>
                    <code className="text-green-400">A+, A-, B+, B-, AB+, AB-, O+, O-</code>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <p className="text-white font-medium mb-2">Employment Type</p>
                    <code className="text-green-400">full-time, part-time, contract, intern</code>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg">
                    <p className="text-white font-medium mb-2">Status</p>
                    <code className="text-green-400">active, inactive, terminated, on-leave</code>
                  </div>
                </div>
              </section>

              {/* Common Errors */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Common Errors & Solutions</h3>
                <div className="space-y-3">
                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle size={20} className="text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-red-400 font-medium">Email already exists</p>
                        <p className="text-gray-300 text-sm">Check for duplicate emails in your file and database</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle size={20} className="text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-red-400 font-medium">Department not found</p>
                        <p className="text-gray-300 text-sm">Create the department first or use exact department name</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle size={20} className="text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-red-400 font-medium">Invalid date format</p>
                        <p className="text-gray-300 text-sm">Use YYYY-MM-DD format (e.g., 2024-01-01)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Google Sheets */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Google Sheets Integration</h3>
                <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg">
                  <p className="text-white font-medium mb-2">For Public Sheets:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                    <li>Open your Google Sheet</li>
                    <li>Click Share → Get link</li>
                    <li>Set to "Anyone with the link can view"</li>
                    <li>Copy and paste the URL in the bulk upload page</li>
                  </ol>
                </div>
              </section>

              {/* Best Practices */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Best Practices</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Start with a small batch (5-10 records) to test</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Ensure all departments exist before uploading</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Use consistent date and phone formats throughout</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Always validate before uploading</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Keep a backup of your original data</span>
                  </li>
                </ul>
              </section>
            </div>

            <div className="sticky bottom-0 bg-dark-900 border-t border-gray-700 p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkUploadHelp;
