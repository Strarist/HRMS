import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import api from '../api/axios';
import toast from '../utils/toast';

const RosterUpload = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please select an Excel (.xlsx, .xls) or CSV file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/work-schedule/rosters/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadResults(response.data.data);
      toast.success(response.data.message);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Bulk Upload Roster</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 rounded"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Excel/CSV File
            </label>
            <div className="border-2 border-dashed border-dark-700 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FileSpreadsheet size={48} className="text-gray-400" />
                <span className="text-gray-300">
                  {file ? file.name : 'Click to select file'}
                </span>
                <span className="text-sm text-gray-400">
                  Excel (.xlsx, .xls) or CSV files only
                </span>
              </label>
            </div>
          </div>

          <div className="bg-dark-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Expected columns:</p>
            <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
              <li>Employee Email (required)</li>
              <li>Shift Code (required)</li>
              <li>Effective Date (required)</li>
              <li>Location (required)</li>
              <li>End Date (optional)</li>
            </ul>
          </div>

          {uploadResults && (
            <div className="bg-dark-900 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-300 mb-2">
                Upload Results: {uploadResults.success.length} successful, {uploadResults.errors.length} errors
              </p>
              {uploadResults.errors.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {uploadResults.errors.map((error, idx) => (
                    <div key={idx} className="text-xs text-red-400">
                      Row {error.row}: {error.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn-primary flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RosterUpload;


