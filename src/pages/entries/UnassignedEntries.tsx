import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { BsShieldExclamation, BsHouseExclamation, BsCheckCircle } from "react-icons/bs";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "sonner";
import OverviewCards from "../../components/cards/OverviewCards";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import ActionCell from "../../components/ui/ActionCell";
import { useClients } from "../../context/ClientsContext";
import { getStoredAssignments } from "../../components/modals/AssignPropertiesModal";
import { getOfflinePropertyIds } from "../properties/Properties";
import { formatISODateToCustom } from "../../helpers/formatterUtility";
import type { TableColumnProps } from "../../lib/interfaces";
import ReusableTable from "../../utilities/ReusableTable";
import { api, getErrorMessage } from "../../helpers/api";

const UnassignedEntries: React.FC = () => {
  const { allClients, loadingAllClients, fetchAllClients, removeClient } =
    useClients();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all clients if not already loaded
  useEffect(() => {
    if (allClients.length === 0 && !loadingAllClients) {
      fetchAllClients(true);
    }
  }, [allClients.length, loadingAllClients, fetchAllClients]);

  // Read assigned property identifiers from stored assignments
  const assignedPropertyNames = useMemo(() => {
    const assignments = getStoredAssignments();
    const names = new Set<string>();
    for (const record of Object.values(assignments)) {
      if (Array.isArray(record.properties)) {
        for (const prop of record.properties) {
          if (prop?.name) {
            names.add(prop.name.trim().toLowerCase());
          }
        }
      }
    }
    return names;
  }, []);

  // Filter entries that do NOT have a barrister assigned to their property / site location
  const unassignedEntries = useMemo(() => {
    return allClients.filter((client: any) => {
      const site = (client.site_location || "").trim().toLowerCase();
      if (!site || site === "n/a") {
        return true; // No site specified -> unassigned
      }
      // Check if site name matches any assigned property
      return !assignedPropertyNames.has(site);
    });
  }, [allClients, assignedPropertyNames]);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return unassignedEntries;
    const lower = searchTerm.toLowerCase();
    return unassignedEntries.filter((item: any) => {
      const name = (item.client_name || "").toLowerCase();
      const site = (item.site_location || "").toLowerCase();
      const branch = (item.branches || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      return (
        name.includes(lower) ||
        site.includes(lower) ||
        branch.includes(lower) ||
        email.includes(lower)
      );
    });
  }, [unassignedEntries, searchTerm]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const handleDelete = async () => {
    if (!targetId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/applications/${targetId}`);
      removeClient(targetId);
      toast.success("Entry deleted successfully");
      setDeleteModalOpen(false);
      setTargetId(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete entry"));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumnProps<any>[] = [
    {
      label: "Client Name",
      key: "client_name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.client_name}</span>
          <span className="text-xs text-gray-400">{row.email || "-"}</span>
        </div>
      ),
    },
    {
      label: "Site / Property",
      key: "site_location",
      render: (row) => (
        <span className="font-medium text-gray-800">
          {row.site_location || "Not Specified"}
        </span>
      ),
    },
    {
      label: "Branch",
      key: "branches",
      render: (row) => <span>{row.branches || "-"}</span>,
    },
    {
      label: "Plots",
      key: "number_of_plot",
      render: (row) => <span>{row.number_of_plot || "1"}</span>,
    },
    {
      label: "Submission Date",
      key: "created_at",
      render: (row) => <span>{formatISODateToCustom(row.created_at)}</span>,
    },
    {
      label: "Barrister Status",
      key: "status",
      render: () => (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5 w-max">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          No Barrister Assigned
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={Number(item.id)}
          canView={true}
          onView={() => window.open(`/view-client/${item.id}`, "_self")}
          onEdit={() => window.open(`/edit-client/${item.id}`, "_self")}
          onDelete={() => {
            setTargetId(item.id);
            setDeleteModalOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <OverviewCards
          title="Unassigned Entries"
          value={unassignedEntries.length}
          icon={BsShieldExclamation}
          subtitle="Entries without barrister property assignment"
        />
        <OverviewCards
          title="Total Form Entries"
          value={allClients.length}
          icon={BsHouseExclamation}
          subtitle="All submitted purchase forms"
        />
        <OverviewCards
          title="Assignment Coverage"
          value={
            allClients.length > 0
              ? `${Math.round(
                  ((allClients.length - unassignedEntries.length) /
                    allClients.length) *
                    100
                )}%`
              : "0%"
          }
          icon={BsCheckCircle}
          subtitle="Entries assigned to barristers"
        />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Unassigned Property Entries
          </h1>
          <p className="text-sm text-gray-500">
            Purchase entries containing properties that currently do not have an assigned barrister
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
            placeholder="Search entries..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        columns={columns}
        data={paginatedData}
        isLoading={loadingAllClients}
        error={null}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        hasSerialNo={true}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        isLoading={isDeleting}
        title="Delete Purchase Entry?"
        message="Are you sure you want to delete this purchase entry? This action cannot be undone."
        confirmText="Yes, Delete"
        onCancel={() => {
          setDeleteModalOpen(false);
          setTargetId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UnassignedEntries;
