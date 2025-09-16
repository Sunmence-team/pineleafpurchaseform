import React, { useState, useEffect } from 'react';
import { FaFilter, FaDownload, FaEye, FaEdit, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import assets from '../assets/assests';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [allClients, setAllClients] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterTimeFrom, setFilterTimeFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);
  const [filterTimeTo, setFilterTimeTo] = useState(null);
  const [filterBranch, setFilterBranch] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [dateFromInput, setDateFromInput] = useState(null);
  const [timeFromInput, setTimeFromInput] = useState(null);
  const [dateToInput, setDateToInput] = useState(null);
  const [timeToInput, setTimeToInput] = useState(null);
  const [dateFilterModalOpen, setDateFilterModalOpen] = useState(false);
  const [branchFilterModalOpen, setBranchFilterModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadDateFrom, setDownloadDateFrom] = useState(null);
  const [downloadTimeFrom, setDownloadTimeFrom] = useState(null);
  const [downloadDateTo, setDownloadDateTo] = useState(null);
  const [downloadTimeTo, setDownloadTimeTo] = useState(null);
  const [loading, setLoading] = useState(false);

  const branchOptions = ['Lagos', 'Abuja', 'Port Harcourt', 'Enugu'];
  const recordsPerPage = 10;

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (dateFilterModalOpen || branchFilterModalOpen || downloadModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [dateFilterModalOpen, branchFilterModalOpen, downloadModalOpen]);

  // Fetch all clients for CSV download and filtering
  useEffect(() => {
    const fetchAllClients = async () => {
      const toastId = toast.loading('Loading all clients...');
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view the dashboard.', { id: toastId });
          window.location.href = '/login';
          setLoading(false);
          return;
        }

        let allData = [];
        let page = 1;
        let lastPage = 1;

        do {
          const payload = { page, per_page: 10 };
          const response = await axios.post(
            `${API_URL}/api/all_clients`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          let applications = [];
          let meta = {};
          if (response.data && Array.isArray(response.data.data)) {
            applications = response.data.data;
            meta = response.data.meta || {};
          } else if (response.data && Array.isArray(response.data.applications)) {
            applications = response.data.applications;
            meta = response.data.meta || {};
          } else if (response.data && Array.isArray(response.data.clients)) {
            applications = response.data.clients;
            meta = response.data.meta || {};
          } else if (Array.isArray(response.data)) {
            applications = response.data;
          } else {
            console.error('Unexpected response structure:', response.data);
            throw new Error('Response data is not an array or does not contain an array of clients');
          }

          const mappedApplications = applications.map(item => ({
            id: item.id || '',
            client_name: item.client_name || '',
            email: item.email || '',
            mobile_number: item.mobile_number || '',
            branches: item.branches || '',
            created_at: item.created_at || '',
            address: item.address || '',
            country: item.country || '',
            declaration_date: item.declaration_date || '',
            declaration_name: item.declaration_name || '',
            dob: item.dob || '',
            first_name: item.first_name || '',
            first_name_of_spouse: item.first_name_of_spouse || '',
            gender: item.gender || '',
            land_price: item.land_price || '',
            language: item.language || '',
            last_name: item.last_name || '',
            last_name_of_spouse: item.last_name_of_spouse || '',
            lga: item.lga || '',
            marital_status: item.marital_status || '',
            middle_name: item.middle_name || '',
            middle_name_of_spouse: item.middle_name_of_spouse || '',
            nationality: item.nationality || '',
            next_of_kin_address: item.next_of_kin_address || '',
            next_of_kin_email: item.next_of_kin_email || '',
            next_of_kin_full_name: item.next_of_kin_full_name || '',
            next_of_kin_mobile_number: item.next_of_kin_mobile_number || '',
            number_of_plot: item.number_of_plot || '',
            occupation: item.occupation || '',
            personal_picture: item.personal_picture || '',
            plot_number: item.plot_number || '',
            referral_date: item.referral_date || '',
            referral_email: item.referral_email || '',
            referral_name: item.referral_name || '',
            referral_number: item.referral_number || '',
            signature: item.signature || '',
            site_location: item.site_location || '',
            state_of_origin: item.state_of_origin || '',
            telephone_number: item.telephone_number || '',
            title: item.title || '',
            title_of_spouse: item.title_of_spouse || '',
            updated_at: item.updated_at || '',
          }));

          allData = [...allData, ...mappedApplications];
          lastPage = meta.last_page || 1;
          page += 1;
        } while (page <= lastPage);

        setAllClients(allData);
        toast.success('All clients loaded successfully!', { id: toastId });
      } catch (err) {
        console.error('Error fetching all clients:', err);
        toast.error('Failed to fetch all clients for download: ' + (err.message || 'Unknown error'), { id: toastId });
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllClients();
  }, []);

  // Fetch paginated applications for consistency
  useEffect(() => {
    const fetchApplications = async () => {
      const toastId = toast.loading('Loading applications...');
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view the dashboard.', { id: toastId });
          window.location.href = '/login';
          setLoading(false);
          return;
        }

        const payload = { page: currentPage, per_page: 10 };
        const response = await axios.post(
          `${API_URL}/api/all_clients`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        let applications = [];
        let meta = {};
        if (response.data && Array.isArray(response.data.data)) {
          applications = response.data.data;
          meta = response.data.meta || {};
        } else if (response.data && Array.isArray(response.data.applications)) {
          applications = response.data.applications;
          meta = response.data.meta || {};
        } else if (response.data && Array.isArray(response.data.clients)) {
          applications = response.data.clients;
          meta = response.data.meta || {};
        } else if (Array.isArray(response.data)) {
          applications = response.data;
        } else {
          console.error('Unexpected response structure:', response.data);
          throw new Error('Response data is not an array or does not contain an array of clients');
        }

        const mappedApplications = applications.map(item => ({
          id: item.id || '',
          client_name: item.client_name || '',
          email: item.email || '',
          mobile_number: item.mobile_number || '',
          branches: item.branches || '',
          created_at: item.created_at || '',
          address: item.address || '',
          country: item.country || '',
          declaration_date: item.declaration_date || '',
          declaration_name: item.declaration_name || '',
          dob: item.dob || '',
          first_name: item.first_name || '',
          first_name_of_spouse: item.first_name_of_spouse || '',
          gender: item.gender || '',
          land_price: item.land_price || '',
          language: item.language || '',
          last_name: item.last_name || '',
          last_name_of_spouse: item.last_name_of_spouse || '',
          lga: item.lga || '',
          marital_status: item.marital_status || '',
          middle_name: item.middle_name || '',
          middle_name_of_spouse: item.middle_name_of_spouse || '',
          nationality: item.nationality || '',
          next_of_kin_address: item.next_of_kin_address || '',
          next_of_kin_email: item.next_of_kin_email || '',
          next_of_kin_full_name: item.next_of_kin_full_name || '',
          next_of_kin_mobile_number: item.next_of_kin_mobile_number || '',
          number_of_plot: item.number_of_plot || '',
          occupation: item.occupation || '',
          personal_picture: item.personal_picture || '',
          plot_number: item.plot_number || '',
          referral_date: item.referral_date || '',
          referral_email: item.referral_email || '',
          referral_name: item.referral_name || '',
          referral_number: item.referral_number || '',
          signature: item.signature || '',
          site_location: item.site_location || '',
          state_of_origin: item.state_of_origin || '',
          telephone_number: item.telephone_number || '',
          title: item.title || '',
          title_of_spouse: item.title_of_spouse || '',
          updated_at: item.updated_at || '',
        }));

        setAllApplications(mappedApplications);
        setTotalPages(meta.last_page || 1);
        setTotalRecords(meta.total || applications.length);
        toast.success('Applications loaded successfully!', { id: toastId });
      } catch (err) {
        console.error('Error fetching applications:', err);
        toast.error('Failed to fetch applications: ' + (err.message || 'Unknown error'), { id: toastId });
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentPage]);

  // Apply filters to allClients and paginate results
  useEffect(() => {
    let filtered = allClients;

    if (filterBranch) {
      filtered = filtered.filter(item =>
        item.branches.toLowerCase() === filterBranch.toLowerCase()
      );
    }
    if (filterDateFrom && filterTimeFrom) {
      const filterFrom = new Date(filterDateFrom);
      const [hours, minutes] = filterTimeFrom.split(':').map(Number);
      filterFrom.setHours(hours, minutes);
      filtered = filtered.filter(item => {
        const createdAt = item.created_at ? new Date(parseISO(item.created_at)) : null;
        return createdAt && createdAt >= filterFrom;
      });
    }
    if (filterDateTo && filterTimeTo) {
      const filterTo = new Date(filterDateTo);
      const [hours, minutes] = filterTimeTo.split(':').map(Number);
      filterTo.setHours(hours, minutes);
      filtered = filtered.filter(item => {
        const createdAt = item.created_at ? new Date(parseISO(item.created_at)) : null;
        return createdAt && createdAt <= filterTo;
      });
    }

    // Sort filtered data by created_at in descending order (latest to oldest)
    filtered = filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(parseISO(a.created_at)) : new Date(0);
      const dateB = b.created_at ? new Date(parseISO(b.created_at)) : new Date(0);
      return dateB - dateA;
    });

    setTotalRecords(filtered.length);
    setTotalPages(Math.ceil(filtered.length / recordsPerPage));

    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + recordsPerPage);

    setFilteredData(paginatedData);
  }, [filterBranch, filterDateFrom, filterTimeFrom, filterDateTo, filterTimeTo, allClients, currentPage]);

  // Apply branch filter
  const applyBranchFilter = () => {
    if (branchInput && !branchOptions.includes(branchInput)) {
      toast.error('Invalid branch selected.');
      return;
    }
    setFilterBranch(branchInput);
    setBranchFilterModalOpen(false);
    setCurrentPage(1);
    toast.success('Branch filter applied successfully!');
  };

  // Apply date and time filter
  const applyDateFilter = () => {
    if (!dateFromInput || !timeFromInput || !dateToInput || !timeToInput) {
      toast.error('Please provide both date and time for filtering.');
      return;
    }
    setFilterDateFrom(dateFromInput);
    setFilterTimeFrom(timeFromInput);
    setFilterDateTo(dateToInput);
    setFilterTimeTo(timeToInput);
    setDateFilterModalOpen(false);
    setCurrentPage(1);
    toast.success('Date and time filter applied successfully!');
  };

  // Download CSV
  const handleDownload = () => {
    if (!downloadDateFrom || !downloadTimeFrom || !downloadDateTo || !downloadTimeTo) {
      toast.error("Please provide both date and time for downloading.");
      return;
    }

    const filterFrom = new Date(downloadDateFrom);
    const [fromHours, fromMinutes] = downloadTimeFrom.split(':').map(Number);
    filterFrom.setHours(fromHours, fromMinutes);

    const filterTo = new Date(downloadDateTo);
    const [toHours, toMinutes] = downloadTimeTo.split(':').map(Number);
    filterTo.setHours(toHours, toMinutes);

    const filteredForDownload = allClients.filter(item => {
      try {
        const createdDate = item.created_at ? new Date(parseISO(item.created_at)) : null;
        return createdDate && createdDate >= filterFrom && createdDate <= filterTo;
      } catch (error) {
        console.error('Error parsing date for item:', item, error);
        return false;
      }
    });

    if (filteredForDownload.length === 0) {
      toast.error("No records found for the selected date and time range.");
      return;
    }

    // Sort filtered data for CSV by created_at in descending order
    const sortedForDownload = filteredForDownload.sort((a, b) => {
      const dateA = a.created_at ? new Date(parseISO(a.created_at)) : new Date(0);
      const dateB = b.created_at ? new Date(parseISO(b.created_at)) : new Date(0);
      return dateB - dateA;
    });

    const headers = [
      'Client Name',
      'State of Origin',
      'LGA',
      'Property Name',
      'Number of Plot(s)',
      'Plot No(s)',
    ];

    const rows = sortedForDownload.map(item => [
      item.client_name || '',
      item.state_of_origin || '',
      item.lga || '',
      item.site_location || '',
      item.number_of_plot || '',
      item.plot_number || '',
    ].map(field => `"${String(field).replace(/"/g, '""')}"`));

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `clients_${format(new Date(filterFrom), 'yyyy-MM-dd_HH-mm')}_to_${format(
        new Date(filterTo),
        'yyyy-MM-dd_HH-mm'
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadModalOpen(false);
    toast.success('CSV downloaded successfully!');
  };

  // Reset filter
  const resetFilter = () => {
    setFilterDateFrom(null);
    setFilterTimeFrom(null);
    setFilterDateTo(null);
    setFilterTimeTo(null);
    setFilterBranch('');
    setBranchInput('');
    setDateFromInput(null);
    setTimeFromInput(null);
    setDateToInput(null);
    setTimeToInput(null);
    setCurrentPage(1);
    setDateFilterModalOpen(false);
    setBranchFilterModalOpen(false);
    toast.success('Filters reset successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-2 sm:p-4 md:p-5">
      <div className="mx-auto bg-white rounded-2xl shadow-2xl p-2 sm:p-4 md:p-5 w-full py-8 transition-all duration-300">
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secClr"></div>
          </div>
        )}
        {!loading && (
          <>
            {/* Header */}
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between md:gap-4 mb-4 md:mb-6 border-b border-gray-200 pb-2 md:pb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <img src={assets.logo} className="w-8 h-8 md:w-10 md:h-10" alt="Logo" />
                <h1 className="text-lg md:text-2xl font-extrabold text-gray-900">Dashboard</h1>
              </div>
              <div className="flex gap-2 md:gap-3 w-full md:w-[40%]">
                <button
                  onClick={() => setBranchFilterModalOpen(true)}
                  className="flex-1 flex items-center justify-center p-3 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md"
                >
                  <FaFilter className="mr-1 w-4 h-4 md:w-5 md:h-5" />
                  Branch
                </button>
                <button
                  onClick={() => setDateFilterModalOpen(true)}
                  className="flex-1 flex items-center justify-center p-3 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md"
                >
                  <FaFilter className="mr-1 w-4 h-4 md:w-5 md:h-5" />
                  Filter
                </button>
                <button
                  onClick={() => setDownloadModalOpen(true)}
                  className="flex-1 flex items-center justify-center p-3 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md"
                >
                  <FaDownload className="mr-1 w-4 h-4 md:w-5 md:h-5" />
                  CSV
                </button>
              </div>
            </div>

            {/* Client List (Cards on mobile, Table on md+) */}
            <div className="space-y-2 md:space-y-0">
              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-4">
                {filteredData.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-600 bg-white rounded-lg shadow-sm border border-gray-200">
                    No records found
                  </div>
                ) : (
                  filteredData.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:bg-gray-50 transition duration-200 overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 break-words">
                            {(currentPage - 1) * recordsPerPage + index + 1}. {item.client_name}
                          </p>
                          <p className="text-xs text-gray-600 break-words">{item.email}</p>
                          <p className="text-xs text-gray-600 break-words">{item.mobile_number}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Link
                            to={`/view-client/${item.id}`}
                            className="p-2 bg-secClr text-white rounded-md hover:bg-secClr/90"
                            aria-label={`View ${item.client_name}`}
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/edit-client/${item.id}`}
                            className="p-2 bg-secClr text-white rounded-md hover:bg-secClr/90"
                            aria-label={`Edit ${item.client_name}`}
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block relative overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="w-full divide-y divide-gray-200 table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">S/N</th>
                      <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">Client Name</th>
                      <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">Phone Number</th>
                      <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-2 md:p-5 text-center text-sm md:text-base text-gray-600">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-secClr/10 transition duration-200">
                          <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">
                            {(currentPage - 1) * recordsPerPage + index + 1}
                          </td>
                          <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base font-medium text-gray-900">{item.client_name}</td>
                          <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">{item.email}</td>
                          <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">{item.mobile_number}</td>
                          <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">
                            <div className="flex space-x-2 md:space-x-3">
                              <Link to={`/view-client/${item.id}`} aria-label={`View ${item.client_name}`}>
                                <FaEye className="text-secClr cursor-pointer w-4 h-4 md:w-5 md:h-5 hover:text-secClr/90" />
                              </Link>
                              <Link to={`/edit-client/${item.id}`} aria-label={`Edit ${item.client_name}`}>
                                <FaEdit className="text-secClr cursor-pointer w-4 h-4 md:w-5 md:h-5 hover:text-secClr/90" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
              <div className="text-sm md:text-base text-gray-600">
                Showing {filteredData.length} of {totalRecords} records
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Previous page"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold transition duration-300 shadow-sm ${currentPage === page ? 'bg-secClr text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Branch Filter Modal */}
        {branchFilterModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Filter by Branch</h3>
                <button
                  onClick={() => setBranchFilterModalOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  aria-label="Close branch filter modal"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-3 md:gap-4 mb-6">
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Branch</label>
                  <select
                    value={branchInput}
                    onChange={e => setBranchInput(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
                    aria-label="Select branch"
                  >
                    <option value="">Select Branch</option>
                    {branchOptions.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 md:gap-3">
                <button
                  onClick={resetFilter}
                  className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
                  aria-label="Reset branch filter"
                >
                  Reset
                </button>
                <button
                  onClick={applyBranchFilter}
                  className="px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto"
                  aria-label="Apply branch filter"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date and Time Filter Modal */}
        {dateFilterModalOpen && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Filter by Date and Time</h3>
                <button
                  onClick={() => setDateFilterModalOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  aria-label="Close date filter modal"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-3 md:gap-4 mb-6">
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Date From</label>
                  <DatePicker
                    selected={dateFromInput}
                    onChange={date => setDateFromInput(date)}
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
                    onChange={e => setTimeFromInput(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
                    aria-label="Select start time"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Date To</label>
                  <DatePicker
                    selected={dateToInput}
                    onChange={date => setDateToInput(date)}
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
                    onChange={e => setTimeToInput(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
                    aria-label="Select end time"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 md:gap-3">
                <button
                  onClick={resetFilter}
                  className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
                  aria-label="Reset date filter"
                >
                  Reset
                </button>
                <button
                  onClick={applyDateFilter}
                  className="px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto"
                  aria-label="Apply date filter"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download Modal */}
        {downloadModalOpen && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Download CSV</h3>
                <button
                  onClick={() => setDownloadModalOpen(false)}
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
                    onChange={date => setDownloadDateFrom(date)}
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
                    onChange={e => setDownloadTimeFrom(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
                    aria-label="Select download start time"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Date To</label>
                  <DatePicker
                    selected={downloadDateTo}
                    onChange={date => setDownloadDateTo(date)}
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
                    onChange={e => setDownloadTimeTo(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base bg-gray-50"
                    aria-label="Select download end time"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 md:gap-3">
                <button
                  onClick={() => setDownloadModalOpen(false)}
                  className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 shadow-md w-full md:w-auto"
                  aria-label="Cancel download"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-2 md:px-4 md:py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-md w-full md:w-auto"
                  aria-label="Download CSV"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;