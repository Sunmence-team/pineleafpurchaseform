import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActionCell from "../../../../components/ui/ActionCell";
import { hmApi, getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import { IoIosSearch } from "react-icons/io";
import ReusableTable from "../../../../utilities/ReusableTable";
import type { TableColumnProps } from "../../../../lib/interfaces";

export interface UserItem {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  country?: string;
  is_verified?: number | boolean;
  is_interested?: number | boolean;
  interest_transactions_count?: number;
  admin_approved_salary?: boolean | number;
  [key: string]: any;
}

const ManageUsers: React.FC = () => {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState<UserItem[]>([]);
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
  const [interestedFilter, setInterestedFilter] = useState(
    savedListState?.interestedFilter || ""
  );
  const [verifiedFilter, setVerifiedFilter] = useState(
    savedListState?.verifiedFilter || ""
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
  }, [interestedFilter, verifiedFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        per_page: itemsPerPage,
        search: debouncedSearchQuery,
      };

      if (interestedFilter !== "")
        params.is_interested = Number(interestedFilter);
      if (verifiedFilter !== "") params.is_verified = Number(verifiedFilter);

      const response = await hmApi.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      const { data, total, last_page } = response.data.data;
      setUsers(data);
      setTotalItems(total);
      setTotalPages(last_page);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    interestedFilter,
    verifiedFilter,
  ]);

  const columns: TableColumnProps<UserItem>[] = [
    {
      label: "Name",
      key: "name",
      render: (item) => (
        <span className="capitalize font-medium text-tableData">
          {item.firstname} {item.lastname}
        </span>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (item) => <span>{item.email ?? "-"}</span>,
    },
    {
      label: "Phone",
      key: "phone",
      render: (item) => <span>{item.phone ?? "-"}</span>,
    },
    {
      label: "Country",
      key: "country",
      render: (item) => <span>{item.country ?? "-"}</span>,
    },
    {
      label: "Interest Status",
      key: "interest_transactions_count",
      render: (item) => {
        const isVerified = item?.is_verified;
        const isInterested = item?.is_interested;
        const count = item?.interest_transactions_count ?? 0;
        const hasPendingIndication = count > 0 && !isInterested && !isVerified;
        const awaitingVerification = count > 0 && isInterested && !isVerified;
        return (
          <p>
            {hasPendingIndication
              ? "Has Pending Indication"
              : awaitingVerification
                ? "Awaiting Verification"
                : isVerified && item?.admin_approved_salary
                  ? "Verified"
                  : "No indication"}
          </p>
        );
      },
    },
    {
      label: "Action",
      key: "action",
      tableHeadingClassName: "text-center",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={(id) =>
            navigate(`/dashboard/manage/users/${id}/view`, {
              state: {
                ...item,
                listState: {
                  searchQuery,
                  interestedFilter,
                  verifiedFilter,
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
        <h2 className="text-lg font-semibold">Manage Users</h2>
        <p className="text-sm text-tableHeading">
          View, search and manage all registered system users.
        </p>
      </div>

      <div className="grid gap-4 items-end grid-cols-12">
        <div className="relative w-full col-span-12 md:col-span-6 lg:col-span-5 h-12 bg-secondary border border-primary/10 rounded-lg flex gap-2 items-center px-3">
          <IoIosSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search Users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>
        <div className="flex flex-col gap-2 col-span-12 md:col-span-6 lg:col-span-3">
          <label className="text-xs font-semibold text-gray-700">
            Interest Indication
          </label>
          <select
            value={interestedFilter}
            onChange={(e) => setInterestedFilter(e.target.value)}
            className="h-12 rounded-lg bg-secondary border border-primary/10 outline-0 px-3 text-sm"
          >
            <option value="">All</option>
            <option value="1">Has interest indication</option>
            <option value="0">No interest indication</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 col-span-12 md:col-span-6 lg:col-span-3">
          <label className="text-xs font-semibold text-gray-700">
            Verified
          </label>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="h-12 rounded-lg bg-secondary border border-primary/10 outline-0 px-3 text-sm"
          >
            <option value="">All</option>
            <option value="1">Verified</option>
            <option value="0">Not verified</option>
          </select>
        </div>

        <div className="flex items-end col-span-12 md:col-span-6 lg:col-span-1">
          <button
            type="button"
            onClick={() => {
              setInterestedFilter("");
              setVerifiedFilter("");
            }}
            className="px-2 h-12 w-full rounded-lg bg-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      </div>

      <ReusableTable<UserItem>
        columns={columns}
        data={users}
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

export default ManageUsers;
