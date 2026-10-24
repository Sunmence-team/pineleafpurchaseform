import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActionCell from "../../../../../components/ui/ActionCell";
import { getErrorMessage } from "../../../../../helpers/api";
import { toast } from "sonner";
import { IoIosSearch } from "react-icons/io";
import {
  formatISODateToCustom,
  formatterUtility,
  formatUnderScores,
} from "../../../../../helpers/formatterUtility";
import ReusableTable from "../../../../../utilities/ReusableTable";
import StatusCard from "../../../../../components/cards/StatusCard";
import { useApplicants } from "../../../../../hooks/useApplicant";
import type { Application, TableColumnProps } from "../../../../../lib/interfaces";

const ManageApplicants = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const savedListState = location.state?.listState;
  const skipInitialSearchReset = useRef(!!savedListState);
  const hasMounted = useRef(false);

  const [searchQuery, setSearchQuery] = useState(
    savedListState?.searchQuery || "",
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    savedListState?.searchQuery || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    savedListState?.statusFilter || "",
  );
  const [appliedFrom, setAppliedFrom] = useState(
    savedListState?.appliedFrom || "",
  );
  const [appliedTo, setAppliedTo] = useState(savedListState?.appliedTo || "");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(
    savedListState?.currentPage || 1,
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    savedListState?.itemsPerPage || 10,
  );

  // Debounce search
  useEffect(() => {
    if (skipInitialSearchReset.current) {
      skipInitialSearchReset.current = false;
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setCurrentPage(1);
  }, [statusFilter, appliedFrom, appliedTo]);

  // Fetch applicants via TanStack Query hook
  const {
    data: responseData,
    isLoading,
    error,
  } = useApplicants({
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearchQuery,
    status: statusFilter,
    applied_from: appliedFrom,
    applied_to: appliedTo,
  });

  const applicants: Application[] = responseData?.data?.data || [];
  const totalItems = responseData?.data?.total || 0;

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to fetch applicants"));
    }
  }, [error]);

  const columns: TableColumnProps<Application>[] = [
    {
      label: "Name",
      key: "name",
      render: (item) => (
        <span className="capitalize">
          {item.user?.firstname} {item.user?.lastname}
        </span>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (item) => <span>{item.user?.email || "-"}</span>,
    },
    {
      label: "Payment Method",
      key: "payment_method",
      render: (item) => <span>{formatUnderScores(item.payment_method, true)}</span>,
    },
    {
      label: "Reference",
      key: "reference",
      render: (item) => <span>{item.reference || "-"}</span>,
    },
    {
      label: "Amount",
      key: "amount",
      render: (item) => (
        <span>{formatterUtility(Number(item.amount))}</span>
      ),
    },
    {
      label: "Payment Status",
      key: "status",
      render: (item) => (
        <StatusCard
          type={
            item.status === "approved"
              ? "success"
              : item.status === "rejected"
                ? "failed"
                : "pending"
          }
          statusText={item.status || "N/A"}
        />
      ),
    },
    {
      label: "Date Created",
      key: "created_at",
      render: (item) => (
        <span>{formatISODateToCustom(item.created_at)}</span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={Number(item.id) || 0}
          onView={() =>
            navigate(`/dashboard/manage/applicants/${item.id}/view`, {
              state: {
                ...item,
                listState: {
                  searchQuery,
                  statusFilter,
                  appliedFrom,
                  appliedTo,
                  currentPage,
                  itemsPerPage,
                },
              },
            })
          }
          canView
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Manage Applicants</h2>
        <p className="text-sm text-tableHeading">
          View and manage all individuals who have shown interest in the housing
          scheme.
        </p>
      </div>

      <div className="grid gap-4 items-end grid-cols-12">
        <div className="relative w-full col-span-12 md:col-span-6 lg:col-span-4 h-12 bg-secondary border border-primary/10 rounded-lg flex gap-2 items-center px-3">
          <IoIosSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search Applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>
        <div className="flex flex-col gap-2 col-span-12 md:col-span-6 lg:col-span-3">
          <label className="text-xs font-semibold text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 rounded-lg bg-secondary border border-primary/10 outline-0 px-3 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 col-span-12 md:col-span-4 lg:col-span-2">
          <label className="text-xs font-semibold text-gray-700">
            Applied from
          </label>
          <input
            type="date"
            value={appliedFrom}
            onChange={(e) => setAppliedFrom(e.target.value)}
            className="h-12 rounded-lg bg-secondary border border-primary/10 outline-0 px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-2 col-span-12 md:col-span-4 lg:col-span-2">
          <label className="text-xs font-semibold text-gray-700">
            Applied to
          </label>
          <input
            type="date"
            value={appliedTo}
            onChange={(e) => setAppliedTo(e.target.value)}
            className="h-12 rounded-lg bg-secondary border border-primary/10 outline-0 px-3 text-sm"
          />
        </div>
        <div className="flex items-end col-span-12 md:col-span-4 lg:col-span-1">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("");
              setAppliedFrom("");
              setAppliedTo("");
            }}
            className="px-2 h-12 w-full rounded-lg bg-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            Reset filters
          </button>
        </div>
      </div>

      <ReusableTable
        columns={columns}
        data={applicants}
        isLoading={isLoading}
        error={error ? getErrorMessage(error) : null}
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage) || 1}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
};

export default ManageApplicants;
