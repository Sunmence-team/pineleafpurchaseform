import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActionCell from "../../../../components/ui/ActionCell";
import { hmApi, getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import { formatterUtility } from "../../../../helpers/formatterUtility";
import { IoIosSearch } from "react-icons/io";
import ReusableTable from "../../../../utilities/ReusableTable";
import type { TableColumnProps } from "../../../../lib/interfaces";

export interface PurchaseItem {
  id: number;
  status?: string;
  created_at?: string;
  user?: {
    firstname?: string;
    lastname?: string;
    email?: string;
    [key: string]: any;
  };
  property?: {
    name?: string;
    price?: number | string;
    [key: string]: any;
  };
  [key: string]: any;
}

const ManagePurchases: React.FC = () => {
  const token = localStorage.getItem("token");
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const savedListState = location.state?.listState;
  const skipInitialSearchReset = useRef(!!savedListState);
  const hasMounted = useRef(false);

  const [searchQuery, setSearchQuery] = useState(
    savedListState?.searchQuery || ""
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    savedListState?.searchQuery || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    savedListState?.statusFilter || ""
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(
    savedListState?.currentPage || 1
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    savedListState?.itemsPerPage || 10
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

  const fetchPurchases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await hmApi.get("/api/admin/applications", {
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
        const { data, total, last_page } = response.data.data;
        setPurchases(data || []);
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
    fetchPurchases();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, statusFilter]);

  const columns: TableColumnProps<PurchaseItem>[] = [
    {
      label: "Applicant",
      key: "user",
      render: (item) => (
        <span className="capitalize font-medium text-tableData">
          {item.user?.firstname} {item.user?.lastname}
        </span>
      ),
    },
    {
      label: "Property",
      key: "property",
      render: (item) => <span>{item.property?.name ?? "-"}</span>,
    },
    {
      label: "Amount",
      key: "price",
      render: (item) => (
        <span className="font-medium text-tableData">
          {formatterUtility(Number(item.property?.price))}
        </span>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            item.status === "approved"
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
      render: (item) =>
        item.created_at ? new Date(item.created_at).toLocaleDateString() : "-",
    },
    {
      label: "Action",
      key: "action",
      tableHeadingClassName: "text-center",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={(id) =>
            navigate(`/dashboard/manage/purchases/${id}/view`, {
              state: {
                ...item,
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
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Manage Purchases</h2>
        <p className="text-sm text-tableHeading">
          View, search and manage all property purchase applications.
        </p>
      </div>

      <div className="grid gap-4 items-end grid-cols-12">
        <div className="relative w-full col-span-12 md:col-span-6 lg:col-span-5 h-12 bg-secondary border border-primary/10 rounded-lg flex gap-2 items-center px-3">
          <IoIosSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search Purchases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-2 col-span-12 md:col-span-6 lg:col-span-4">
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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

      <ReusableTable<PurchaseItem>
        columns={columns}
        data={purchases}
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
    </div>
  );
};

export default ManagePurchases;
