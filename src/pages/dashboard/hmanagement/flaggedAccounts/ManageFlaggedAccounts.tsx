import React, { useState, useEffect } from "react";
import { hmApi, getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import Modal from "../../../../components/modals/Modal";
import { StatusTurnPriorityCard } from "../../../../components/cards/StatusCard";
import { IoIosSearch } from "react-icons/io";
import ReusableTable from "../../../../utilities/ReusableTable";
import type { TableColumnProps } from "../../../../lib/interfaces";

export interface FlaggedAccountItem {
  id: number;
  reason?: string;
  flag_type?: string;
  type?: string;
  attempts_count?: number;
  attempts?: number;
  status?: string;
  resolution_status?: string;
  last_attempt_at?: string;
  updated_at?: string;
  created_at?: string;
  name?: string;
  user?: {
    id?: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

const ManageFlaggedAccounts: React.FC = () => {
  const token = localStorage.getItem("token");
  const [flags, setFlags] = useState<FlaggedAccountItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedAccountItem | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [reEnableUser, setReEnableUser] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchFlags = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await hmApi.get("/api/admin/flagged-accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: debouncedSearchQuery,
          status: statusFilter,
        },
      });

      const { data, total, last_page } = response.data.data;
      setFlags(data || []);
      setTotalItems(total || 0);
      setTotalPages(last_page || 1);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, statusFilter]);

  const openResolveModal = (flag: FlaggedAccountItem) => {
    setSelectedFlag(flag);
    setResolveNote("");
    setReEnableUser(false);
  };

  const handleResolve = async () => {
    if (!selectedFlag) return;
    setIsResolving(true);
    try {
      await hmApi.post(
        `/api/admin/flagged-accounts/${selectedFlag.id}/resolve`,
        {
          note: resolveNote,
          re_enable_user: reEnableUser,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Flagged account resolved successfully");
      setSelectedFlag(null);
      fetchFlags();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsResolving(false);
    }
  };

  const columns: TableColumnProps<FlaggedAccountItem>[] = [
    {
      label: "User",
      key: "user",
      render: (item) => (
        <span className="capitalize font-medium text-tableData">
          {item.user?.firstname} {item.user?.lastname}
        </span>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (item) => <span>{item.user?.email ?? "-"}</span>,
    },
    {
      label: "Reason",
      key: "reason",
      render: (item) => <span>{item.reason || item.flag_type || item.type || "-"}</span>,
    },
    {
      label: "Attempts",
      key: "attempts_count",
      render: (item) => <span>{item.attempts_count ?? item.attempts ?? "-"}</span>,
    },
    {
      label: "Status",
      key: "status",
      render: (item) => (
        <StatusTurnPriorityCard
          status={item.status || item.resolution_status}
        />
      ),
    },
    {
      label: "Last Attempt",
      key: "last_attempt_at",
      render: (item) => {
        const date = item.last_attempt_at || item.updated_at || item.created_at;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      label: "Action",
      key: "action",
      tableHeadingClassName: "text-center",
      render: (item) => (
        <button
          type="button"
          disabled={
            item.status === "resolved" || item.resolution_status === "resolved"
          }
          onClick={() => openResolveModal(item)}
          className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          Resolve
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Flagged Accounts</h2>
        <p className="text-sm text-tableHeading">
          Review, analyze and resolve flagged user accounts and security alerts.
        </p>
      </div>

      <div className="grid gap-4 items-end grid-cols-12">
        <div className="relative w-full col-span-12 md:col-span-6 lg:col-span-5 h-12 bg-secondary border border-primary/10 rounded-lg flex gap-2 items-center px-3">
          <IoIosSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search flagged accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full bg-transparent focus:outline-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-2 col-span-12 md:col-span-6 lg:col-span-4">
          <label className="text-xs font-semibold text-gray-700">
            Resolution Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 rounded-lg bg-secondary border border-primary/10 outline-0 px-3 text-sm"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="flex items-end col-span-12 md:col-span-6 lg:col-span-3">
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
            }}
            className="px-2 h-12 w-full rounded-lg bg-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      </div>

      <ReusableTable<FlaggedAccountItem>
        columns={columns}
        data={flags}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        getRowId={(item) => item.id}
      />

      {selectedFlag && (
        <Modal onClose={() => setSelectedFlag(null)}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Resolve Flagged Account
            </h2>
            <p className="text-sm text-gray-600">
              Resolve the issue for{" "}
              {selectedFlag.user?.firstname || selectedFlag.name}{" "}
              {selectedFlag.user?.lastname || ""}.
            </p>
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Admin note
                </label>
                <textarea
                  rows={4}
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="Enter a note for this resolution (optional)"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={reEnableUser}
                  onChange={(e) => setReEnableUser(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                Re-enable user after resolving
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
              <button
                type="button"
                onClick={() => setSelectedFlag(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={isResolving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isResolving ? "Resolving..." : "Resolve Account"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageFlaggedAccounts;
