import React, { useEffect, useState, useCallback } from "react";
import { FaSearch, FaDownload } from "react-icons/fa";
import { BsClockHistory, BsJournalCheck } from "react-icons/bs";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useLocation } from "react-router-dom";
import ReusableTable from "../../../utilities/ReusableTable";
import ActionCell from "../../../components/ui/ActionCell";
import ActionButton from "../../../components/ui/ActionButton";
import type {
  BranchItem,
  ClientEntry,
  TableColumnProps,
} from "../../../lib/interfaces";
import { formatISODateToCustom } from "../../../helpers/formatterUtility";
import {
  useClientEntries,
  useDeleteApplication,
} from "../../../hooks/useClientEntries";
import { useExportDownload } from "../../../hooks/useDownload";
import ConfirmDialog from "../../../components/modals/ConfirmDialog";
import DownloadFormatModal, {
  type DownloadFormat,
} from "../../../components/modals/DownloadFormatModal";
import { toast } from "sonner";
import { getErrorMessage } from "../../../helpers/api";
import SearchableInput from "../../../components/ui/SearchableInput";
import { fetchBranchesService } from "../../../services/branchService";

const ManageEntries: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteTargetId, setDeleteTargetId] = useState<number | string | null>(
    null,
  );

  // Download states
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<"last_memory" | "all" | null>(
    null,
  );

  const deleteMutation = useDeleteApplication();
  const { mutate: exportDownload, isPending: isDownloading } =
    useExportDownload();

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
  } = useClientEntries({
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearchQuery,
    barrister: true,
    branch_id: selectedBranch?.id,
  });

  const clientEntries: ClientEntry[] = responseData?.data?.data || [];
  const totalItems = responseData?.data?.total || 0;
  const totalPages = responseData?.data?.last_page || 1;

  const fetchBranches = useCallback(
    async (query: string, signal?: AbortSignal): Promise<BranchItem[]> => {
      return await fetchBranchesService({ search: query, signal });
    },
    [],
  );

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to fetch client entries."));
    }
  }, [error]);

  const handleDownloadScopeSelect = (scope: "last_memory" | "all") => {
    setSelectedScope(scope);
    setDownloadModalOpen(true);
  };

  const handleExecuteDownload = (format: DownloadFormat) => {
    if (!selectedScope) return;

    exportDownload(
      {
        scope: selectedScope,
        format,
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Export initiated (${format.toUpperCase()})${
              data?.records_count !== undefined ? `: ${data.records_count} records` : ""
            }`,
          );
          setDownloadModalOpen(false);
          setSelectedScope(null);
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "Failed to download export."));
        },
      },
    );
  };

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
          onView={(id) =>
            navigate(`/dashboard/records/view/${id}`, {
              state: { from: location.pathname },
            })
          }
          onEdit={(id) => navigate(`/dashboard/records/edit/${id}`)}
          onDelete={(id) => setDeleteTargetId(id)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex lg:items-center gap-4 justify-between lg:flex-row flex-col">
        <div>
          <h2 className="text-lg font-semibold">New Form Entries</h2>
          <p className="text-sm text-tableHeading">
            Manage and view all latest and not-yet downloaded form entries here.
          </p>
        </div>
        <div>
          <ActionButton
            text="Download"
            icon={<FaDownload className="size-3.5" />}
            loading={isDownloading}
            loadingText="Exporting..."
            items={[
              {
                label: "Continue from last download",
                icon: <BsClockHistory className="size-3.5 text-primary" />,
                action: () => handleDownloadScopeSelect("last_memory"),
              },
              {
                label: "Download from all time",
                icon: <BsJournalCheck className="size-3.5 text-primary" />,
                action: () => handleDownloadScopeSelect("all"),
              },
            ]}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full">
        <div className="max-w-md w-full bg-secondary border border-primary/10 rounded-lg relative flex gap-2 items-center h-[45px] px-4">
          <FaSearch className="w-4 h-4 md:w-5 md:h-5 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name..."
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>
        <div className="w-full md:w-64">
          <SearchableInput<BranchItem>
            fetcher={fetchBranches}
            value={selectedBranch?.name || ""}
            displayKey="name"
            placeholder="Filter by branch..."
            clearable={true}
            fetchOnEmpty={true}
            inputContClassName="h-[45px] bg-secondary border border-primary/10 rounded-lg"
            className="text-sm"
            renderOption={(item) => (
              <p className="font-medium text-gray-900 capitalize">
                {item.name}
              </p>
            )}
            onSelect={(branch: BranchItem) => {
              setSelectedBranch(branch);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSelectedBranch(null);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Application Entry"
        message="Are you sure you want to delete this application entry? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (!deleteTargetId) return;
          deleteMutation.mutate(deleteTargetId, {
            onSuccess: () => {
              toast.success("Application entry deleted successfully!");
              setDeleteTargetId(null);
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, "Failed to delete entry."));
            },
          });
        }}
      />

      {/* Format Selection Modal (CSV or PDF) */}
      <DownloadFormatModal
        isOpen={downloadModalOpen}
        title={
          selectedScope === "last_memory"
            ? "Continue from Last Download"
            : "Download From All Time"
        }
        subtitle={
          selectedScope === "last_memory"
            ? "Export only new records submitted since your previous download."
            : "Export all historical form entries."
        }
        isLoading={isDownloading}
        onClose={() => {
          if (!isDownloading) {
            setDownloadModalOpen(false);
            setSelectedScope(null);
          }
        }}
        onSelectFormat={handleExecuteDownload}
      />
    </div>
  );
};

export default ManageEntries;
