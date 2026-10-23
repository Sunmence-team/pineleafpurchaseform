import React from "react";
import { FaTimes } from "react-icons/fa";
import { format } from "date-fns";
import DatePicker from "react-datepicker";

const BranchDownloadModal = ({
  isOpen,
  onClose,
  loading,
  lastDownloadTime,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  excludedSites,
  onExcludeChange,
  initialCount,
  excludedCount,
  remainingCount,
  onDownloadCSV,
  onDownloadPDF,
  branchTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 md:p-8 p-4">
      <div className="bg-white rounded-2xl p-4 md:p-6 w-full lg:w-[45%] md:w-[80%] shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Download New Records - {branchTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close download modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="mb-6 font-semibold">
            {lastDownloadTime ? (
              <div className="space-y-4">
                <p className="text-sm md:text-base text-gray-700 text-center">
                  Last download for this branch was on:{" "}
                  <span className="font-bold text-primary">
                    {format(new Date(lastDownloadTime), "dd/MM/yyyy HH:mm")}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-600 bg-yellow-100 p-3 rounded-lg">
                  This is the first download for this branch. Please select a
                  start date and time.
                </p>
                <div className="flex flex-col md:flex-row gap-3 mt-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date From
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select start date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-gray-50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time From
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Exclude Sites section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exclude Sites (comma-separated)
              </label>
              <input
                type="text"
                value={excludedSites}
                onChange={(e) => onExcludeChange(e.target.value)}
                placeholder="e.g. siteA, siteB"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-gray-50"
              />
            </div>

            {/* Counts display */}
            <div className="flex items-center justify-between mt-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p>
                Initial:{" "}
                <span className="font-bold text-gray-800">{initialCount}</span>
              </p>
              <p>
                Excluded:{" "}
                <span className="font-bold text-red-500">{excludedCount}</span>
              </p>
              <p>
                Remaining:{" "}
                <span className="font-bold text-green-600">
                  {remainingCount}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="md:flex grid grid-cols-2 justify-end gap-6 md:gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={onDownloadCSV}
            disabled={loading}
            className="px-3 py-2 md:px-4 md:py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition duration-300 shadow-md w-full md:w-auto"
          >
            Download as CSV
          </button>
          <button
            onClick={onDownloadPDF}
            disabled={loading}
            className="col-span-2 px-3 py-2 md:px-4 md:py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition duration-300 shadow-md w-full md:w-auto"
          >
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchDownloadModal;
