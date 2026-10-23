import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

const SiteDownloadModal = ({
  isOpen,
  onClose,
  onDownload,
  onSiteSelect,
  siteLastDownload,
  siteStartDate,
  setSiteStartDate,
  siteStartTime,
  setSiteStartTime,
  newRecordsCount,
  loadingSiteTime,
  onModalCloseCleanup,
  siteLocation,
  onSiteLocationChange,
  debouncedSiteLocation,
}) => {
  useEffect(() => {
    if (!isOpen) {
      onSiteLocationChange("");
      onModalCloseCleanup();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedSiteLocation) {
      onSiteSelect(debouncedSiteLocation);
    }
  }, [debouncedSiteLocation]);

  if (!isOpen) return null;

  const handleDownload = (format) => {
    onDownload(format, siteLocation);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 md:p-8 p-4">
      <div className="bg-white rounded-2xl p-4 md:p-6 w-full lg:w-[40%] md:w-[75%] shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Download by Site Location
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 md:gap-4 mb-6">
          <input
            type="text"
            value={siteLocation}
            onChange={(e) => onSiteLocationChange(e.target.value)}
            placeholder="Enter site location to search..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {loadingSiteTime ? (
            <p className="text-sm text-gray-500">
              Searching for download history...
            </p>
          ) : (
            debouncedSiteLocation && (
              <>
                {siteLastDownload ? (
                  <>
                    <p className="text-sm text-gray-500 mt-1">
                      Last download for this site was on:{" "}
                      <span className="font-semibold text-primary">
                        {format(new Date(siteLastDownload), "dd/MM/yyyy HH:mm")}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Found {newRecordsCount} new records.
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-2">
                    <p className="text-center text-sm text-gray-600 bg-yellow-100 p-3 rounded-lg">
                      First time downloading for this site. Please set a start
                      date and time.
                    </p>
                    <DatePicker
                      selected={siteStartDate}
                      onChange={setSiteStartDate}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select start date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="time"
                      value={siteStartTime}
                      onChange={(e) => setSiteStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </>
            )
          )}
        </div>

        <div className="md:flex grid grid-cols-2 justify-end gap-6 md:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDownload("csv")}
            disabled={!debouncedSiteLocation || loadingSiteTime}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold disabled:bg-gray-400"
          >
            Download CSV
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={!debouncedSiteLocation || loadingSiteTime}
            className="col-span-2 md:col-span-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold disabled:bg-gray-400"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteDownloadModal;
