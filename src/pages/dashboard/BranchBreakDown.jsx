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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useClients } from "../../context/ClientsContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const branchOptions = [
  { keyWord: "HQ_ONI", title: "HQ - Onitsha" },
  { keyWord: "MGB", title: "Mgbuka" },
  { keyWord: "AWKA", title: "Awka" },
  { keyWord: "ASB", title: "Asaba" },
  { keyWord: "OWE", title: "Owerri" },
  { keyWord: "PORT_HAR", title: "Port Harcourt" },
  { keyWord: "LAG_AJAH", title: "Lagos Ajah" },
  { keyWord: "LAG_APP", title: "Lagos Apapa" },
  { keyWord: "ENU_UKW", title: "Enugwu-Ukwu" },
  { keyWord: "ABJ", title: "Abuja" },
  { keyWord: "ABIA", title: "Abia" },
  { keyWord: "NNEWI", title: "Nnewi" },
  { keyWord: "ENUGU", title: "Enugu" },
  { keyWord: "AMUWOODOFLAG", title: "Amuwo odofin Lagos" },
];

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

  // For first-time download
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState("");

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
      "Client Name",
      "State of Origin",
      "LGA",
      "Property Name",
      "Number of Plot(s)",
      "Plot No(s)",
      "Land Price",
      "Branch",
      "Created At",
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
        item.created_at || "",
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

  const generatePDF = (data, filename, title) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 15;

    pdf.addImage(logo, "PNG", 15, yPosition, 30, 30);
    yPosition += 35;

    pdf.setFontSize(18);
    pdf.text(title, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    const tableHead = [
      ["S/N", "Client Name", "Property", "Plots", "Price", "Date"],
    ];
    const tableBody = data.map((item, index) => [
      index + 1,
      item.client_name || "N/A",
      item.site_location || "N/A",
      item.number_of_plot || "N/A",
      item.land_price ? item.land_price.toLocaleString() : "N/A",
      item.created_at ? format(parseISO(item.created_at), "dd/MM/yyyy") : "N/A",
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: tableHead,
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [47, 83, 24] },
    });

    pdf.save(filename);
  };

  const handleDownloadAll = (type) => {
    const data = fullFilteredData;
    if (data.length === 0) return toast.error("No records to download");

    const filename = `all_records_${branchKey}_${format(new Date(), "yyyyMMdd_HHmm")}`;
    if (type === "csv") generateCSV(data, `${filename}.csv`);
    else generatePDF(data, `${filename}.pdf`, `All Records - ${branchTitle}`);

    setShowDownloadOptions(false);
    toast.success("Download started");
  };

  const handleDownloadNew = (type) => {
    const downloadStartTime = new Date();
    let filterFrom;

    if (branchLastDownload) {
      filterFrom = new Date(branchLastDownload);
    } else {
      if (!startDate || !startTime) {
        toast.error(
          "Please select a start date and time for first-time download.",
        );
        return;
      }
      filterFrom = new Date(startDate);
      const [hours, minutes] = startTime.split(":").map(Number);
      filterFrom.setHours(hours, minutes, 0, 0);
    }

    const data = fullFilteredData.filter((item) => {
      const createdDate = item.created_at ? parseISO(item.created_at) : null;
      return createdDate && createdDate >= filterFrom;
    });

    if (data.length === 0)
      return toast.error("No new records found since last download.");

    const filename = `new_records_${branchKey}_${format(new Date(), "yyyyMMdd_HHmm")}`;
    if (type === "csv") generateCSV(data, `${filename}.csv`);
    else generatePDF(data, `${filename}.pdf`, `New Records - ${branchTitle}`);

    updateDownloadTime(downloadStartTime);
    setShowDownloadOptions(false);
    toast.success("Download started");
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
                          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                            <div className="p-3 border-b border-gray-100 bg-gray-50">
                              <p className="text-xs font-bold text-gray-500 uppercase">
                                Download All
                              </p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleDownloadAll("csv")}
                                  className="flex-1 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                >
                                  CSV
                                </button>
                                <button
                                  onClick={() => handleDownloadAll("pdf")}
                                  className="flex-1 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                >
                                  PDF
                                </button>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-bold text-gray-500 uppercase">
                                Download New
                              </p>
                              {branchLastDownload ? (
                                <p className="text-[10px] text-secClr mt-1">
                                  Last:{" "}
                                  {format(
                                    parseISO(branchLastDownload),
                                    "dd/MM HH:mm",
                                  )}
                                </p>
                              ) : (
                                <div className="mt-2 space-y-2">
                                  <DatePicker
                                    selected={startDate}
                                    onChange={setStartDate}
                                    placeholderText="Start Date"
                                    className="w-full text-xs p-1.5 border border-gray-300 rounded"
                                  />
                                  <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full text-xs p-1.5 border border-gray-300 rounded"
                                  />
                                </div>
                              )}
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleDownloadNew("csv")}
                                  className="flex-1 py-1.5 text-xs bg-secClr text-white rounded hover:bg-secClr/90"
                                >
                                  CSV
                                </button>
                                <button
                                  onClick={() => handleDownloadNew("pdf")}
                                  className="flex-1 py-1.5 text-xs bg-secClr text-white rounded hover:bg-secClr/90"
                                >
                                  PDF
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border boder-secClr/20">
                    <p className="text-sm text-gray-500 font-medium">
                      Total Entries
                    </p>
                    <h3 className="text-2xl font-bold">{fullFilteredData.length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border boder-secClr/20">
                    <p className="text-sm text-gray-500 font-medium">
                      Last Download
                    </p>
                    <h3 className="text-lg font-bold">
                      {branchLastDownload
                        ? format(parseISO(branchLastDownload), "dd MMM yyyy, HH:mm")
                        : "Never"}
                    </h3>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border boder-secClr/20">
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
                    isDeleting={false}
                    handleDelete={() => {}}
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
    </div>
  );
};

export default BranchBreakDown;
