import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa6";
import assets from "../../../../assets/assets";
import { api, getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import { IoIosSearch } from "react-icons/io";
import { formatterUtility } from "../../../../helpers/formatterUtility";
import { StatusTurnPriorityCard } from "../../../../components/cards/StatusCard";
import { branchOptions } from "../../../../lib/branchList";
import ReusableTable from "../../../../utilities/ReusableTable";

const ManageSubscriptions = () => {
  const token = localStorage.getItem("token");
  const [openMenu, setOpenMenu] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await hmApi.get(
        "/api/admin/subscriptions/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            per_page: itemsPerPage,
            search: debouncedSearchQuery,
            status: statusFilter,
            year: yearFilter,
          },
        },
      );

      const { data, total, last_page } = response.data.data;
      setTransactions(data || []);
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
    fetchTransactions();
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    statusFilter,
    yearFilter,
  ]);

  const columns = [
    {
      label: "Reference",
      key: "reference",
      render: (item) => item.reference || item.transaction_reference || item.id,
    },
    {
      label: "Customer",
      key: "customer",
      render: (item) =>
        item.user
          ? `${item.user.firstname || ""} ${item.user.lastname || ""}`.trim()
          : item.customer_name || item.customer_email || "-",
    },
    {
      label: "Email",
      key: "email",
      render: (item) => item.user?.email || item.customer_email || "-",
    },
    {
      label: "Amount",
      key: "amount",
      render: (item) =>
        formatterUtility(Number(item.amount || item.total || 0)),
    },
    {
      label: "Status",
      key: "status",
      render: (item) => (
        <StatusTurnPriorityCard
          status={item.status || item.transaction_status || item.payment_status}
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
            Manage Subscriptions
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid gap-4 mb-8 grid-cols-12 items-end">
            <div className="relative w-full md:col-span-4 h-12 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-secondary/50 flex gap-2 items-center px-3">
              <IoIosSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search subscription transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-semibold text-gray-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-12 rounded-lg outline-0 border border-gray-300 px-3 text-sm"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-semibold text-gray-700">
                Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-12 rounded-lg outline-0 border border-gray-300 px-3 text-sm"
              >
                <option value="">All</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                  setYearFilter("");
                }}
                className="h-12 w-full rounded-lg bg-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-300"
              >
                Reset filters
              </button>
            </div>
          </div>

          <ReusableTable
            columns={columns}
            data={transactions}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            emptyDataHeading="No transactions found"
            emptyDataMessage="There are currently no subscription transactions available."
          />
        </main>
      </div>
    </div>
  );
};

export default ManageSubscriptions;
