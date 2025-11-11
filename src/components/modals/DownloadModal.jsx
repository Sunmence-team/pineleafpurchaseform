import React from 'react';
import { FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

const DownloadModal = ({
  isOpen,
  onClose,
  lastDownloadTime,
  downloadDateFrom,
  onDownloadDateFromChange,
  downloadTimeFrom,
  onDownloadTimeFromChange,
  onDownloadCSV,
  onDownloadPDF,
  excludedSites,
  onExcludeChange,
  initialCount,
  excludedCount,
  remainingCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 md:p-8 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full lg:w-[40%] md:w-[75%] shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
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

        {lastDownloadTime ? (
          <div className="text-center mb-6 py-4 font-semibold">
            <p className="text-sm md:text-base text-gray-700">
              Your last download was on:{' '}
              <span className="font-semibold text-secClr">
                {format(lastDownloadTime, 'dd/MM/yyyy HH:mm')}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              The next download will include all records since that time.
            </p>
            <div className="mt-6 text-start">
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Exclude Sites (comma-separated)</label>
              <input
                type="text"
                value={excludedSites}
                onChange={(e) => onExcludeChange(e.target.value)}
                placeholder="e.g. siteA, siteB"
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
              <p>Initial records: {initialCount}</p>
              <p>Excluded: {excludedCount}</p>
              <p>Remaining: {remainingCount}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 md:gap-4 mb-6">
            <p className="text-center text-sm text-gray-600 bg-yellow-100 p-3 rounded-lg">
              This is your first download. Please select a start date and time. Future downloads will automatically start from the time of your last download.
            </p>
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
          </div>
        )}

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
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;