import React, { useState, useEffect } from "react";
import { FaFilter, FaSearch, FaCaretDown } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "sonner";
import {
  format,
  parseISO,
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import jsPDF from "jspdf";
import assets from "../../assets/assets";
import logo from "../../assets/logo.png";
import autoTable from "jspdf-autotable";
import BranchFilterModal from "../../components/modals/BranchFilterModal";
import DateFilterModal from "../../components/modals/DateFilterModal";
import DownloadModal from "../../components/modals/DownloadModal";
import DownloadAllModal from "../../components/modals/DownloadAllModal";
import SiteDownloadModal from "../../components/modals/SiteDownloadModal";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/ui/ActionButton";
import ReusableTable from "../../utilities/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import type { TableColumnProps } from "../../lib/interfaces";
import { formatISODateToCustom } from "../../helpers/formatterUtility";
import { TfiReload } from "react-icons/tfi";
import { FaBars, FaX } from "react-icons/fa6";
import { useClients } from "../../context/ClientsContext";
import { parseSafeDate } from "../../helpers/formatterUtility";
import { branchOptions } from "../../lib/branchList";
import { api } from "../../helpers/api";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const {
    allClients,
    loadingAllClients,
    allClientsFetched,
    fetchAllClients,
    applications,
    loadingApplications,
    fetchApplications,
    totalPages,
    setTotalPages,
    totalRecords,
    setTotalRecords,
    removeClient,
  } = useClients();

  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(false);

  const [filteredData, setFilteredData] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterTimeFrom, setFilterTimeFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);
  const [filterTimeTo, setFilterTimeTo] = useState(null);
  const [filterBranch, setFilterBranch] = useState("");
  const [branchInput, setBranchInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState(null);
  const [timeFromInput, setTimeFromInput] = useState(null);
  const [dateToInput, setDateToInput] = useState(null);
  const [timeToInput, setTimeToInput] = useState(null);
  const [dateFilterModalOpen, setDateFilterModalOpen] = useState(false);
  const [branchFilterModalOpen, setBranchFilterModalOpen] = useState(false);
  const [showMoreDownloadOptions, setShowMoreDownloadOptions] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadAllModalOpen, setDownloadAllModalOpen] = useState(false);
  const [siteDownloadModalOpen, setSiteDownloadModalOpen] = useState(false);
  const [downloadDateFrom, setDownloadDateFrom] = useState(null);
  const [downloadTimeFrom, setDownloadTimeFrom] = useState(null);
  const [lastDownloadTime, setLastDownloadTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGettingBranches] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredDataForPrint, _setFilteredDataForPrint] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activePreset, setActivePreset] = useState(null);
  const [excludedSites, setExcludedSites] = useState("");
  const [excludedBranches, setExcludedBranches] = useState([]);
  const [initialDownloadData, setInitialDownloadData] = useState([]);
  const [filteredDownloadData, setFilteredDownloadData] = useState([]);
  const [branchLastDownload, setBranchLastDownload] = useState(null);

  const handleExcludeBranchChange = (branchKey) => {
    setExcludedBranches((prev) =>
      prev.includes(branchKey)
        ? prev.filter((b) => b !== branchKey)
        : [...prev, branchKey],
    );
  };
  const [selectedBranchForDownload, setSelectedBranchForDownload] =
    useState(null);
  const [branchStartDate, setBranchStartDate] = useState(null);
  const [branchStartTime, setBranchStartTime] = useState("");
  const [branchInitialData, setBranchInitialData] = useState([]);
  const [loadingBranchDownloadTime, setLoadingBranchDownloadTime] =
    useState(false);
  const [siteLocationLastDownload, setSiteLocationLastDownload] =
    useState(null);
  const [siteLocationStartDate, setSiteLocationStartDate] = useState(null);
  const [siteLocationStartTime, setSiteLocationStartTime] = useState("");
  const [newRecordsForSite, setNewRecordsForSite] = useState([]);
  const [loadingSiteDownloadTime, setLoadingSiteDownloadTime] = useState(false);
  const [siteLocation, setSiteLocation] = useState("");
  const [debouncedSiteLocation, setDebouncedSiteLocation] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSiteLocation(siteLocation);
    }, 1000);
    return () => clearTimeout(handler);
  }, [siteLocation]);

  const onSiteModalCloseCleanup = () => {
    setSiteLocation("");
    setDebouncedSiteLocation("");
    setSiteLocationLastDownload(null);
    setSiteLocationStartDate(null);
    setSiteLocationStartTime("");
    setNewRecordsForSite([]);
  };

  const handleSiteLocationSelectForDownload = async (siteLocation) => {
    if (!siteLocation) {
      setSiteLocationLastDownload(null);
      return;
    }
    setLoadingSiteDownloadTime(true);
    const token = localStorage.getItem("token");
    try {
      const response = await api.get(
        `${API_URL}/api/last/download-date?name=${siteLocation}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.data && response.data.data.updated_at) {
        setSiteLocationLastDownload(response.data.data.updated_at);
      } else {
        setSiteLocationLastDownload(null);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSiteLocationLastDownload(null);
      } else {
        console.error(
          "Error fetching site location last download time:",
          error,
        );
        toast.error("Could not fetch last download time for this site.");
      }
    } finally {
      setLoadingSiteDownloadTime(false);
    }
  };

  useEffect(() => {
    if (debouncedSiteLocation && siteLocationLastDownload) {
      const filterFrom = parseSafeDate(siteLocationLastDownload);
      const data = allClients.filter((item) => {
        const createdDate = parseSafeDate(item.created_at);
        return (
          item.site_location &&
          item.site_location
            .toLowerCase()
            .includes(debouncedSiteLocation.toLowerCase()) &&
          createdDate &&
          filterFrom &&
          createdDate >= filterFrom
        );
      });
      setNewRecordsForSite(data);
    } else {
      setNewRecordsForSite([]);
    }
  }, [siteLocationLastDownload, allClients, debouncedSiteLocation]);

  const onModalCloseCleanup = () => {
    setSelectedBranchForDownload(null);
    setBranchLastDownload(null);
    setBranchStartDate(null);
    setBranchStartTime("");
    setBranchInitialData([]);
  };

  useEffect(() => {
    if (selectedBranchForDownload && branchLastDownload) {
      const filterFrom = parseSafeDate(branchLastDownload);
      const selectedBranchTitle = branchOptions.find(
        (opt) => opt.keyWord === selectedBranchForDownload,
      )?.title;
      if (!selectedBranchTitle) {
        setBranchInitialData([]);
        return;
      }
      const data = allClients.filter((item) => {
        const createdDate = parseSafeDate(item.created_at);
        const branchMatch =
          item.branches &&
          item.branches.trim().toLowerCase() ===
            selectedBranchTitle.trim().toLowerCase();
        return (
          branchMatch && createdDate && filterFrom && createdDate >= filterFrom
        );
      });
      setBranchInitialData(data);
    } else {
      setBranchInitialData([]);
    }
  }, [selectedBranchForDownload, branchLastDownload, allClients]);

  const updateBranchDownloadTime = async (branchKey, dateTime) => {
    const token = localStorage.getItem("token");
    try {
      await api.put(
        `${API_URL}/api/last/download-date`,
        { name: branchKey, date: format(dateTime, "yyyy-MM-dd HH:mm:ss") },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error("Error updating branch download time:", error);
      toast.error("Could not update the download time for the branch.");
    }
  };

  const handleBranchSelectForDownload = async (branchKey) => {
    if (!branchKey) {
      setSelectedBranchForDownload(null);
      setBranchLastDownload(null);
      return;
    }
    setSelectedBranchForDownload(branchKey);
    setLoadingBranchDownloadTime(true);
    const token = localStorage.getItem("token");
    try {
      const response = await api.get(
        `${API_URL}/api/last/download-date?name=${branchKey}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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
        toast.error("Could not fetch last download time for this branch.");
      }
    } finally {
      setLoadingBranchDownloadTime(false);
    }
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (downloadModalOpen) {
      const filterTo = new Date();
      let filterFrom;

      if (lastDownloadTime) {
        filterFrom = parseSafeDate(lastDownloadTime);
      } else {
        if (!downloadDateFrom || !downloadTimeFrom) {
          setInitialDownloadData([]);
          return;
        }
        filterFrom = parseSafeDate(downloadDateFrom);
        if (filterFrom) {
          const [fromHours, fromMinutes] = downloadTimeFrom
            .split(":")
            .map(Number);
          filterFrom.setHours(fromHours, fromMinutes, 0, 0);
        }
      }

      const data = allClients.filter((item) => {
        const createdDate = parseSafeDate(item.created_at);
        if (!createdDate || !filterFrom) return false;
        return createdDate >= filterFrom && createdDate <= filterTo;
      });
      setInitialDownloadData(data);
      setFilteredDownloadData(data);
    }
  }, [
    downloadModalOpen,
    allClients,
    lastDownloadTime,
    downloadDateFrom,
    downloadTimeFrom,
  ]);

  useEffect(() => {
    const sitesToExclude = excludedSites
      .split(",")
      .map((site) => site.trim().toLowerCase())
      .filter(Boolean);
    const excludedBranchTitles = excludedBranches
      .map((key) => {
        const branch = branchOptions.find((opt) => opt.keyWord === key);
        return branch ? branch.title.toLowerCase() : "";
      })
      .filter(Boolean);

    const filtered = initialDownloadData.filter((item) => {
      const siteLocationLower = item.site_location?.toLowerCase() || "";
      const branchLower = item.branches?.toLowerCase() || "";

      const siteMatch =
        sitesToExclude.length > 0 &&
        sitesToExclude.some((excludedSite) =>
          siteLocationLower.includes(excludedSite),
        );
      const branchMatch =
        excludedBranchTitles.length > 0 &&
        excludedBranchTitles.includes(branchLower);

      return !siteMatch && !branchMatch;
    });

    setFilteredDownloadData(filtered);
  }, [excludedSites, excludedBranches, initialDownloadData]);

  const recordsPerPage = itemsPerPage;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (
      dateFilterModalOpen ||
      branchFilterModalOpen ||
      downloadModalOpen ||
      siteDownloadModalOpen
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    dateFilterModalOpen,
    branchFilterModalOpen,
    downloadModalOpen,
    siteDownloadModalOpen,
  ]);

  useEffect(() => {
    const fetchLastDownloadTimeData = async () => {
      const token = localStorage.getItem("token");
      try {
        if (!token) return;

        const response = await api.get(`${API_URL}/api/admin/download-date`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 && response.data.data.downloaded_date) {
          setLastDownloadTime(
            parseSafeDate(response.data.data.downloaded_date),
          );
        }
      } catch (error) {
        console.error("Error fetching last download time:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.info("Session expired!. Logging out...");
          setTimeout(() => {
            localStorage.removeItem("token");
          }, 500);
        }
      }
    };

    fetchLastDownloadTimeData();
  }, []);

  useEffect(() => {
    // Only fetch applications if filters are NOT active
    if (!filterBranch && !filterDateFrom && !filterDateTo) {
      fetchApplications(currentPage, recordsPerPage, debouncedSearchQuery);
    }
  }, [
    currentPage,
    debouncedSearchQuery,
    recordsPerPage,
    filterBranch,
    filterDateFrom,
    filterDateTo,
    fetchApplications,
  ]);

  useEffect(() => {
    let filtered = [...allClients];

    if (filterBranch) {
      filtered = filtered.filter(
        (item) =>
          item.branches &&
          item.branches.toLowerCase().trim() ===
            filterBranch.toLowerCase().trim(),
      );
    }

    if (filterDateFrom && filterTimeFrom) {
      const filterFrom = parseSafeDate(filterDateFrom);
      if (filterFrom) {
        const [hours, minutes] = filterTimeFrom.split(":").map(Number);
        filterFrom.setHours(hours, minutes, 0, 0);
        filtered = filtered.filter((item) => {
          const createdAt = parseSafeDate(item.created_at);
          return createdAt && createdAt >= filterFrom;
        });
      }
    }

    if (filterDateTo && filterTimeTo) {
      const filterTo = parseSafeDate(filterDateTo);
      if (filterTo) {
        const [hours, minutes] = filterTimeTo.split(":").map(Number);
        filterTo.setHours(hours, minutes, 59, 999);
        filtered = filtered.filter((item) => {
          const createdAt = parseSafeDate(item.created_at);
          return createdAt && createdAt <= filterTo;
        });
      }
    }

    filtered = filtered.sort((a, b) => {
      const dateA = parseSafeDate(a.created_at)?.getTime() || 0;
      const dateB = parseSafeDate(b.created_at)?.getTime() || 0;
      return dateB - dateA;
    });

    const isFilterActive = filterBranch || filterDateFrom || filterDateTo;

    if (isFilterActive) {
      const nextRecords = filtered.length;
      const nextPages = Math.ceil(filtered.length / recordsPerPage);

      if (totalRecords !== nextRecords) setTotalRecords(nextRecords);
      if (totalPages !== nextPages) setTotalPages(nextPages);
    }

    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginatedData = filtered.slice(
      startIndex,
      startIndex + recordsPerPage,
    );

    setFilteredData(isFilterActive ? paginatedData : applications);
  }, [
    allClients,
    applications,
    filterBranch,
    filterDateFrom,
    filterTimeFrom,
    filterDateTo,
    filterTimeTo,
    currentPage,
    recordsPerPage,
    totalRecords,
    totalPages,
    setTotalRecords,
    setTotalPages,
  ]);

  const applyBranchFilter = () => {
    const seenBranch = branchOptions.some(
      (option) => option.title === branchInput,
    );
    if (branchInput && !seenBranch) {
      toast.error("Please select a valid branch.");
      return;
    }
    setFilterBranch(branchInput);
    setBranchFilterModalOpen(false);
    setCurrentPage(1);
    toast.success("Branch filter applied successfully!");
  };

  const applyDateFilterWithValues = (dateFrom, timeFrom, dateTo, timeTo) => {
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) {
      toast.error("Please provide both date and time for filtering.");
      return;
    }

    if (!allClientsFetched) {
      fetchAllClients();
    }

    setFilterDateFrom(dateFrom);
    setFilterTimeFrom(timeFrom);
    setFilterDateTo(dateTo);
    setFilterTimeTo(timeTo);
    setDateFilterModalOpen(false);
    setCurrentPage(1);
    toast.success("Date and time filter applied successfully!");
  };

  const applyDateFilter = () => {
    applyDateFilterWithValues(
      dateFromInput,
      timeFromInput,
      dateToInput,
      timeToInput,
    );
  };

  const handlePresetDateFilter = (preset) => {
    setActivePreset(preset);
    let startDate;
    let endDate;
    const now = new Date();

    switch (preset) {
      case "Today":
        startDate = startOfToday();
        endDate = endOfToday();
        break;
      case "Yesterday":
        startDate = startOfYesterday();
        endDate = endOfYesterday();
        break;
      case "This Week":
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case "Last Week": {
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek);
        endDate = endOfWeek(lastWeek);
        break;
      }
      case "This Month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "Last Month": {
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      }
      default:
        return;
    }

    setDateFromInput(startDate);
    setTimeFromInput("00:00");
    setDateToInput(endDate);
    setTimeToInput("23:59");
    applyDateFilterWithValues(startDate, "00:00", endDate, "23:59");
  };

  const resetFilter = () => {
    setFilterDateFrom(null);
    setFilterTimeFrom(null);
    setFilterDateTo(null);
    setFilterTimeTo(null);
    setFilterBranch("");
    setBranchInput("");
    setDateFromInput(null);
    setTimeFromInput(null);
    setDateToInput(null);
    setTimeToInput(null);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setActivePreset(null);
    setCurrentPage(1);
    setDateFilterModalOpen(false);
    setBranchFilterModalOpen(false);
    toast.success("Filters reset successfully!");
  };

  const updateLastDownloadTime = async (downloadTime) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.put(
        `api/applications/download-date`,
        { downloaded_date: format(downloadTime, "yyyy-MM-dd HH:mm:ss") },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("Error updating last download time:", error);
      toast.error("Failed to update last download time on the server.");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.info("Session expired!. Logging out...");
        setTimeout(() => {
          localStorage.removeItem("token");
        }, 500);
      }
    }
  };

  const handleDownloadCSV = (downloadMode) => {
    const downloadStartTime = new Date();
    let filterFrom;
    let dataToDownload;

    if (downloadMode === "branch") {
      if (!selectedBranchForDownload) {
        toast.error("Please select a branch first.");
        return;
      }
      if (branchLastDownload) {
        filterFrom = parseSafeDate(branchLastDownload);
      } else {
        if (!branchStartDate || !branchStartTime) {
          toast.error("Please select a start date and time for this branch.");
          return;
        }
        filterFrom = parseSafeDate(branchStartDate);
        if (filterFrom) {
          const [fromHours, fromMinutes] = branchStartTime
            .split(":")
            .map(Number);
          filterFrom.setHours(fromHours, fromMinutes, 0, 0);
        }
      }
      const selectedBranchTitle = branchOptions.find(
        (opt) => opt.keyWord === selectedBranchForDownload,
      )?.title;
      if (!selectedBranchTitle) {
        toast.error("Could not find the selected branch title.");
        return;
      }

      const sitesToExclude = excludedSites
        .split(",")
        .map((site) => site.trim().toLowerCase())
        .filter(Boolean);

      dataToDownload = allClients.filter((item) => {
        const createdDate = parseSafeDate(item.created_at);
        const branchMatch =
          item.branches &&
          item.branches.trim().toLowerCase() ===
            selectedBranchTitle.trim().toLowerCase();
        const siteLocationLower = item.site_location?.toLowerCase() || "";
        const siteMatch =
          sitesToExclude.length > 0 &&
          sitesToExclude.some((excludedSite) =>
            siteLocationLower.includes(excludedSite),
          );
        return (
          branchMatch &&
          createdDate &&
          filterFrom &&
          createdDate >= filterFrom &&
          !siteMatch
        );
      });
    } else {
      filterFrom = lastDownloadTime ? parseSafeDate(lastDownloadTime) : null;
      dataToDownload = filteredDownloadData;
    }

    if (dataToDownload.length === 0) {
      toast.error("No new records found for the selected period.");
      return;
    }

    const sortedForDownload = dataToDownload.sort((a, b) => {
      const dateA = parseSafeDate(a.created_at)?.getTime() || 0;
      const dateB = parseSafeDate(b.created_at)?.getTime() || 0;
      return dateB - dateA;
    });

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

    const rows = sortedForDownload.map((item) =>
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
    link.setAttribute(
      "download",
      `clients_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (downloadMode === "branch") {
      updateBranchDownloadTime(selectedBranchForDownload, downloadStartTime);
    } else {
      setLastDownloadTime(downloadStartTime);
      updateLastDownloadTime(downloadStartTime);
    }
    setDownloadModalOpen(false);
    toast.success("CSV downloaded successfully!");
  };

  const handleDownloadPDF = async (downloadMode) => {
    const downloadStartTime = new Date();
    let filterFrom;
    let dataToDownload;

    if (downloadMode === "branch") {
      if (!selectedBranchForDownload) {
        toast.error("Please select a branch first.");
        return;
      }
      if (branchLastDownload) {
        filterFrom = parseSafeDate(branchLastDownload);
      } else {
        if (!branchStartDate || !branchStartTime) {
          toast.error("Please select a start date and time for this branch.");
          return;
        }
        filterFrom = parseSafeDate(branchStartDate);
        if (filterFrom) {
          const [fromHours, fromMinutes] = branchStartTime
            .split(":")
            .map(Number);
          filterFrom.setHours(fromHours, fromMinutes, 0, 0);
        }
      }
      const selectedBranchTitle = branchOptions.find(
        (opt) => opt.keyWord === selectedBranchForDownload,
      )?.title;
      if (!selectedBranchTitle) {
        toast.error("Could not find the selected branch title.");
        return;
      }

      const sitesToExclude = excludedSites
        .split(",")
        .map((site) => site.trim().toLowerCase())
        .filter(Boolean);

      dataToDownload = allClients.filter((item) => {
        const createdDate = parseSafeDate(item.created_at);
        const branchMatch =
          item.branches &&
          item.branches.trim().toLowerCase() ===
            selectedBranchTitle.trim().toLowerCase();
        const siteLocationLower = item.site_location?.toLowerCase() || "";
        const siteMatch =
          sitesToExclude.length > 0 &&
          sitesToExclude.some((excludedSite) =>
            siteLocationLower.includes(excludedSite),
          );
        return (
          branchMatch &&
          createdDate &&
          filterFrom &&
          createdDate >= filterFrom &&
          !siteMatch
        );
      });
    } else {
      filterFrom = lastDownloadTime ? parseSafeDate(lastDownloadTime) : null;
      dataToDownload = filteredDownloadData;
    }

    if (dataToDownload.length === 0) {
      toast.error("No new records found for the selected period.");
      return;
    }

    const sortedForDownload = dataToDownload.sort((a, b) => {
      const dateA = parseSafeDate(a.created_at)?.getTime() || 0;
      const dateB = parseSafeDate(b.created_at)?.getTime() || 0;
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

      if (filterFrom) {
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
      const tableBody = sortedForDownload.map((item, index) => [
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
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 17.5 },
          3: { cellWidth: 17.5 },
          4: { cellWidth: 35 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 17.5 },
          8: { cellWidth: 17.5 },
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: margin, right: margin },
      });

      pdf.save(`clients_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`);

      if (downloadMode === "branch") {
        updateBranchDownloadTime(selectedBranchForDownload, downloadStartTime);
      } else {
        setLastDownloadTime(downloadStartTime);
        updateLastDownloadTime(downloadStartTime);
      }
      setDownloadModalOpen(false);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        "Failed to generate PDF: " + (error.message || "Unknown error"),
      );
    }
  };

  const handleDownloadAllCSV = () => {
    const sortedForDownload = [...allClients].sort((a, b) => {
      const dateA = parseSafeDate(a.created_at)?.getTime() || 0;
      const dateB = parseSafeDate(b.created_at)?.getTime() || 0;
      return dateB - dateA;
    });

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
    const rows = sortedForDownload.map((item) =>
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
    link.setAttribute(
      "download",
      `all_clients_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadAllModalOpen(false);
    toast.success("CSV downloaded successfully!");
  };

  const handleDownloadAllPDF = async () => {
    const sortedForDownload = [...allClients].sort((a, b) => {
      const dateA = parseSafeDate(a.created_at)?.getTime() || 0;
      const dateB = parseSafeDate(b.created_at)?.getTime() || 0;
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
      pdf.text("All Client Records", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

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
      const tableBody = sortedForDownload.map((item, index) => [
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
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 17.5 },
          3: { cellWidth: 17.5 },
          4: { cellWidth: 35 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 17.5 },
          8: { cellWidth: 17.5 },
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: margin, right: margin },
      });

      pdf.save(`all_clients_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`);
      setDownloadAllModalOpen(false);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        "Failed to generate PDF: " + (error.message || "Unknown error"),
      );
    }
  };

  const handleSiteDownload = (format, siteLocation) => {
    if (format === "csv") handleSiteDownloadCSV(siteLocation);
    else handleSiteDownloadPDF(siteLocation);
  };

  const handleSiteDownloadCSV = (siteLocation) => {
    const downloadStartTime = new Date();
    let filterFrom;

    if (siteLocationLastDownload) {
      filterFrom = parseSafeDate(siteLocationLastDownload);
    } else {
      if (!siteLocationStartDate || !siteLocationStartTime) {
        toast.error("Please select a start date and time for this site.");
        return;
      }
      filterFrom = parseSafeDate(siteLocationStartDate);
      if (filterFrom) {
        const [fromHours, fromMinutes] = siteLocationStartTime
          .split(":")
          .map(Number);
        filterFrom.setHours(fromHours, fromMinutes, 0, 0);
      }
    }

    const dataToDownload = allClients.filter((item) => {
      const createdDate = parseSafeDate(item.created_at);
      return (
        item.site_location &&
        item.site_location.toLowerCase().includes(siteLocation.toLowerCase()) &&
        createdDate &&
        filterFrom &&
        createdDate >= filterFrom
      );
    });

    if (dataToDownload.length === 0) {
      toast.error("No new records found for the selected period.");
      return;
    }

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
    const rows = dataToDownload.map((item) =>
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
    link.setAttribute(
      "download",
      `clients_${siteLocation.replace(/ /g, "_")}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    updateBranchDownloadTime(siteLocation, downloadStartTime);
    setSiteDownloadModalOpen(false);
    toast.success("CSV downloaded successfully!");
  };

  const handleSiteDownloadPDF = async (siteLocation) => {
    const downloadStartTime = new Date();
    let filterFrom;

    if (siteLocationLastDownload) {
      filterFrom = parseSafeDate(siteLocationLastDownload);
    } else {
      if (!siteLocationStartDate || !siteLocationStartTime) {
        toast.error("Please select a start date and time for this site.");
        return;
      }
      filterFrom = parseSafeDate(siteLocationStartDate);
      if (filterFrom) {
        const [fromHours, fromMinutes] = siteLocationStartTime
          .split(":")
          .map(Number);
        filterFrom.setHours(fromHours, fromMinutes, 0, 0);
      }
    }

    const dataToDownload = allClients.filter((item) => {
      const createdDate = parseSafeDate(item.created_at);
      return (
        item.site_location &&
        item.site_location.toLowerCase().includes(siteLocation.toLowerCase()) &&
        createdDate &&
        filterFrom &&
        createdDate >= filterFrom
      );
    });

    if (dataToDownload.length === 0) {
      toast.error("No new records found for the selected period.");
      return;
    }

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
      pdf.text(`Client Records for ${siteLocation}`, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      if (filterFrom) {
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
      const tableBody = dataToDownload.map((item, index) => [
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
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 17.5 },
          3: { cellWidth: 17.5 },
          4: { cellWidth: 35 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 17.5 },
          8: { cellWidth: 17.5 },
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: margin, right: margin },
      });

      pdf.save(
        `clients_${siteLocation.replace(/ /g, "_")}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`,
      );
      updateBranchDownloadTime(siteLocation, downloadStartTime);
      setSiteDownloadModalOpen(false);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        "Failed to generate PDF: " + (error.message || "Unknown error"),
      );
    }
  };

  const getPageNumbers = () => {
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
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (
      confirm(
        "Are you sure to delete this entry?. This action is irreversible.",
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
          if (filteredData.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else if (!filterBranch && !filterDateFrom && !filterDateTo) {
            fetchApplications(
              currentPage,
              recordsPerPage,
              debouncedSearchQuery,
            );
          }
        } else {
          toast.error(`Failed to delete client. Status: ${response.status}`, {
            id: toastId,
          });
        }
      } catch (error) {
        console.error("Error deleting client:", error);
        toast.error(
          "Failed to delete client: " +
            (error.response?.data?.message || error.message || "Unknown error"),
          { id: toastId },
        );
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.info("Session expired!. Logging out...");
          setTimeout(() => localStorage.removeItem("token"), 500);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const columns: TableColumnProps<any>[] = [
    {
      label: "Client Name",
      key: "client_name",
      className: "px-3 py-2 text-xs font-medium text-tableData max-w-[280px]",
      render: (item) => (
        <span
          className="font-medium text-gray-900 block truncate capitalize"
          title={item.client_name ?? item.club_name}
        >
          {item.client_name ?? item.club_name ?? "-"}
        </span>
      ),
    },
    {
      label: "Email",
      key: "email",
      className: "px-3 py-2 text-xs text-gray-600 max-w-[200px]",
      render: (item) => (
        <span className="truncate block" title={item.email}>
          {item.email ?? "-"}
        </span>
      ),
    },
    {
      label: "Phone Number",
      key: "mobile_number",
      className: "px-3 py-2 text-xs text-gray-700 whitespace-nowrap",
      render: (item) => (
        <span>{item.mobile_number ?? item.club_contact ?? "-"}</span>
      ),
    },
    {
      label: "Branch",
      key: "branches",
      className: "px-3 py-2 text-xs text-gray-700 whitespace-nowrap",
      render: (item) => <span>{item.branches ?? "-"}</span>,
    },
    {
      label: "Property name/Location",
      key: "site_location",
      className: "px-3 py-2 text-xs text-gray-700 max-w-[250px]",
      render: (item) => (
        <span className="truncate block" title={item.site_location}>
          {item.site_location ?? "-"}
        </span>
      ),
    },
    {
      label: "Date Filled",
      key: "created_at",
      className: "px-3 py-2 text-xs text-gray-700 whitespace-nowrap",
      render: (item) => <span>{formatISODateToCustom(item.created_at)}</span>,
    },
    {
      label: "Actions",
      key: "action",
      tableHeadingClassName: "text-center",
      className: "px-3 py-2 text-center whitespace-nowrap",
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex lg:items-center gap-4 justify-between lg:flex-row flex-col">
        <div>
          <h2 className="text-lg font-semibold">Old Records</h2>
          <p className="text-sm text-tableHeading">
            Manage and check all system legacy entries here.
          </p>
        </div>
        {/* <ActionButton
          text="Check new records"
          icon={<FaPlus />}
          action={() => navigate("/dashboar/")}
        /> */}
      </div>
      {(loading || loadingApplications) && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      )}
      {!(loading || loadingApplications) && (
        <>
          <div className="flex flex-col justify-between md:flex-row gap-2 md:gap-3 w-full">
            <div className="md:w-1/2 w-full bg-gray-50 border border-gray-300 rounded-lg relative flex gap-2 items-center h-[45px] px-4">
              <FaSearch className="text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="flex flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
              <ActionButton
                text="Reload Data"
                icon={
                  <TfiReload
                    className={`${(loading || loadingAllClients || loadingApplications) && "animate-spin"} size-4`}
                  />
                }
                action={() => {
                  fetchAllClients(true);
                  fetchApplications(
                    currentPage,
                    recordsPerPage,
                    debouncedSearchQuery,
                  );
                }}
                disabled={loading || loadingAllClients || loadingApplications}
                buttonStyle="text-white font-medium"
              />

              <ActionButton
                text="Branch"
                icon={<FaFilter className="mr-1 w-3.5 h-3.5" />}
                action={() => {
                  fetchAllClients();
                  setBranchFilterModalOpen(true);
                }}
                buttonStyle="text-white font-medium"
              />

              <ActionButton
                text="Filter"
                icon={<FaFilter className="mr-1 w-3.5 h-3.5" />}
                action={() => setDateFilterModalOpen(true)}
                buttonStyle="text-white font-medium"
              />

              <div className="relative">
                <ActionButton
                  text="Download"
                  icon={<FaCaretDown className="ml-1 w-4 h-4 order-last" />}
                  action={() => {
                    fetchAllClients();
                    setShowMoreDownloadOptions((prev) => !prev);
                  }}
                  buttonStyle="text-white font-medium w-full md:w-auto"
                />
                {showMoreDownloadOptions && (
                  <div className="absolute right-0 mt-2 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-sm font-semibold overflow-hidden">
                    <button
                      onClick={() => {
                        fetchAllClients(true);
                        setShowMoreDownloadOptions(false);
                        setDownloadModalOpen(true);
                      }}
                      className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      Continue from last download
                    </button>
                    <button
                      onClick={() => {
                        fetchAllClients(true);
                        setShowMoreDownloadOptions(false);
                        setDownloadAllModalOpen(true);
                      }}
                      className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      Download from all times
                    </button>
                    <button
                      onClick={() => {
                        fetchAllClients(true);
                        setShowMoreDownloadOptions(false);
                        setSiteDownloadModalOpen(true);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 transition"
                    >
                      Download for a specific site
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ReusableTable
            columns={columns}
            data={filteredData}
            isLoading={loading || loadingApplications}
            error={null}
            hasPagination={true}
            hasSerialNo={true}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalRecords}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            getRowId={(item) => item.id}
          />
        </>
      )}

      <BranchFilterModal
        isLoadingAllclients={loadingAllClients}
        isOpen={branchFilterModalOpen}
        onClose={() => setBranchFilterModalOpen(false)}
        branchInput={branchInput}
        onBranchInputChange={setBranchInput}
        branchOptions={branchOptions}
        onReset={resetFilter}
        onApply={applyBranchFilter}
      />
      <DateFilterModal
        isLoadingAllclients={loadingAllClients}
        isOpen={dateFilterModalOpen}
        onClose={() => setDateFilterModalOpen(false)}
        dateFromInput={dateFromInput}
        onDateFromChange={(date) => {
          setDateFromInput(date);
          setActivePreset(null);
        }}
        timeFromInput={timeFromInput}
        onTimeFromChange={(e) => {
          setTimeFromInput(e.target.value);
          setActivePreset(null);
        }}
        dateToInput={dateToInput}
        onDateToChange={(date) => {
          setDateToInput(date);
          setActivePreset(null);
        }}
        timeToInput={timeToInput}
        onTimeToChange={(e) => {
          setTimeToInput(e.target.value);
          setActivePreset(null);
        }}
        onReset={resetFilter}
        onApply={applyDateFilter}
        onPresetSelect={handlePresetDateFilter}
        activePreset={activePreset}
      />
      <DownloadModal
        isLoadingAllclients={loadingAllClients}
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        lastDownloadTime={lastDownloadTime}
        branchLastDownload={branchLastDownload}
        onDownloadCSV={handleDownloadCSV}
        onDownloadPDF={handleDownloadPDF}
        excludedSites={excludedSites}
        onExcludeChange={setExcludedSites}
        excludedBranches={excludedBranches}
        onExcludeBranchChange={handleExcludeBranchChange}
        initialCount={initialDownloadData.length}
        excludedCount={initialDownloadData.length - filteredDownloadData.length}
        remainingCount={filteredDownloadData.length}
        branchOptions={branchOptions}
        onBranchSelect={handleBranchSelectForDownload}
        selectedBranch={selectedBranchForDownload}
        branchStartDate={branchStartDate}
        setBranchStartDate={setBranchStartDate}
        branchStartTime={branchStartTime}
        setBranchStartTime={setBranchStartTime}
        branchInitialCount={branchInitialData.length}
        loadingBranchDownloadTime={loadingBranchDownloadTime}
        onModalCloseCleanup={onModalCloseCleanup}
      />
      <DownloadAllModal
        isLoadingAllclients={loadingAllClients}
        isOpen={downloadAllModalOpen}
        onClose={() => setDownloadAllModalOpen(false)}
        onDownloadCSV={handleDownloadAllCSV}
        onDownloadPDF={handleDownloadAllPDF}
      />
      <SiteDownloadModal
        isOpen={siteDownloadModalOpen}
        onClose={() => setSiteDownloadModalOpen(false)}
        onDownload={handleSiteDownload}
        onSiteSelect={handleSiteLocationSelectForDownload}
        siteLastDownload={siteLocationLastDownload}
        siteStartDate={siteLocationStartDate}
        setSiteStartDate={setSiteLocationStartDate}
        siteStartTime={siteLocationStartTime}
        setSiteStartTime={setSiteLocationStartTime}
        newRecordsCount={newRecordsForSite.length}
        loadingSiteTime={loadingSiteDownloadTime}
        onModalCloseCleanup={onSiteModalCloseCleanup}
        siteLocation={siteLocation}
        onSiteLocationChange={setSiteLocation}
        debouncedSiteLocation={debouncedSiteLocation}
      />
    </div>
  );
};

export default Dashboard;
