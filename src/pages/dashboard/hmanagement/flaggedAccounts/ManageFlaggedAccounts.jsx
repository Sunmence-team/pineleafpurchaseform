import React, { useState, useEffect } from "react";
import assets from "../../../../assets/assets";
import { api, getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import { FaBars } from "react-icons/fa6";
import Modal from "../../../../components/modals/Modal";
import { StatusTurnPriorityCard } from "../../../../components/cards/StatusCard";
import { FaSearch } from "react-icons/fa";
import { branchOptions } from "../../../../lib/branchList";
import ReusableTable from "../../../../utilities/ReusableTable";

const ManageFlaggedAccounts = () => {
  const token = localStorage.getItem("token");
  const [openMenu, setOpenMenu] = useState(false);
  const [flags, setFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFlag, setSelectedFlag] = useState(null);
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

  const openResolveModal = (flag) => {
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
          admin_note: resolveNote,
          re_enable_user: reEnableUser,
        },
      );

      toast.success("Flag resolved successfully.");
      fetchFlags();
      setSelectedFlag(null);
      setResolveNote("");
      setReEnableUser(false);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsResolving(false);
    }
  };

  const columns = [
    {
      label: "Name",
      key: "name",
      render: (item) =>
        item.user
          ? `${item.user.firstname || ""} ${item.user.lastname || ""}`.trim()
          : item.name || "-",
    },
    {
      label: "Email",
      key: "email",
      render: (item) => item.user?.email || item.email || "-",
    },
    {
      label: "Attempts",
      key: "attempts_count",
      render: (item) => item.attempts_count ?? item.attempts ?? "-",
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
      render: (item) => (
        <button
          type="button"
          disabled={
            item.status === "resolved" || item.resolution_status === "resolved"
          }
          onClick={() => openResolveModal(item)}
          className="rounded-lg border border-secondary bg-secondary/10 px-3 py-2 text-xs font-semibold text-secondary hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Resolve
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center bg-white shadow-sm z-10 w-full px-4 md:px-6 lg:px-8 py-4">
          <button
            onClick={() => setOpenMenu(true)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <img src={assets.logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-gray-900 ps-6 truncate">
            Flagged Accounts
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid gap-4 mb-8 grid-cols-12 items-end">
            <div className="relative w-full md:col-span-6 h-12 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-secondary/50 flex gap-2 items-center px-3">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search flagged accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent focus:outline-none text-sm"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-4">
              <label className="text-xs font-semibold text-gray-700">
                Resolution Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 rounded-lg outline-0 border border-gray-300 px-3 text-sm"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                }}
                className="h-12 w-full rounded-lg bg-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Reset filters
              </button>
            </div>
          </div>

          <ReusableTable
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
            emptyDataHeading="No flagged accounts found"
            emptyDataMessage="There are currently no flagged accounts matching your criteria."
          />
        </main>
      </div>

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
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={isResolving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
