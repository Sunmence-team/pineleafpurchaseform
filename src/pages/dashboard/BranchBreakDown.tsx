import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IoIosSearch } from "react-icons/io";
import { TfiReload } from "react-icons/tfi";
import { IoDownloadOutline } from "react-icons/io5";
import { HiOutlineUsers } from "react-icons/hi2";
import { BsClockHistory } from "react-icons/bs";
import { LuBuilding2 } from "react-icons/lu";

import logo from "../../assets/logo.png";
import ReusableTable from "../../utilities/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import DownloadAllModal from "../../components/modals/DownloadAllModal";
import BranchDownloadModal from "../../components/modals/BranchDownloadModal";
import { useClients } from "../../context/ClientsContext";
import { parseSafeDate } from "../../helpers/formatterUtility";
import { branchOptions } from "../../lib/branchList";
import { api } from "../../helpers/api";
import type { TableColumnProps } from "../../lib/interfaces";
import "react-datepicker/dist/react-datepicker.css";
import OverviewCards from "../../components/cards/OverviewCards";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface ClientRecord {
  id: number | string;
  client_name?: string;
  club_name?: string;
  email?: string;
  mobile_number?: string;
  club_contact?: string;
  branches?: string;
  state_of_origin?: string;
  lga?: string;
  site_location?: string;
  number_of_plot?: string | number;
  plot_number?: string | number;
  land_price?: string | number;
  created_at?: string;
  [key: string]: any;
}

const BranchBreakDown: React.FC = () => {
  const { branch: branchKey } = useParams<{ branch?: string }>();
  const navigate = useNavigate();

  const selectedBranch = branchOptions.find((opt) => opt.keyWord === branchKey);
  const branchTitle = selectedBranch ? selectedBranch.title : branchKey || "";

  const {
    allClients,
    loadingAllClients,
    allClientsFetched,
    fetchAllClients,
    loadingApplications,
    removeClient,
  } = useClients();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [branchLastDownload, setBranchLastDownload] = useState<string | null>(
    null,
  );
  const [loadingDownloadTime, setLoadingDownloadTime] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // For first-time download
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("");

  // Download options & Site exclusion states
  const [downloadAllModalOpen, setDownloadAllModalOpen] = useState(false);
  const [branchDownloadModalOpen, setBranchDownloadModalOpen] = useState(false);
  const [excludedSites, setExcludedSites] = useState("");
  const [initialDownloadData, setInitialDownloadData] = useState<
    ClientRecord[]
  >([]);
  const [filteredDownloadData, setFilteredDownloadData] = useState<
    ClientRecord[]
  >([]);

  const fetchLastDownloadTime = useCallback(async () => {
    if (!branchKey) return;
    setLoadingDownloadTime(true);
    const token = localStorage.getItem("token");
    try {
      const response = await api.get(
        `${API_URL}/api/last/download-date?name=${branchKey}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data?.data?.updated_at) {
        setBranchLastDownload(response.data.data.updated_at);
      } else {
        setBranchLastDownload(null);
      }
    } catch (error: any) {
      if (error?.response && error.response.status === 404) {
        setBranchLastDownload(null);
      } else {
        console.error("Error fetching branch last download time:", error);
      }
    } finally {
      setLoadingDownloadTime(false);
    }
  }, [branchKey]);

  useEffect(() => {
    if (!allClientsFetched) {
      fetchAllClients();
    }
    fetchLastDownloadTime();
    setCurrentPage(1);
    setSearchQuery("");
    setDebouncedSearchQuery("");
  }, [fetchAllClients, allClientsFetched, fetchLastDownloadTime, branchKey]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const isBranchMatch = (b1?: string, b2?: string) => {
    if (!b1 || !b2) return false;
    return String(b1).trim().toLowerCase() === String(b2).trim().toLowerCase();
  };

  const fullFilteredData = useMemo(() => {
    let data: ClientRecord[] = (allClients || []).filter((item: ClientRecord) =>
      isBranchMatch(item.branches, branchTitle),
    );

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      data = data.filter(
        (item: ClientRecord) =>
          (item.client_name &&
            item.client_name.toLowerCase().includes(query)) ||
          (item.club_name && item.club_name.toLowerCase().includes(query)) ||
          (item.email && item.email.toLowerCase().includes(query)) ||
          (item.mobile_number && item.mobile_number.includes(query)) ||
          (item.site_location &&
            item.site_location.toLowerCase().includes(query)),
      );
    }

    return data;
  }, [allClients, branchTitle, debouncedSearchQuery]);

  const totalPages = Math.ceil(fullFilteredData.length / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return fullFilteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [fullFilteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    if (branchDownloadModalOpen) {
      let filterFrom: Date | null = null;

      if (branchLastDownload) {
        filterFrom = parseSafeDate(branchLastDownload);
      } else {
        if (!startDate || !startTime) {
          setInitialDownloadData([]);
          setFilteredDownloadData([]);
          return;
        }
        filterFrom = parseSafeDate(startDate);
        if (filterFrom) {
          const [fromHours, fromMinutes] = startTime.split(":").map(Number);
          filterFrom.setHours(fromHours, fromMinutes, 0, 0);
        }
      }

      const data = (allClients || []).filter((item: ClientRecord) => {
        if (!isBranchMatch(item.branches, branchTitle)) return false;
        const createdDate = parseSafeDate(item.created_at);
        if (!createdDate || !filterFrom) return false;
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
          siteLocationLower.includes(excludedSite),
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

  const updateDownloadTime = async (downloadTime: Date) => {
    const token = localStorage.getItem("token");
    try {
      await api.put(
        `${API_URL}/api/last/download-date`,
        { name: branchKey, date: format(downloadTime, "yyyy-MM-dd HH:mm:ss") },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBranchLastDownload(downloadTime.toISOString());
    } catch (error) {
      console.error("Error updating download time:", error);
    }
  };

  const generateCSV = (data: ClientRecord[], filename: string) => {
    const headers = [
      "Client Name",
      "State of Origin",
      "LGA",
      "Property Name",
      "Number of Plot(s)",
      "Plot No(s)",
      "Land Price",
      "Branch",
    ];

    const rows = data.map((item) =>
      [
        item.client_name || item.club_name || "",
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

  const generatePDF = (
    data: ClientRecord[],
    filename: string,
    title: string,
    filterFrom: Date | null = null,
    downloadStartTime: Date | null = null,
  ) => {
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
      pdf.text(
        `(${format(filterFrom, "dd/MM/yyyy HH:mm")} - ${format(downloadStartTime, "dd/MM/yyyy HH:mm")})`,
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );
      yPosition += 15;
    }

    const tableHead = [
      [
        "S/N",
        "Client Name",
        "State of Origin",
        "LGA",
        "Property Name",
        "No. of Plot(s)",
        "Plot No(s)",
        "Land Price",
        "Branch",
      ],
    ];
    const tableBody = data.map((item, index) => [
      index + 1,
      item.client_name || item.club_name || "N/A",
      item.state_of_origin || "N/A",
      item.lga || "N/A",
      item.site_location || "N/A",
      item.number_of_plot || "N/A",
      item.plot_number || "N/A",
      item.land_price ? Number(item.land_price).toLocaleString("en-NG") : "N/A",
      item.branches || "N/A",
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: tableHead,
      body: tableBody,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [47, 83, 24],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 12 },
        6: { cellWidth: 15 },
        7: { cellWidth: 20 },
        8: { cellWidth: 25 },
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
      const timeA = parseSafeDate(a.created_at)?.getTime() || 0;
      const timeB = parseSafeDate(b.created_at)?.getTime() || 0;
      return timeB - timeA;
    });

    if (data.length === 0) return toast.error("No records to download");

    const filename = `all_records_${branchKey}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    generateCSV(data, filename);
    setDownloadAllModalOpen(false);
    toast.success("CSV downloaded successfully!");
  };

  const handleDownloadAllPDF = () => {
    const data = [...fullFilteredData].sort((a, b) => {
      const timeA = parseSafeDate(a.created_at)?.getTime() || 0;
      const timeB = parseSafeDate(b.created_at)?.getTime() || 0;
      return timeB - timeA;
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
      const timeA = parseSafeDate(a.created_at)?.getTime() || 0;
      const timeB = parseSafeDate(b.created_at)?.getTime() || 0;
      return timeB - timeA;
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
      const timeA = parseSafeDate(a.created_at)?.getTime() || 0;
      const timeB = parseSafeDate(b.created_at)?.getTime() || 0;
      return timeB - timeA;
    });

    if (data.length === 0) return toast.error("No new records to download");

    let filterFrom: Date | null = null;
    if (branchLastDownload) {
      filterFrom = parseSafeDate(branchLastDownload);
    } else {
      if (startDate && startTime) {
        filterFrom = parseSafeDate(startDate);
        if (filterFrom) {
          const [hours, minutes] = startTime.split(":").map(Number);
          filterFrom.setHours(hours, minutes, 0, 0);
        }
      }
    }

    const filename = `new_records_${branchKey}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
    generatePDF(
      data,
      filename,
      `New Records - ${branchTitle}`,
      filterFrom,
      downloadStartTime,
    );
    updateDownloadTime(downloadStartTime);
    onModalCloseCleanup();
    toast.success("PDF downloaded successfully!");
  };

  const handleDelete = async (id: number | string) => {
    if (!id) return;
    if (
      confirm(
        "Are you sure you want to delete this entry? This action is irreversible.",
      )
    ) {
      const toastId = toast.loading("Deleting entry...");
      setIsDeleting(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to perform this action.", { id: toastId });
          setIsDeleting(false);
          return;
        }

        const response = await api.delete(`${API_URL}/api/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200 || response.status === 204) {
          toast.success("Client entry deleted successfully!", { id: toastId });
          removeClient(id);
          if (paginatedData.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } else {
          toast.error(`Failed to delete client. Status: ${response.status}`, {
            id: toastId,
          });
        }
      } catch (error: any) {
        console.error("Error deleting client:", error);
        toast.error(
          "Failed to delete client: " +
            (error.response?.data?.message || error.message || "Unknown error"),
          { id: toastId },
        );
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.info("Session expired! Logging out...");
          setTimeout(() => localStorage.removeItem("token"), 500);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Define Table Columns for ReusableTable
  const columns: TableColumnProps<ClientRecord>[] = [
    {
      label: "Client Name",
      key: "client_name",
      render: (item) => (
        <span className="font-medium text-tableData">
          {item.client_name ?? item.club_name ?? "-"}
        </span>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (item) => (
        <span className="text-gray-600">{item.email ?? "-"}</span>
      ),
    },
    {
      label: "Phone Number",
      key: "mobile_number",
      render: (item) => (
        <span>{item.mobile_number ?? item.club_contact ?? "-"}</span>
      ),
    },
    {
      label: "State / LGA",
      key: "state_of_origin",
      render: (item) => (
        <span>
          {item.state_of_origin || item.lga
            ? `${item.state_of_origin || "-"} / ${item.lga || "-"}`
            : "-"}
        </span>
      ),
    },
    {
      label: "Property Name",
      key: "site_location",
      render: (item) => (
        <span
          className="max-w-[200px] truncate block"
          title={item.site_location}
        >
          {item.site_location ?? "-"}
        </span>
      ),
    },
    {
      label: "Plots",
      key: "number_of_plot",
      render: (item) => (
        <span>
          {item.number_of_plot ? `${item.number_of_plot} plot(s)` : "-"}
        </span>
      ),
    },
    {
      label: "Plot No(s)",
      key: "plot_number",
      render: (item) => <span>{item.plot_number ?? "-"}</span>,
    },
    {
      label: "Land Price",
      key: "land_price",
      render: (item) => (
        <span className="font-medium">
          {item.land_price
            ? `₦${Number(item.land_price).toLocaleString("en-NG")}`
            : "-"}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      tableHeadingClassName: "text-center",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          canView
          onView={(id) => navigate(`/view-client/${id}`)}
          onEdit={(id) => navigate(`/edit-client/${id}`)}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  const isLoading = loadingAllClients || loadingApplications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {branchTitle} Branch
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and checkout all applications in this branch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAllClients(true)}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition shadow-xs"
            title="Refresh Data"
          >
            <TfiReload className={isLoading ? "animate-spin" : ""} size={16} />
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/95 flex items-center gap-2 shadow-xs transition"
            >
              <IoDownloadOutline size={18} />
              <span>Download</span>
            </button>

            {showDownloadOptions && (
              <div className="absolute right-0 mt-2 min-w-[210px] bg-white border border-gray-100 rounded-lg shadow-xl z-50 text-xs font-medium overflow-hidden animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    fetchAllClients(true);
                    setShowDownloadOptions(false);
                    setBranchDownloadModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-gray-700 transition"
                >
                  Download new records
                </button>
                <button
                  onClick={() => {
                    fetchAllClients(true);
                    setShowDownloadOptions(false);
                    setDownloadAllModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition"
                >
                  Download all records
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Stat Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverviewCards
          title="Total Applications"
          value={fullFilteredData.length}
          icon={HiOutlineUsers}
          subtitle="All active submissions"
        />
        <OverviewCards
          title="Last Download"
          value={
            loadingDownloadTime
              ? "Loading..."
              : branchLastDownload
                ? format(parseISO(branchLastDownload), "dd MMM yyyy, HH:mm")
                : "Never"
          }
          icon={BsClockHistory}
          subtitle={
            branchLastDownload
              ? "Timestamp of latest export"
              : "No export recorded"
          }
        />
        <OverviewCards
          title="Current Branch"
          value={branchTitle}
          icon={LuBuilding2}
          subtitle="Selected branch portal"
        />
      </div>

      {/* Main Content Area: Search Bar + Table */}
      <div className="space-y-5">
        {/* Search bar inside container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full max-w-md bg-secondary border border-primary/10 rounded-md relative flex gap-2 items-center h-[45px] px-4">
            <IoIosSearch className="w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, email, property..."
              className="w-full h-full focus:outline-none text-sm md:text-base"
            />
          </div>

          <div className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {paginatedData.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {fullFilteredData.length}
            </span>{" "}
            records
          </div>
        </div>

        {/* Reusable Table Component */}
        <ReusableTable<ClientRecord>
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          error={null}
          hasPagination={true}
          hasSerialNo={true}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={fullFilteredData.length}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          getRowId={(item) => item.id}
        />
      </div>

      {/* Modals */}
      <DownloadAllModal
        isLoadingAllclients={isLoading}
        isOpen={downloadAllModalOpen}
        onClose={() => setDownloadAllModalOpen(false)}
        onDownloadCSV={handleDownloadAllCSV}
        onDownloadPDF={handleDownloadAllPDF}
      />

      <BranchDownloadModal
        isOpen={branchDownloadModalOpen}
        onClose={onModalCloseCleanup}
        loading={isLoading}
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
