import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SiteDownloadModal = ({
  isOpen,
  onClose,
  onDownload,
}) => {
  const [siteLocation, setSiteLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [debouncedSiteLocation, setDebouncedSiteLocation] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSiteLocation(siteLocation);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [siteLocation]);

  useEffect(() => {
    const fetchDebouncedSites = async () => {
      if (`debouncedSiteLocation`) {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`${API_URL}/api/applications/search?query=${debouncedSiteLocation}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          // console.log("response", response)

          if (response.status === 200) {
            setResults(response.data.data || []);
          }
        } catch (error) {
          console.error('Error searching by site location:', error);
          setResults([]);
        } finally {
          setLoading(false);
        };
      }
    }
    fetchDebouncedSites()
  }, [debouncedSiteLocation]);

  if (!isOpen) return null;

  const handleDownload = (format) => {
    onDownload(format, results);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 md:p-8 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full lg:w-[40%] md:w-[75%] shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Download by Site Location</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close download modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 md:gap-4 mb-6">
          <input
            type="text"
            value={siteLocation}
            onChange={(e) => setSiteLocation(e.target.value)}
            placeholder="Enter site location..."
            className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
          />
          {loading && <p className="text-sm text-gray-500">Searching...</p>}
          {!loading && debouncedSiteLocation && (
            <p className="text-sm text-gray-500">{results.length} records found.</p>
          )}
        </div>

        <div className="md:flex grid grid-cols-2 justify-end gap-6 md:gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDownload('csv')}
            disabled={results.length === 0}
            className="px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto disabled:bg-gray-400"
          >
            Download as CSV
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={results.length === 0}
            className="col-span-2 px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto disabled:bg-gray-400"
          >
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteDownloadModal;