import React from 'react';
import { FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';

const DownloadModal = ({
  isOpen,
  onClose,
  downloadDateFrom,
  onDownloadDateFromChange,
  downloadTimeFrom,
  onDownloadTimeFromChange,
  downloadDateTo,
  onDownloadDateToChange,
  downloadTimeTo,
  onDownloadTimeToChange,
  onDownloadCSV,
  onDownloadPDF,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full md:w-[70%] shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Download Options</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close download modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3 md:gap-4 mb-6">
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Date From</label>
            <DatePicker
              selected={downloadDateFrom}
              onChange={onDownloadDateFromChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select start date"
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              aria-label="Select download start date"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Time From</label>
            <input
              type="time"
              value={downloadTimeFrom || ''}
              onChange={e => onDownloadTimeFromChange(e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              aria-label="Select download start time"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Date To</label>
            <DatePicker
              selected={downloadDateTo}
              onChange={onDownloadDateToChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select end date"
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              aria-label="Select download end date"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Time To</label>
            <input
              type="time"
              value={downloadTimeTo || ''}
              onChange={e => onDownloadTimeToChange(e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              aria-label="Select download end time"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 md:gap-3">
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
            className="px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Download PDF"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
