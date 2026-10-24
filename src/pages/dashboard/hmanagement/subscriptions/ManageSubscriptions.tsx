import React, { useState, useEffect } from "react";
import { getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import { IoIosSearch } from "react-icons/io";
import { formatterUtility } from "../../../../helpers/formatterUtility";
import ReusableTable from "../../../../utilities/ReusableTable";
import type { SubscriptionTransaction, TableColumnProps } from "../../../../lib/interfaces";
import StatusCard from "../../../../components/cards/StatusCard";
import { useSubscriptions } from "../../../../hooks/useSubscriptions";

const ManageSubscriptions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // TanStack Query hook for subscriptions
  const {
    data: responseData,
    isLoading,
    error,
  } = useSubscriptions({
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearchQuery,
    status: statusFilter,
    year: yearFilter,
  });

  const transactions: SubscriptionTransaction[] =
    responseData?.data?.data || [];
  const totalItems = responseData?.data?.total || 0;
  const totalPages = responseData?.data?.last_page || 1;

  useEffect(() => {
    if (error) {
      toast.error(
        getErrorMessage(error, "Failed to fetch subscription transactions"),
      );
    }
  }, [error]);

  const columns: TableColumnProps<SubscriptionTransaction>[] = [
    {
      label: "Reference",
      key: "reference",
      render: (item) => (
        <span className="font-medium text-tableData">
          {item.reference || item.transaction_reference || item.id}
        </span>
      ),
    },
    {
      label: "Customer",
      key: "customer",
      render: (item) => (
        <span className="capitalize font-medium text-tableData">
          {item.user
            ? `${item.user.firstname || ""} ${item.user.lastname || ""}`.trim()
            : item.customer_name || item.customer_email || "-"}
        </span>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (item) => (
        <span>{item.user?.email || item.customer_email || "-"}</span>
      ),
    },
    {
      label: "Amount",
      key: "amount",
      render: (item) => (
        <span className="font-medium text-tableData">
          {formatterUtility(Number(item.amount || item.total || 0))}
        </span>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (item) => (
        <StatusCard
          type={item.status || item.transaction_status || item.payment_status}
          statusText={
            item.status || item.transaction_status || item.payment_status
          }
        />
      ),
    },
    {
      label: "Date",
      key: "created_at",
      render: (item) => {
        const date = item.created_at || item.paid_at || item.updated_at;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Manage Subscriptions</h2>
        <p className="text-sm text-tableHeading">
          View, search and manage all subscription transactions and records.
        </p>
      </div>

      <div className="grid gap-4 items-end grid-cols-12">
        <div className="relative w-full col-span-12 md:col-span-6 lg:col-span-4 h-12 bg-secondary border border-primary/10 rounded-lg flex gap-2 items-center px-3">
          <IoIosSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search subscription transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-2 col-span-12 md:col-span-6 lg:col-span-3">
          <label className="text-xs font-semibold text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-12 rounded-lg bg-secondary border border-primary/10 outline-0 px-3 text-sm"
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 col-span-12 md:col-span-6 lg:col-span-3">
          <label className="text-xs font-semibold text-gray-700">Year</label>
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-12 rounded-lg bg-secondary border border-primary/10 outline-0 px-3 text-sm"
          >
            <option value="">All</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        <div className="flex items-end col-span-12 md:col-span-6 lg:col-span-2">
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setYearFilter("");
            }}
            className="px-2 h-12 w-full rounded-lg bg-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      </div>

      <ReusableTable<SubscriptionTransaction>
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        error={error ? getErrorMessage(error) : null}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        getRowId={(item) => item.id}
      />
    </div>
  );
};

export default ManageSubscriptions;
