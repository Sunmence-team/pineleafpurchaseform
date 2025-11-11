import React from 'react';
import { FaTimes } from 'react-icons/fa';

const DownloadAllModal = ({
  isOpen,
  onClose,
  onDownloadCSV,
  onDownloadPDF,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 md:p-8 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full lg:w-[40%] md:w-[75%] shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Download All Records</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close download modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mb-6">
          This will download all records in the database. Please choose your desired format.
        </p>

        <div className="md:flex grid grid-cols-2 justify-end gap-6 md:gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Cancel download"
          >
            Cancel
          </button>
          <button
            onClick={onDownloadCSV}
            className="px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Download CSV"
          >
            Download as CSV
          </button>
          <button
            onClick={onDownloadPDF}
            className="col-span-2 px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Download PDF"
          >
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadAllModal;