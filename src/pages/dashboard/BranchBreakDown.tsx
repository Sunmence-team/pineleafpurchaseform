import React, { useEffect, useState } from "react";
import { FaSearch, FaDownload } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReusableTable from "../../utilities/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import ActionButton from "../../components/ui/ActionButton";
import type { ClientEntry, TableColumnProps } from "../../lib/interfaces";
import { formatISODateToCustom } from "../../helpers/formatterUtility";
import { useClientEntries } from "../../hooks/useClientEntries";
import { useBranches } from "../../hooks/useBranches";
import { useExportDownload } from "../../hooks/useDownload";
import DownloadFormatModal, {
  type DownloadFormat,
} from "../../components/modals/DownloadFormatModal";
import { toast } from "sonner";
import { getErrorMessage } from "../../helpers/api";
import { HiOutlineUsers } from "react-icons/hi2";
import { BsClockHistory, BsJournalCheck } from "react-icons/bs";
import { LuBuilding2 } from "react-icons/lu";
import OverviewCards from "../../components/cards/OverviewCards";

const BranchBreakDown: React.FC = () => {
  const { branch } = useParams<{ branch: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: branches = [] } = useBranches();
  const currentBranch = branches.find((b) => String(b.id) === String(branch));

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Download states
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<"last_memory" | "all" | null>(
    null,
  );

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
    branch_id: branch,
  });

  const clientEntries: ClientEntry[] = responseData?.data?.data || [];
  const totalItems = responseData?.data?.total || 0;
  const totalPages = responseData?.data?.last_page || 1;

  const handleDownloadScopeSelect = (scope: "last_memory" | "all") => {
    setSelectedScope(scope);
    setDownloadModalOpen(true);
  };

  const handleExecuteDownload = (format: DownloadFormat) => {
    if (!branch || !selectedScope) return;

    exportDownload(
      {
        type: "by_branch",
        branch,
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
          onView={(id) =>
            navigate(`/dashboard/records/view/${id}`, {
              state: { from: location.pathname },
            })
          }
          onEdit={(id) => navigate(`/dashboard/records/edit/${id}`)}
          // onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex lg:items-center gap-4 justify-between lg:flex-row flex-col">
        <div>
          <h2 className="text-lg font-semibold">
            {currentBranch ? `${currentBranch.name} Branch Entries` : "Branch Entries"}
          </h2>
          <p className="text-sm text-tableHeading">
            Manage and check all applications submitted under this branch.
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

      {/* Top Stat Overview Cards */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <OverviewCards
         title="Total Applications"
         value={totalItems}
         icon={HiOutlineUsers}
         subtitle="All branch submissions"
       />
       <OverviewCards
         title="Last Download"
         value={0}
         icon={BsClockHistory}
         subtitle={"No export recorded"}
       />
       <OverviewCards
         title="Current Branch"
         value={currentBranch?.name ?? (branch || "N/A")}
         icon={LuBuilding2}
         subtitle="Selected branch portal"
       />
     </div>

      <div className="flex flex-col justify-between md:flex-row gap-2 md:gap-3 w-full">
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

      {/* Format Selection Modal (CSV or PDF) */}
      <DownloadFormatModal
        isOpen={downloadModalOpen}
        title={
          selectedScope === "last_memory"
            ? `Continue from Last Download (${currentBranch?.name || "Branch"})`
            : `Download From All Time (${currentBranch?.name || "Branch"})`
        }
        subtitle={
          selectedScope === "last_memory"
            ? "Export only new records submitted for this branch since your previous download."
            : "Export all historical entries submitted for this branch."
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

export default BranchBreakDown;