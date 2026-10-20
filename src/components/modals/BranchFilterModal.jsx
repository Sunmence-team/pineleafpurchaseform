import React from "react";
import { FaTimes } from "react-icons/fa";

const BranchFilterModal = ({
  isOpen,
  isLoadingAllclients,
  onClose,
  branchInput,
  onBranchInputChange,
  branchOptions,
  onReset,
  onApply,
}) => {
  if (!isOpen) return null;

  if (isLoadingAllclients) {
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      <span className="ml-3">Loading all clients...</span>
    </div>;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Filter by Branch
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close branch filter modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3 md:gap-4 mb-6">
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
              Branch
            </label>
            <select
              value={branchInput}
              onChange={(e) => onBranchInputChange(e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base bg-gray-50"
              aria-label="Select branch"
            >
              <option value="">Select Branch</option>
              {branchOptions.map((branch) => (
                <option key={branch.keyWord} value={branch.title}>
                  {branch.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 md:gap-3">
          <button
            onClick={onReset}
            className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Reset branch filter"
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="px-3 py-2 md:px-4 md:py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Apply branch filter"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchFilterModal;
