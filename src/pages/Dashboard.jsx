import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaFilter, FaDownload, FaEye, FaEdit, FaTimes, FaSearch, FaTrashAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { format, parseISO, startOfToday, endOfToday, startOfYesterday, endOfYesterday, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import assets from '../assets/assests';
import logo from '../assets/logo.png';
import autoTable from 'jspdf-autotable';
import BranchFilterModal from '../components/modals/BranchFilterModal';
import DateFilterModal from '../components/modals/DateFilterModal';
import DownloadModal from '../components/modals/DownloadModal';
import ApplicationsList from '../components/ApplicationsList';
import PaginationControls from '../components/PaginationControls';

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
  const [lastDownloadTime, setLastDownloadTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredDataForPrint, _setFilteredDataForPrint] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activePreset, setActivePreset] = useState(null);
  const componentRef = useRef();

  const branchOptions = [
    'HQ - Onitsha',
    'Mgbuka',
    'Awka',
    'Asaba',
    'Owerri',
    'Port Harcourt',
    'Lagos Ajah',
    'Lagos Apapa',
    'Enugwu-Ukwu',
    'Abuja',
    'Abia',
    'Nnewi',
    'Enugu',
  ];
  const recordsPerPage = 10;

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 1000); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

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

  useEffect(() => {
    const savedLastDownloadTime = localStorage.getItem('lastDownloadTime');
    if (savedLastDownloadTime) {
      setLastDownloadTime(new Date(savedLastDownloadTime));
    }
  }, []);

  // Fetch all clients for CSV and PDF download and filtering
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
        toast.error('Failed to fetch all clients: ' + (err.message || 'Unknown error'), { id: toastId });
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

  // Fetch paginated applications or search results
  const fetchApplications = useCallback(async () => {
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

      let response;
      if (debouncedSearchQuery.trim()) {
        response = await axios.get(
          `${API_URL}/api/applications/search?query=${encodeURIComponent(debouncedSearchQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            params: {
              page: currentPage,
              per_page: recordsPerPage,
            },
          }
        );
      } else {
        const payload = { page: currentPage, per_page: recordsPerPage };
        response = await axios.post(
          `${API_URL}/api/all_clients`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

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
  }, [currentPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Apply filters to allClients and paginate results
  useEffect(() => {
    let filtered = [...allClients];

    // Apply branch filter
    if (filterBranch) {
      filtered = filtered.filter(item =>
        item.branches && item.branches.toLowerCase().trim() === filterBranch.toLowerCase().trim()
      );
    }

    // Apply date and time filters
    if (filterDateFrom && filterTimeFrom) {
      const filterFrom = new Date(filterDateFrom);
      const [hours, minutes] = filterTimeFrom.split(':').map(Number);
      filterFrom.setHours(hours, minutes, 0, 0);
      filtered = filtered.filter(item => {
        const createdAt = item.created_at ? new Date(parseISO(item.created_at)) : null;
        return createdAt && createdAt >= filterFrom;
      });
    }
    if (filterDateTo && filterTimeTo) {
      const filterTo = new Date(filterDateTo);
      const [hours, minutes] = filterTimeTo.split(':').map(Number);
      filterTo.setHours(hours, minutes, 59, 999);
      filtered = filtered.filter(item => {
        const createdAt = item.created_at ? new Date(parseISO(item.created_at)) : null;
        return createdAt && createdAt <= filterTo;
      });
    }

    // Sort by created_at in descending order
    filtered = filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(parseISO(a.created_at)) : new Date(0);
      const dateB = b.created_at ? new Date(parseISO(b.created_at)) : new Date(0);
      return dateB - dateA;
    });

    // Update total records and pages
    setTotalRecords(filtered.length);
    setTotalPages(Math.ceil(filtered.length / recordsPerPage));

    // Paginate the filtered data
    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + recordsPerPage);

    setFilteredData(debouncedSearchQuery.trim() ? allApplications : paginatedData);
  }, [allClients, allApplications, filterBranch, filterDateFrom, filterTimeFrom, filterDateTo, filterTimeTo, currentPage, debouncedSearchQuery]);

  // Apply branch filter
  const applyBranchFilter = () => {
    if (branchInput && !branchOptions.includes(branchInput)) {
      toast.error('Please select a valid branch.');
      return;
    }
    setFilterBranch(branchInput);
    setBranchFilterModalOpen(false);
    setCurrentPage(1);
    toast.success('Branch filter applied successfully!');
  };

  // Apply date and time filter
  const applyDateFilterWithValues = (dateFrom, timeFrom, dateTo, timeTo) => {
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) {
      toast.error('Please provide both date and time for filtering.');
      return;
    }
    setFilterDateFrom(dateFrom);
    setFilterTimeFrom(timeFrom);
    setFilterDateTo(dateTo);
    setFilterTimeTo(timeTo);
    setDateFilterModalOpen(false);
    setCurrentPage(1);
    toast.success('Date and time filter applied successfully!');
  };

  const applyDateFilter = () => {
    applyDateFilterWithValues(dateFromInput, timeFromInput, dateToInput, timeToInput);
  };

  const handlePresetDateFilter = (preset) => {
    setActivePreset(preset);
    let startDate;
    let endDate;

    const now = new Date();

    switch (preset) {
      case 'Today':
        startDate = startOfToday();
        endDate = endOfToday();
        break;
      case 'Yesterday':
        startDate = startOfYesterday();
        endDate = endOfYesterday();
        break;
      case 'This Week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'Last Week': {
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek);
        endDate = endOfWeek(lastWeek);
        break;
      }
      case 'This Month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'Last Month': {
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      }
      default:
        return;
    }

    // Set the inputs in the modal for visual feedback
    setDateFromInput(startDate);
    setTimeFromInput('00:00');
    setDateToInput(endDate);
    setTimeToInput('23:59');

    // Apply the filter
    applyDateFilterWithValues(startDate, '00:00', endDate, '23:59');
  };

  // Reset all filters
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
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActivePreset(null);
    setCurrentPage(1);
    setDateFilterModalOpen(false);
    setBranchFilterModalOpen(false);
    toast.success('Filters reset successfully!');
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const filterTo = new Date();
    let filterFrom;

    if (lastDownloadTime) {
      filterFrom = new Date(lastDownloadTime);
    } else {
      if (!downloadDateFrom || !downloadTimeFrom) {
        toast.error('Please provide a start date and time for your first download.');
        return;
      }
      filterFrom = new Date(downloadDateFrom);
      const [fromHours, fromMinutes] = downloadTimeFrom.split(':').map(Number);
      filterFrom.setHours(fromHours, fromMinutes, 0, 0);
    }

    const filteredForDownload = allClients.filter(item => {
      try {
        const createdDate = item.created_at ? new Date(parseISO(item.created_at)) : null;
        if (!createdDate) return false;
        return createdDate >= filterFrom && createdDate <= filterTo;
      } catch (error) {
        console.error('Error parsing date for item:', item, error);
        return false;
      }
    });

    if (filteredForDownload.length === 0) {
      toast.error('No new records found for the selected period.');
      return;
    }

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
      'Land Price',
      'Branch',
    ];

    const rows = sortedForDownload.map(item => [
      item.client_name || '',
      item.state_of_origin || '',
      item.lga || '',
      item.site_location || '',
      item.number_of_plot || '',
      item.plot_number || '',
      item.land_price || '',
      item.branches || '',
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

    const now = new Date();
    setLastDownloadTime(now);
    localStorage.setItem('lastDownloadTime', now.toISOString());
    setDownloadModalOpen(false);
    toast.success('CSV downloaded successfully!');
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    const filterTo = new Date();
    let filterFrom;

    if (lastDownloadTime) {
      filterFrom = new Date(lastDownloadTime);
    } else {
      if (!downloadDateFrom || !downloadTimeFrom) {
        toast.error('Please provide a start date and time for your first download.');
        return;
      }
      filterFrom = new Date(downloadDateFrom);
      const [fromHours, fromMinutes] = downloadTimeFrom.split(':').map(Number);
      filterFrom.setHours(fromHours, fromMinutes, 0, 0);
    }

    const filteredForDownload = allClients.filter((item) => {
      try {
        const createdDate = item.created_at ? new Date(parseISO(item.created_at)) : null;
        if (!createdDate) return false;
        return createdDate >= filterFrom && createdDate <= filterTo;
      } catch (error) {
        console.error("Error parsing date for item:", item, error);
        return false;
      }
    });

    if (filteredForDownload.length === 0) {
      toast.error("No new records found for the selected period.");
      return;
    }

    const sortedForDownload = filteredForDownload.sort((a, b) => {
      const dateA = a.created_at ? new Date(parseISO(a.created_at)) : new Date(0);
      const dateB = b.created_at ? new Date(parseISO(b.created_at)) : new Date(0);
      return dateB - dateA;
    });

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPosition = margin;

      pdf.addImage(logo, "PNG", margin, yPosition, 30, 30);
      yPosition += 35;

      pdf.setFontSize(18);
      pdf.text("Client Records", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(
        `(${format(new Date(filterFrom), "dd/MM/yyyy HH:mm")} - ${format(
          new Date(filterTo),
          "dd/MM/yyyy HH:mm"
        )})`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 15;

      const tableHead = [
        ["S/N", "Client Name", "State of Origin", "LGA", "Property Name", "No. of Plot(s)", "Plot No(s)", "Land Price", "Branch"],
      ];

      const tableBody = sortedForDownload.map((item, index) => [
        index + 1,
        item.client_name || "N/A",
        item.state_of_origin || "N/A",
        item.lga || "N/A",
        item.site_location || "N/A",
        item.number_of_plot || "N/A",
        item.plot_number || "N/A",
        item.land_price || "N/A",
        item.branches || "N/A",
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: tableHead,
        body: tableBody,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
        },
        headStyles: {
          fillColor: [47, 83, 24],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 10 }, // S/N
          1: { cellWidth: 35 }, // Client Name
          2: { cellWidth: 17.5 }, // State of Origin
          3: { cellWidth: 17.5 }, // LGA
          4: { cellWidth: 35 }, // Property Name
          5: { cellWidth: 15 }, // No. of Plot(s)
          6: { cellWidth: 15 }, // Plot No(s)
          7: { cellWidth: 17.5 }, // Land Price
          8: { cellWidth: 17.5 }, // Branch
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: margin },
      });

      pdf.save(`clients_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`);
      
      const now = new Date();
      setLastDownloadTime(now);
      localStorage.setItem('lastDownloadTime', now.toISOString());
      setDownloadModalOpen(false);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF: " + (error.message || "Unknown error"));
    }
  };

  // Calculate pagination numbers to display
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage === 1) {
      pages.push(1, 2, 3);
    } else if (currentPage === totalPages) {
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(currentPage - 1, currentPage, currentPage + 1);
    }
    return pages;
  };

  const handleDelete = async (id) => {
    if (!id) return;

    const toastId = toast.loading('Deleting entry...');
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to perform this action.', { id: toastId });
        window.location.href = '/login';
        setIsDeleting(false);
        return;
      }

      const response = await axios.delete(`${API_URL}/api/applications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 204) {
        toast.success('Client entry deleted successfully!', { id: toastId });
        
        setAllClients(prevClients => prevClients.filter(client => client.id !== id));

        if (filteredData.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchApplications();
        }
      } else {
        toast.error(`Failed to delete client. Status: ${response.status}`, { id: toastId });
      }

    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Failed to delete client: ' + (err.response?.data?.message || err.message || 'Unknown error'), { id: toastId });
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-0 md:p-5">
      <div className="mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-5 w-full py-8 transition-all duration-300">
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-secClr border-t-transparent"></div>
          </div>
        )}
        {!loading && (
          <>
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center md:justify-between mb-4 md:mb-6 border-b border-gray-200 pb-2 md:pb-4">
              {/* Logo + Title */}
              <div className="flex items-center gap-2 md:gap-3">
                <img
                  src={assets.logo}
                  className="w-8 h-8 md:w-10 md:h-10"
                  alt="Logo"
                />
                <h1 className="text-lg md:text-2xl font-extrabold text-gray-900">
                  Dashboard
                </h1>
              </div>

              {/* Search + Buttons */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full lg:w-[65%]">
                {/* Search */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secClr text-sm md:text-base"
                    aria-label="Search clients"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                </div>

                {/* Buttons wrapper */}
                <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
                  {/* Branch + Filter row (sm only) */}
                  <div className="flex flex-row gap-2 md:gap-3 w-full md:w-auto">
                    {/* Branch Button */}
                    <button
                      onClick={() => setBranchFilterModalOpen(true)}
                      className="flex items-center justify-center flex-1 px-4 py-2.5 text-sm bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-sm"
                    >
                      <FaFilter className="mr-2 w-4 h-4" />
                      Branch
                    </button>

                    {/* Filter Button */}
                    <button
                      onClick={() => setDateFilterModalOpen(true)}
                      className="flex items-center justify-center flex-1 px-4 py-2.5 text-sm bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-sm"
                    >
                      <FaFilter className="mr-2 w-4 h-4" />
                      Filter
                    </button>
                  </div>

                  {/* Download Button (goes under on sm, inline on md) */}
                  <button
                    onClick={() => setDownloadModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2.5 text-sm bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 transition duration-300 shadow-sm w-full md:w-auto"
                  >
                    <FaDownload className="mr-2 w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

            </div>


            {/* Client List (Cards on mobile, Table on md+) */}
            <ApplicationsList
              filteredData={filteredData}
              currentPage={currentPage}
              recordsPerPage={recordsPerPage}
              isDeleting={isDeleting}
              handleDelete={handleDelete}
            />

            {/* Pagination */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              getPageNumbers={getPageNumbers}
              totalRecords={totalRecords}
              filteredData={filteredData}
            />

            {/* Hidden Print Section for PDF */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
              <div ref={componentRef} style={{ padding: '20mm', width: '190mm', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10mm' }}>
                  <img src={assets.logo} style={{ width: '30mm', height: '30mm', marginRight: '5mm' }} alt="Logo" />
                  <h2 style={{ fontSize: '18px', textAlign: 'center' }}>
                    Client Records
                    {downloadDateFrom && downloadTimeFrom && downloadDateTo && downloadTimeTo &&
                      ` (${format(new Date(downloadDateFrom), 'dd/MM/yyyy')} ${downloadTimeFrom} - ${format(new Date(downloadDateTo), 'dd/MM/yyyy')} ${downloadTimeTo})`}
                  </h2>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left' }}>Client Name</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left' }}>State of Origin</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left' }}>LGA</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left' }}>Property Name</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left' }}>Number of Plot(s)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left' }}>Plot No(s)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left' }}>Land Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDataForPrint.map((item, index) => (
                      <tr key={item.id || index}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.client_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.state_of_origin || 'N/A'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.lga || 'N/A'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.site_location || 'N/A'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.number_of_plot || 'N/A'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.plot_number || 'N/A'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.land_price || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Branch Filter Modal */}
        <BranchFilterModal
          isOpen={branchFilterModalOpen}
          onClose={() => setBranchFilterModalOpen(false)}
          branchInput={branchInput}
          onBranchInputChange={setBranchInput}
          branchOptions={branchOptions}
          onReset={resetFilter}
          onApply={applyBranchFilter}
        />

        {/* Date and Time Filter Modal */}
        <DateFilterModal
          isOpen={dateFilterModalOpen}
          onClose={() => setDateFilterModalOpen(false)}
          dateFromInput={dateFromInput}
          onDateFromChange={(date) => { setDateFromInput(date); setActivePreset(null); }}
          timeFromInput={timeFromInput}
          onTimeFromChange={(e) => { setTimeFromInput(e.target.value); setActivePreset(null); }}
          dateToInput={dateToInput}
          onDateToChange={(date) => { setDateToInput(date); setActivePreset(null); }}
          timeToInput={timeToInput}
          onTimeToChange={(e) => { setTimeToInput(e.target.value); setActivePreset(null); }}
          onReset={resetFilter}
          onApply={applyDateFilter}
          onPresetSelect={handlePresetDateFilter}
          activePreset={activePreset}
        />

        {/* Download Modal */}
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          lastDownloadTime={lastDownloadTime}
          downloadDateFrom={downloadDateFrom}
          onDownloadDateFromChange={setDownloadDateFrom}
          downloadTimeFrom={downloadTimeFrom}
          onDownloadTimeFromChange={setDownloadTimeFrom}
          onDownloadCSV={handleDownloadCSV}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    </div>
  );
};

export default Dashboard;