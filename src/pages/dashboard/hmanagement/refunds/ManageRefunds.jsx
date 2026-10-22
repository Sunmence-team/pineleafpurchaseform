import React, { useState, useEffect, useRef } from "react";
import { FaBars } from "react-icons/fa6";
import assets from "../../../../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import ActionCell from "../../../../components/ui/ActionCell";
import { api, getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import { formatterUtility } from "../../../../helpers/formatterUtility";
import { IoIosSearch } from "react-icons/io";
import { branchOptions } from "../../../../lib/branchList";
import ReusableTable from "../../../../utilities/ReusableTable";

const ManageRefunds = () => {
  const token = localStorage.getItem("token");
  const [openMenu, setOpenMenu] = useState(false);
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(
    savedListState?.currentPage || 1,
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    savedListState?.itemsPerPage || 10,
  );
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
  }, [statusFilter]);

  const fetchRefunds = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await hmApi.get("/api/admin/refunds", {
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
      if (response.status === 200) {
        // Assuming the response structure is similar to applications
        const { data, total, last_page } = response.data.data;
        setRefunds(data || []);
        setTotalItems(total || 0);
        setTotalPages(last_page || 1);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, statusFilter]);

  const columns = [
    {
      label: "User",
      key: "user",
      render: (item) => (
        <span className="capitalize">
          {item.user?.firstname} {item.user?.lastname}
        </span>
      ),
    },
    {
      label: "Account Name",
      key: "account_name",
      render: (item) => <span className="capitalize">{item.account_name}</span>,
    },
    {
      label: "Bank",
      key: "bank_name",
      render: (item) => <span>{item.bank_name}</span>,
    },
    {
      label: "Amount",
      key: "amount",
      render: (item) => formatterUtility(Number(item.amount)),
    },
    {
      label: "Status",
      key: "status",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            item.status === "settled"
              ? "bg-green-100 text-green-700"
              : item.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      label: "Date",
      key: "created_at",
      render: (item) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={(id) =>
            navigate(`/dashboard/manage/refunds/${id}/view`, {
              state: {
                refund: item,
                listState: {
                  searchQuery,
                  statusFilter,
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center bg-white shadow-sm z-10 w-full px-4 md:px-6 lg:px-8 py-4">
          <button
            onClick={() => setOpenMenu(true)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <img src={assets.logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-gray-900 ps-6 truncate">
            Manage Refunds
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid gap-4 mb-8 grid-cols-12 items-end">
            <div className="relative w-full md:col-span-6 h-12 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-secondary/50 flex gap-2 items-center px-3">
              <IoIosSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search Refunds..."
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
                <option value="settled">Settled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end md:col-span-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                }}
                className="h-12 w-full rounded-lg bg-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-300"
              >
                Reset filters
              </button>
            </div>
          </div>
          <ReusableTable
            columns={columns}
            data={refunds}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            emptyDataHeading="No refunds found"
            emptyDataMessage="There are currently no refund requests in the system."
          />
        </main>
      </div>
    </div>
  );
};

export default ManageRefunds;
