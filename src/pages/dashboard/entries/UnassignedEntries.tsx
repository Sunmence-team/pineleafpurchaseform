import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import {
  BsShieldExclamation,
  BsHouseExclamation,
  BsCheckCircle,
} from "react-icons/bs";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "sonner";
import OverviewCards from "../../../components/cards/OverviewCards";
import ConfirmDialog from "../../../components/modals/ConfirmDialog";
import ActionCell from "../../../components/ui/ActionCell";
import { getStoredAssignments } from "../../../components/modals/AssignPropertiesModal";
import { getOfflinePropertyIds } from "../properties/Properties";
import { formatISODateToCustom } from "../../../helpers/formatterUtility";
import type { ClientEntry, TableColumnProps } from "../../../lib/interfaces";
import ReusableTable from "../../../utilities/ReusableTable";
import { api, getErrorMessage } from "../../../helpers/api";
import { useOldClientEntries } from "../../../hooks/useClientEntries";

const UnassignedEntries: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const {
    data: responseData,
    isLoading,
    error,
  } = useOldClientEntries({
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearchQuery,
  });

  const clientEntries: ClientEntry[] = responseData?.data?.data || [];
  const totalItems = responseData?.data?.total || 0;
  const totalPages = responseData?.data?.last_page || 1;

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to fetch client entries."));
    }
  }, [error]);

  const columns: TableColumnProps<ClientEntry>[] = [
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
      render: (item) => <span>{item.branch?.name ?? "-"}</span>,
    },
    {
      label: "Property Name",
      key: "properties.name",
      className: "px-3 py-2 text-xs text-gray-700 max-w-[250px]",
      render: (item) => (
        <span className="truncate block" title={item.properties?.name}>
          {item.properties?.name ?? "-"}
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
          onView={(id) => navigate(`/dashboard/records/view/${id}`)}
          onEdit={(id) => navigate(`/dashboard/records/edit/${id}`)}
          // onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Unassigned Property Entries
        </h1>
        <p className="text-sm text-gray-500">
          Purchase entries containing properties that currently do not have an
          assigned barrister
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <OverviewCards
          title="Unassigned Entries"
          value={0}
          icon={BsShieldExclamation}
          subtitle="Entries without barrister property assignment"
        />
        <OverviewCards
          title="Total Form Entries"
          value={0}
          icon={BsHouseExclamation}
          subtitle="All submitted purchase forms"
        />
        <OverviewCards
          title="Assignment Coverage"
          value={0}
          icon={BsCheckCircle}
          subtitle="Entries assigned to barristers"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="max-w-md w-full bg-secondary border border-primary/10 rounded-lg relative flex gap-2 items-center h-[45px] px-4">
          <BiSearch className="w-4 h-4 md:w-5 md:h-5 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search entries..."
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        columns={columns}
        data={clientEntries}
        isLoading={isLoading}
        error={error ? getErrorMessage(error) : null}
        hasSerialNo={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        getRowId={(item) => item.id}
      />

      {/* Delete Confirmation */}
      {/* <ConfirmDialog
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
      /> */}
    </div>
  );
};

export default UnassignedEntries;
