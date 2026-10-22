import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BiSearch } from "react-icons/bi";
import {
  BsFillAwardFill,
  BsHouses,
  BsFileEarmarkText,
  BsCheckCircle,
  BsShieldCheck,
} from "react-icons/bs";
import { toast } from "sonner";
import OverviewCards from "../../../components/cards/OverviewCards";
import { useClients } from "../../../context/ClientsContext";
import { getStoredAssignments } from "../../../components/modals/AssignPropertiesModal";
import { getStoredDocuments } from "../../documents/DocumentLibrary";
import { api, getErrorMessage } from "../../../helpers/api";
import type { BarristerProp, TableColumnProps } from "../../../lib/interfaces";
import ReusableTable from "../../../utilities/ReusableTable";

export interface BarristerSummaryRow {
  id: string | number;
  name: string;
  phone: string;
  assignedPropertiesCount: number;
  assignedPropertyNames: string[];
  entriesCount: number;
  signedCount: number;
  unsignedCount: number;
  lastActiveDate?: string;
}

const BarristersSummary: React.FC = () => {
  const { allClients, loadingAllClients, fetchAllClients } = useClients();
  const [barristers, setBarristers] = useState<BarristerProp[]>([]);
  const [loadingBarristers, setLoadingBarristers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all clients if empty
  useEffect(() => {
    if (allClients.length === 0 && !loadingAllClients) {
      fetchAllClients(true);
    }
  }, [allClients.length, loadingAllClients, fetchAllClients]);

  // Fetch barristers from API
  const fetchBarristers = useCallback(async () => {
    setLoadingBarristers(true);
    try {
      const res = await api.get("/barristers");
      const list = res.data?.data;
      const data = Array.isArray(list) ? list : list?.data || [];
      setBarristers(data);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load barristers list"));
    } finally {
      setLoadingBarristers(false);
    }
  }, []);

  useEffect(() => {
    fetchBarristers();
  }, [fetchBarristers]);

  // Aggregate summary data for each barrister
  const summaryRows: BarristerSummaryRow[] = useMemo(() => {
    const assignments = getStoredAssignments();
    const documents = getStoredDocuments();

    return barristers.map((b) => {
      const bId = String(b.id ?? "");
      const assignmentRecord = assignments[bId];
      const assignedProps = assignmentRecord?.properties || [];
      const propNames = assignedProps.map((p) => p.name);
      const propNamesLower = new Set(
        propNames.map((n) => n.trim().toLowerCase())
      );

      // Match purchase form entries by site_location
      let matchingEntriesCount = 0;
      for (const client of allClients) {
        const site = (client.site_location || "").trim().toLowerCase();
        if (site && propNamesLower.has(site)) {
          matchingEntriesCount++;
        }
      }

      // Match returned document batch feedbacks for this barrister
      let signed = 0;
      let unsigned = 0;
      let latestReturn: string | undefined;

      const barristerName = (b.full_name || b.name || "").toLowerCase().trim();

      for (const doc of documents) {
        if (doc.feedback) {
          const docBarrister = doc.feedback.barrister_name.toLowerCase().trim();
          if (
            docBarrister.includes(barristerName) ||
            barristerName.includes(docBarrister)
          ) {
            signed += doc.feedback.signed_count || 0;
            unsigned += doc.feedback.unsigned_count || 0;
            if (
              !latestReturn ||
              new Date(doc.feedback.date_returned) > new Date(latestReturn)
            ) {
              latestReturn = doc.feedback.date_returned;
            }
          }
        }
      }

      return {
        id: b.id ?? bId,
        name: b.full_name || b.name || "Unnamed Barrister",
        phone: b.phone_number || b.phone || "-",
        assignedPropertiesCount: assignedProps.length,
        assignedPropertyNames: propNames,
        entriesCount: matchingEntriesCount,
        signedCount: signed,
        unsignedCount: unsigned,
        lastActiveDate: latestReturn,
      };
    });
  }, [barristers, allClients]);

  // Search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return summaryRows;
    const lower = searchTerm.toLowerCase();
    return summaryRows.filter(
      (row) =>
        row.name.toLowerCase().includes(lower) ||
        row.phone.toLowerCase().includes(lower) ||
        row.assignedPropertyNames.some((p) => p.toLowerCase().includes(lower))
    );
  }, [summaryRows, searchTerm]);

  // Paginated slice
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;

  // Overview metrics
  const totalAssignedProperties = useMemo(
    () => summaryRows.reduce((sum, r) => sum + r.assignedPropertiesCount, 0),
    [summaryRows]
  );
  const totalCoveredEntries = useMemo(
    () => summaryRows.reduce((sum, r) => sum + r.entriesCount, 0),
    [summaryRows]
  );
  const totalSignedFeedback = useMemo(
    () => summaryRows.reduce((sum, r) => sum + r.signedCount, 0),
    [summaryRows]
  );

  const columns: TableColumnProps<BarristerSummaryRow>[] = [
    {
      label: "Barrister Name",
      key: "name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-400">{row.phone}</span>
        </div>
      ),
    },
    {
      label: "Assigned Properties",
      key: "assignedPropertiesCount",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-gray-900 text-sm">
            {row.assignedPropertiesCount}{" "}
            {row.assignedPropertiesCount === 1 ? "Property" : "Properties"}
          </span>
          {row.assignedPropertyNames.length > 0 && (
            <span className="text-xs text-gray-500 truncate max-w-xs" title={row.assignedPropertyNames.join(", ")}>
              {row.assignedPropertyNames.slice(0, 2).join(", ")}
              {row.assignedPropertyNames.length > 2 &&
                ` +${row.assignedPropertyNames.length - 2} more`}
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Matched Entries",
      key: "entriesCount",
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-primary border border-primary/20 w-max inline-block">
          {row.entriesCount} {row.entriesCount === 1 ? "entry" : "entries"}
        </span>
      ),
    },
    {
      label: "Feedback Documents",
      key: "feedback",
      render: (row) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {row.signedCount} Signed
          </span>
          {row.unsignedCount > 0 && (
            <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {row.unsignedCount} Unsigned
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Last Activity",
      key: "lastActiveDate",
      render: (row) => (
        <span className="text-xs text-gray-600">
          {row.lastActiveDate || "No feedback yet"}
        </span>
      ),
    },
  ];

  const isLoading = loadingBarristers || loadingAllClients;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          title="Active Barristers"
          value={barristers.length}
          icon={BsFillAwardFill}
          subtitle="Registered legal partners"
        />
        <OverviewCards
          title="Assigned Properties"
          value={totalAssignedProperties}
          icon={BsHouses}
          subtitle="Properties under legal purview"
        />
        <OverviewCards
          title="Covered Entries"
          value={totalCoveredEntries}
          icon={BsFileEarmarkText}
          subtitle="Entries linked to assigned properties"
        />
        <OverviewCards
          title="Signed Documents"
          value={totalSignedFeedback}
          icon={BsCheckCircle}
          subtitle="Signed entries returned"
        />
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Barristers Summary
          </h2>
          <p className="text-sm text-gray-500">
            Cross-functional overview of assigned properties, client entries, and legal feedback
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by barrister or property..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* Reusable Table */}
      <ReusableTable
        columns={columns}
        data={paginatedRows}
        isLoading={isLoading}
        error={null}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRows.length}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        hasSerialNo={true}
      />
    </div>
  );
};

export default BarristersSummary;
