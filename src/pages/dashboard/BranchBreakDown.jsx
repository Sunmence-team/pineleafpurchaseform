import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSearch, FaCaretDown, FaBars } from "react-icons/fa";
import { TfiReload } from "react-icons/tfi";
import assets from "../../assets/assests";
import logo from "../../assets/logo.png";
import SideNav from "../../components/SideNav";
import ApplicationsList from "../../components/ApplicationsList";
import PaginationControls from "../../components/PaginationControls";
import DownloadAllModal from "../../components/modals/DownloadAllModal";
import BranchDownloadModal from "../../components/modals/BranchDownloadModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useClients } from "../../context/ClientsContext";
import { branchOptions } from "../../lib/branchList";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BranchBreakDown = () => {
  const { branch: branchKey } = useParams();
  const selectedBranch = branchOptions.find((opt) => opt.keyWord === branchKey);
  const branchTitle = selectedBranch ? selectedBranch.title : branchKey;

  const {
    allClients,
    loadingAllClients,
    allClientsFetched,
    fetchAllClients,
    loadingApplications,
    removeClient,
  } = useClients();

  const [fullFilteredData, setFullFilteredData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [openMenu, setOpenMenu] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [branchLastDownload, setBranchLastDownload] = useState(null);
  const [loadingDownloadTime, setLoadingDownloadTime] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // For first-time download
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState("");

  // Download options & Site exclusion states
  const [downloadAllModalOpen, setDownloadAllModalOpen] = useState(false);
  const [branchDownloadModalOpen, setBranchDownloadModalOpen] = useState(false);
  const [excludedSites, setExcludedSites] = useState("");
  const [initialDownloadData, setInitialDownloadData] = useState([]);
  const [filteredDownloadData, setFilteredDownloadData] = useState([]);

  const fetchLastDownloadTime = useCallback(async () => {
    if (!branchKey) return;
    setLoadingDownloadTime(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${API_URL}/api/last/download-date?name=${branchKey}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.data && response.data.data.updated_at) {
        setBranchLastDownload(response.data.data.updated_at);
      } else {
        setBranchLastDownload(null);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setBranchLastDownload(null);
      } else {
        console.error("Error fetching branch last download time:", error);
      }
    } finally {
      setLoadingDownloadTime(false);
    }
  }, [branchKey]);

  useEffect(() => {
    // Initial fetch if not already done
    if (!allClientsFetched) {
      fetchAllClients();
    }
    fetchLastDownloadTime();
    // Reset view state when branch changes
    setCurrentPage(1);
    setSearchQuery("");
    setDebouncedSearchQuery("");
  }, [fetchAllClients, allClientsFetched, fetchLastDownloadTime, branchKey]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    let data = allClients.filter((item) => item.branches === branchTitle);

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          (item.client_name &&
            item.client_name.toLowerCase().includes(query)) ||
          (item.email && item.email.toLowerCase().includes(query)) ||
          (item.mobile_number && item.mobile_number.includes(query)),
      );
    }

    setFullFilteredData(data);
  }, [allClients, branchTitle, debouncedSearchQuery]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginated = fullFilteredData.slice(
      startIndex,
      startIndex + recordsPerPage
    );
    setPaginatedData(paginated);
  }, [fullFilteredData, currentPage, recordsPerPage]);

  useEffect(() => {
    if (branchDownloadModalOpen) {
      let filterFrom;

      if (branchLastDownload) {
        filterFrom = new Date(branchLastDownload);
      } else {
        if (!startDate || !startTime) {
          setInitialDownloadData([]);
          setFilteredDownloadData([]);
          return;
        }
        filterFrom = new Date(startDate);
        const [fromHours, fromMinutes] = startTime.split(":").map(Number);
        filterFrom.setHours(fromHours, fromMinutes, 0, 0);
      }

      const data = allClients.filter((item) => {
        if (item.branches !== branchTitle) return false;
        const createdDate = item.created_at
          ? new Date(parseISO(item.created_at))
          : null;
        if (!createdDate) return false;
        return createdDate >= filterFrom;
      });
      setInitialDownloadData(data);
      setFilteredDownloadData(data);
    }
  }, [
    branchDownloadModalOpen,
    allClients,
    branchTitle,
    branchLastDownload,
    startDate,
    startTime,
  ]);

  useEffect(() => {
    const sitesToExclude = excludedSites
      .split(",")
      .map((site) => site.trim().toLowerCase())
      .filter(Boolean);

    const filtered = initialDownloadData.filter((item) => {
      const siteLocationLower = item.site_location?.toLowerCase() || "";
      const siteMatch =
        sitesToExclude.length > 0 &&
        sitesToExclude.some((excludedSite) =>
          siteLocationLower.includes(excludedSite)
        );
      return !siteMatch;
    });

    setFilteredDownloadData(filtered);
  }, [excludedSites, initialDownloadData]);

  useEffect(() => {
    if (downloadAllModalOpen || branchDownloadModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [downloadAllModalOpen, branchDownloadModalOpen]);

  const updateDownloadTime = async (downloadTime) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_URL}/api/last/download-date`,
        { name: branchKey, date: format(downloadTime, "yyyy-MM-dd HH:mm:ss") },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBranchLastDownload(downloadTime.toISOString());
    } catch (error) {
      console.error("Error updating download time:", error);
    }
  };

  const generateCSV = (data, filename) => {
    const headers = [
      "Client Name", "State of Origin", "LGA", "Property Name",
      "Number of Plot(s)", "Plot No(s)", "Land Price", "Branch",
    ];

    const rows = data.map((item) =>
      [
        item.client_name || "",
        item.state_of_origin || "",
        item.lga || "",
        item.site_location || "",
        item.number_of_plot || "",
        item.plot_number || "",
        item.land_price || "",
        item.branches || "",
      ].map((field) => `"${String(field).replace(/"/g, '""')}"`),
    );

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (data, filename, title, filterFrom = null, downloadStartTime = null) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 15;

    pdf.addImage(logo, "PNG", 15, yPosition, 30, 30);
    yPosition += 35;

    pdf.setFontSize(18);
    pdf.text(title, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    if (filterFrom && downloadStartTime) {
      pdf.setFontSize(12);
      pdf.text(`(${format(filterFrom, "dd/MM/yyyy HH:mm")} - ${format(downloadStartTime, "dd/MM/yyyy HH:mm")})`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;
    }

    const tableHead = [
      ["S/N", "Client Name", "State of Origin", "LGA", "Property Name", "No. of Plot(s)", "Plot No(s)", "Land Price", "Branch"]
    ];
    const tableBody = data.map((item, index) => [
      index + 1,
      item.client_name || "N/A",
      item.state_of_origin || "N/A",
      item.lga || "N/A",
      item.site_location || "N/A",
      item.number_of_plot || "N/A",
      item.plot_number || "N/A",
      item.land_price ? item.land_price.toLocaleString("en-NG") : "N/A",
      item.branches || "N/A",
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: tableHead,
      body: tableBody,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 2, halign: "center", valign: "middle" },
      headStyles: { fillColor: [47, 83, 24], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: { 
        0: { cellWidth: 8 }, 
        1: { cellWidth: 30 }, 
        2: { cellWidth: 20 }, 
        3: { cellWidth: 20 }, 
        4: { cellWidth: 30 }, 
        5: { cellWidth: 12 }, 
        6: { cellWidth: 15 }, 
        7: { cellWidth: 20 }, 
        8: { cellWidth: 25 } 
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin },
    });

    pdf.save(filename);
  };

  const onModalCloseCleanup = () => {
    setBranchDownloadModalOpen(false);
    setStartDate(null);
    setStartTime("");
    setExcludedSites("");
    setInitialDownloadData([]);
    setFilteredDownloadData([]);
  };

  const handleDownloadAllCSV = () => {
    const data = [...fullFilteredData].sort((a, b) => {
      const dateA = a.created_at ? new Date(parseISO(a.created_at)) : new Date(0);
      const dateB = b.created_at ? new Date(parseISO(b.created_at)) : new Date(0);
      return dateB - dateA;
    });

    if (data.length === 0) return toast.error("No records to download");

    const filename = `all_records_${branchKey}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    generateCSV(data, filename);
    setDownloadAllModalOpen(false);
    toast.success("CSV downloaded successfully!");
  };

  const handleDownloadAllPDF = () => {
    const data = [...fullFilteredData].sort((a, b) => {
      const dateA = a.created_at ? new Date(parseISO(a.created_at)) : new Date(0);
      const dateB = b.created_at ? new Date(parseISO(b.created_at)) : new Date(0);
      return dateB - dateA;
    });

    if (data.length === 0) return toast.error("No records to download");

    const filename = `all_records_${branchKey}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
    generatePDF(data, filename, `All Records - ${branchTitle}`);
    setDownloadAllModalOpen(false);
    toast.success("PDF downloaded successfully!");
  };

  const handleDownloadNewCSV = () => {
    const downloadStartTime = new Date();
    const data = [...filteredDownloadData].sort((a, b) => {
      const dateA = a.created_at ? new Date(parseISO(a.created_at)) : new Date(0);
      const dateB = b.created_at ? new Date(parseISO(b.created_at)) : new Date(0);
      return dateB - dateA;
    });

    if (data.length === 0) return toast.error("No new records to download");

    const filename = `new_records_${branchKey}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    generateCSV(data, filename);
    updateDownloadTime(downloadStartTime);
    onModalCloseCleanup();
    toast.success("CSV downloaded successfully!");
  };

  const handleDownloadNewPDF = () => {
    const downloadStartTime = new Date();
    const data = [...filteredDownloadData].sort((a, b) => {
      const dateA = a.created_at ? new Date(parseISO(a.created_at)) : new Date(0);
      const dateB = b.created_at ? new Date(parseISO(b.created_at)) : new Date(0);
      return dateB - dateA;
    });

    if (data.length === 0) return toast.error("No new records to download");

    let filterFrom;
    if (branchLastDownload) {
      filterFrom = new Date(branchLastDownload);
    } else {
      if (startDate && startTime) {
        filterFrom = new Date(startDate);
        const [hours, minutes] = startTime.split(":").map(Number);
        filterFrom.setHours(hours, minutes, 0, 0);
      }
    }

    const filename = `new_records_${branchKey}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
    generatePDF(data, filename, `New Records - ${branchTitle}`, filterFrom, downloadStartTime);
    updateDownloadTime(downloadStartTime);
    onModalCloseCleanup();
    toast.success("PDF downloaded successfully!");
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const toastId = toast.loading("Deleting entry...");
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to perform this action.", { id: toastId });
        setIsDeleting(false);
        return;
      }

      const response = await axios.delete(`${API_URL}/api/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (response.status === 200 || response.status === 204) {
        toast.success("Client entry deleted successfully!", { id: toastId });
        removeClient(id);
        if (paginatedData.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error(`Failed to delete client. Status: ${response.status}`, { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client: " + (error.response?.data?.message || error.message || "Unknown error"), { id: toastId });
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.info("Session expired!. Logging out...");
        setTimeout(() => localStorage.removeItem("token"), 500);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(fullFilteredData.length / recordsPerPage);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SideNav
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        branches={branchOptions}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center bg-white shadow-sm z-10 w-full px-4 md:px-6 lg:px-8 py-4">
          <button
            onClick={() => setOpenMenu(true)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <img src={assets.logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-gray-900 ps-6 truncate">
            {branchTitle} Branch
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full space-y-6">
            {(loadingAllClients ||
             loadingApplications) && (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-secClr border-t-transparent"></div>
              </div>
            )}
            
            {!(loadingAllClients || loadingApplications) && (
              <>
                {/* Action Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in this branch..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secClr outline-none"
                      />
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <button
                        onClick={() => fetchAllClients(true)}
                        className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                        title="Refresh Data"
                      >
                        <TfiReload
                          className={loadingAllClients ? "animate-spin" : ""}
                        />
                      </button>

                      <div className="relative flex-1 md:flex-none">
                        <button
                          onClick={() =>
                            setShowDownloadOptions(!showDownloadOptions)
                          }
                          className="w-full md:w-auto px-6 py-2.5 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/90 flex items-center justify-center gap-2"
                        >
                          Download <FaCaretDown />
                        </button>

                        {showDownloadOptions && (
                          <div className="absolute right-0 mt-2 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-sm font-semibold overflow-hidden">
                            <button
                              onClick={() => {
                                if (!allClientsFetched) fetchAllClients();
                                setShowDownloadOptions(false);
                                setBranchDownloadModalOpen(true);
                              }}
                              className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition"
                            >
                              Download new records
                            </button>
                            <button
                              onClick={() => {
                                if (!allClientsFetched) fetchAllClients();
                                setShowDownloadOptions(false);
                                setDownloadAllModalOpen(true);
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 transition"
                            >
                              Download all records
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-secClr/20">
                    <p className="text-sm text-gray-500 font-medium">
                      Total Entries
                    </p>
                    <h3 className="text-2xl font-bold">{fullFilteredData.length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-secClr/20">
                    <p className="text-sm text-gray-500 font-medium">
                      Last Download
                    </p>
                    <h3 className="text-lg font-bold">
                      {branchLastDownload
                        ? format(parseISO(branchLastDownload), "dd MMM yyyy, HH:mm")
                        : "Never"}
                    </h3>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-secClr/20">
                    <p className="text-sm text-gray-500 font-medium">
                      Selected Branch
                    </p>
                    <h3 className="text-lg font-bold">{branchTitle}</h3>
                  </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <ApplicationsList
                    filteredData={paginatedData}
                    currentPage={currentPage}
                    recordsPerPage={recordsPerPage}
                    isDeleting={isDeleting}
                    handleDelete={handleDelete}
                  />
                </div>

                {/* Pagination */}
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  totalRecords={fullFilteredData.length}
                  filteredData={paginatedData}
                  getPageNumbers={() => {
                    const pages = [];
                    if (totalPages <= 3) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else if (currentPage === 1) {
                      pages.push(1, 2, 3);
                    } else if (currentPage === totalPages) {
                      pages.push(totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(currentPage - 1, currentPage, currentPage + 1);
                    }
                    return pages;
                  }}
                />
              </>
            )}
          </div>
        </main>
      </div>

      <DownloadAllModal
        isLoadingAllclients={loadingAllClients}
        isOpen={downloadAllModalOpen}
        onClose={() => setDownloadAllModalOpen(false)}
        onDownloadCSV={handleDownloadAllCSV}
        onDownloadPDF={handleDownloadAllPDF}
      />

      <BranchDownloadModal
        isOpen={branchDownloadModalOpen}
        onClose={onModalCloseCleanup}
        lastDownloadTime={branchLastDownload}
        startDate={startDate}
        setStartDate={setStartDate}
        startTime={startTime}
        setStartTime={setStartTime}
        excludedSites={excludedSites}
        onExcludeChange={setExcludedSites}
        initialCount={initialDownloadData.length}
        excludedCount={initialDownloadData.length - filteredDownloadData.length}
        remainingCount={filteredDownloadData.length}
        onDownloadCSV={handleDownloadNewCSV}
        onDownloadPDF={handleDownloadNewPDF}
        branchTitle={branchTitle}
      />
    </div>
  );
};

export default BranchBreakDown;
