import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { format } from "date-fns";
import DatePicker from "react-datepicker";

const DownloadModal = ({
  isLoadingAllclients,
  isOpen,
  onClose,
  lastDownloadTime,
  branchLastDownload,
  onDownloadCSV,
  onDownloadPDF,
  excludedSites,
  onExcludeChange,
  excludedBranches,
  onExcludeBranchChange,
  initialCount,
  excludedCount,
  remainingCount,
  branchOptions,
  onBranchSelect,
  selectedBranch,
  branchStartDate,
  setBranchStartDate,
  branchStartTime,
  setBranchStartTime,
  branchInitialCount,
  loadingBranchDownloadTime,
  onModalCloseCleanup,
}) => {
  const [downloadMode, setDownloadMode] = useState("general");

  useEffect(() => {
    if (isOpen) {
      setDownloadMode("general");
    } else {
      onModalCloseCleanup();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (isLoadingAllclients) {
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-secondary2 border-t-transparent"></div>
      <span className="ml-3">Loading all clients...</span>
    </div>;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 md:p-8 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full lg:w-[45%] md:w-[80%] shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Download Options
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close download modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 justify-center gap-4 mb-6 border-b border-gray-400 pb-6">
          <button
            className={`text-sm font-semibold outline-0 h-[50px] cursor-pointer rounded-lg border border-secondary2/50 ${downloadMode === "general" ? "bg-secondary2 text-primary2" : ""}`}
            onClick={() => setDownloadMode("general")}
          >
            General Download
          </button>
          <button
            className={`text-sm font-semibold outline-0 h-[50px] cursor-pointer rounded-lg border border-secondary2/50 ${downloadMode === "branch" ? "bg-secondary2 text-primary2" : ""}`}
            onClick={() => setDownloadMode("branch")}
          >
            Download by Branch
          </button>
        </div>

        {downloadMode === "general" && (
          <div className="text-center mb-6 font-semibold">
            {lastDownloadTime ? (
              <>
                <p className="text-sm md:text-base text-gray-700">
                  Your last general download was on:{" "}
                  <span className="font-semibold text-secondary2">
                    {format(lastDownloadTime, "dd/MM/yyyy HH:mm")}
                  </span>
                </p>
                <div className="mt-6">
                  <label className="text-start block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                    Exclude Sites (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={excludedSites}
                    onChange={(e) => onExcludeChange(e.target.value)}
                    placeholder="e.g. siteA, siteB"
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary2 text-sm md:text-base bg-gray-50"
                  />
                </div>
                <div className="mt-4">
                  <label className="text-start block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                    Exclude Branches
                  </label>
                  <select
                    onChange={(e) => onExcludeBranchChange(e.target.value)}
                    defaultValue={""}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary2 text-sm md:text-base bg-gray-50"
                  >
                    <option value="" disabled>
                      -- Select branches to exclude --
                    </option>
                    {branchOptions.map((option) => (
                      <option
                        key={option.keyWord}
                        value={option.keyWord}
                        disabled={excludedBranches.includes(option.keyWord)}
                      >
                        {option.title}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {excludedBranches.map((branchKey) => {
                      const branch = branchOptions.find(
                        (opt) => opt.keyWord === branchKey,
                      );
                      return (
                        <div
                          key={branchKey}
                          className="flex items-center bg-gray-200 border border-secondary2/30 rounded-full px-3 py-1 text-xs cursor-pointer"
                        >
                          <span>{branch ? branch.title : branchKey}</span>
                          <button
                            onClick={() => onExcludeBranchChange(branchKey)}
                            className="ml-2 text-red-500 hover:text-red-700"
                            title={`Include ${branch.title}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <p>Initial records: {initialCount}</p>
                  <p>Excluded: {excludedCount}</p>
                  <p>Remaining: {remainingCount}</p>
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-gray-600 bg-yellow-100 p-3 rounded-lg">
                This is your first general download. All records from the
                beginning of time will be included.
              </p>
            )}
          </div>
        )}

        {downloadMode === "branch" && (
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
              Select a Branch
            </label>
            <select
              onChange={(e) => onBranchSelect(e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary2 text-sm md:text-base bg-gray-50"
            >
              <option value="">-- Select a branch --</option>
              {branchOptions.map((option) => (
                <option key={option.keyWord} value={option.keyWord}>
                  {option.title}
                </option>
              ))}
            </select>
            {loadingBranchDownloadTime ? (
              <div className="flex items-center justify-center p-3 mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-secondary2 border-t-transparent"></div>
                <span className="ml-2 text-sm text-gray-600">
                  Loading branch download history...
                </span>
              </div>
            ) : (
              <>
                {selectedBranch && branchLastDownload === null && (
                  <p className="text-center text-sm text-gray-600 bg-yellow-100 p-3 rounded-lg mt-4">
                    This is the first download for this branch. Please select a
                    start date and time.
                  </p>
                )}
                {branchLastDownload && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">
                      Last download for this branch was on:{" "}
                      <span className="font-semibold text-secondary2">
                        {format(
                          new Date(branchLastDownload),
                          "dd/MM/yyyy HH:mm",
                        )}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Found {branchInitialCount} new records.
                    </p>
                  </>
                )}
                {selectedBranch && branchLastDownload === null && (
                  <div className="flex flex-col gap-3 md:gap-4 mt-4">
                    <div>
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                        Date From
                      </label>
                      <DatePicker
                        selected={branchStartDate}
                        onChange={setBranchStartDate}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="Select start date"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary2 text-sm md:text-base bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                        Time From
                      </label>
                      <input
                        type="time"
                        value={branchStartTime}
                        onChange={(e) => setBranchStartTime(e.target.value)}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary2 text-sm md:text-base bg-gray-50"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="md:flex grid grid-cols-2 justify-end gap-6 md:gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Cancel download"
          >
            Cancel
          </button>
          <button
            onClick={() => onDownloadCSV(downloadMode)}
            className="px-3 py-2 md:px-4 md:py-2 bg-secondary2 text-white font-semibold rounded-lg hover:bg-secondary2/90 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Download CSV"
          >
            Download as CSV
          </button>
          <button
            onClick={() => onDownloadPDF(downloadMode)}
            className="col-span-2 px-3 py-2 md:px-4 md:py-2 bg-secondary2 text-white font-semibold rounded-lg hover:bg-secondary2/90 transition duration-300 shadow-md w-full md:w-auto"
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
