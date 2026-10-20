import React, { useState, useEffect, useRef } from "react";
import SideNav from "../../../../components/SideNav";
import { FaBars } from "react-icons/fa6";
import assets from "../../../../assets/assets";
import ReusableTable from "../../../../utilities/ReusableTable";
import { useNavigate, useLocation } from "react-router-dom";
import ActionCell from "../../../../components/ActionCell";
import { api, getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import { FaSearch } from "react-icons/fa";
import { branchOptions } from "../../../../lib/branchList";

const ManageUsers = () => {
  const token = localStorage.getItem("token");
  const [openMenu, setOpenMenu] = useState(false);
  const [users, setUsers] = useState([]);
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
  const [interestedFilter, setInterestedFilter] = useState(
    savedListState?.interestedFilter || "",
  );
  const [verifiedFilter, setVerifiedFilter] = useState(
    savedListState?.verifiedFilter || "",
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
  }, [interestedFilter, verifiedFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
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

  const columns = [
    {
      label: "Name",
      key: "name",
      render: (item) => (
        <span className="capitalize">
          {item.firstname} {item.lastname}
        </span>
      ),
    },
    {
      label: "Email",
      key: "email",
    },
    {
      label: "Phone",
      key: "phone",
    },
    {
      label: "Country",
      key: "country",
    },
    {
      label: "Interest Status",
      key: "interest_transactions_count",
      render: (item) => {
        const isVerified = item?.is_verified;
        const isInterested = item?.is_interested;
        const hasPendingIndication =
          item?.interest_transactions_count > 0 && !isInterested && !isVerified;
        const awaitingVerification =
          item?.interest_transactions_count > 0 && isInterested && !isVerified;
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SideNav
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        branches={branchOptions}
      />

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
            Manage Users
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid gap-4 mb-8 grid-cols-12 items-end">
            <div className="relative w-full md:col-span-5 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/50 flex gap-2 items-center px-3">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search Users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-semibold text-gray-700">
                Interest Indication
              </label>
              <select
                value={interestedFilter}
                onChange={(e) => setInterestedFilter(e.target.value)}
                className="h-12 rounded-lg border border-gray-300 outline-0 px-3 text-sm"
              >
                <option value="">All</option>
                <option value="1">Has interest indication</option>
                <option value="0">No interest indication</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-semibold text-gray-700">
                Verified
              </label>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="h-12 rounded-lg border border-gray-300 outline-0 px-3 text-sm"
              >
                <option value="">All</option>
                <option value="1">Verified</option>
                <option value="0">Not verified</option>
              </select>
            </div>

            <div className="flex items-end md:col-span-1">
              <button
                type="button"
                onClick={() => {
                  setInterestedFilter("");
                  setVerifiedFilter("");
                }}
                className="h-12 w-full rounded-lg bg-gray-300 text-sm font-semibold text-gray-700"
              >
                Reset filters
              </button>
            </div>
          </div>

          <ReusableTable
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
            emptyDataHeading="No users found"
            emptyDataMessage="There are currently no registered users."
          />
        </main>
      </div>
    </div>
  );
};

export default ManageUsers;
