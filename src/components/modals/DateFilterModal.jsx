import React from 'react';
import { FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';

const DateFilterModal = ({
  isOpen,
  isLoadingAllclients,
  onClose,
  dateFromInput,
  onDateFromChange,
  timeFromInput,
  onTimeFromChange,
  dateToInput,
  onDateToChange,
  timeToInput,
  onTimeToChange,
  onReset,
  onApply,
  onPresetSelect,
  activePreset,
}) => {
  if (!isOpen) return null;

  if (isLoadingAllclients) {
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-secClr border-t-transparent"></div>
      <span className="ml-3">Loading all clients...</span>
    </div>
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Filter by Date and Time</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close date filter modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month'].map((preset) => (
            <button
              key={preset}
              onClick={() => onPresetSelect(preset)}
              className={`px-6 h-[50px] text-xs sm:text-sm font-semibold rounded-md transition duration-300 ${
                activePreset === preset
                  ? 'bg-secClr text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Date From</label>
            <DatePicker
              selected={dateFromInput}
              onChange={onDateFromChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select start date"
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              aria-label="Select start date"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Time From</label>
            <input
              type="time"
              value={timeFromInput || ''}
              onChange={onTimeFromChange}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              aria-label="Select start time"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Date To</label>
            <DatePicker
              selected={dateToInput}
              onChange={onDateToChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select end date"
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              aria-label="Select end date"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Time To</label>
            <input
              type="time"
              value={timeToInput || ''}
              onChange={onTimeToChange}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
              aria-label="Select end time"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 md:gap-3">
          <button
            onClick={onReset}
            className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Reset date filter"
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto"
            aria-label="Apply date filter"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilterModal;
