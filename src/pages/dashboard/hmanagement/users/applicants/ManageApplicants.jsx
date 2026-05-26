import React, { useState, useEffect, useRef } from "react";
import SideNav from "../../../../../components/SideNav";
import { branchOptions } from "../../../../../lib/branchList";
import assets from "../../../../../assets/assests";
import ReusableTable from "../../../../../utilities/ReusableTable";
import { useNavigate, useLocation } from "react-router-dom";
import ActionCell from "../../../../../components/ActionCell";
import api, { getErrorMessage } from "../../../../../utilities/api";
import { toast } from "sonner";
import { FaBars, FaPlus } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import {
  formatISODateToCustom,
  formatterUtility,
  formatUnderScores,
} from "../../../../../utilities/formatterUtility";
import { StatusTurnPriorityCard } from "../../../../../components/cards/StatusCard";

const ManageApplicants = () => {
  const token = localStorage.getItem("token");
  const [openMenu, setOpenMenu] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
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
  const [totalItems, setTotalItems] = useState(0);

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

  const fetchApplicants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: debouncedSearchQuery,
      };

      if (statusFilter) params.status = statusFilter;
      if (appliedFrom) params.applied_from = appliedFrom;
      if (appliedTo) params.applied_to = appliedTo;

      const response = await api.get("/api/interest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (response.status === 200) {
        const { data, total } = response.data.data;
        setApplicants(data);
        setTotalItems(total);
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
    fetchApplicants();
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    statusFilter,
    appliedFrom,
    appliedTo,
  ]);

  const columns = [
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
      render: (item) => item.user?.email,
    },
    {
      label: "Payment Method",
      key: "payment_method",
      render: (item) =>
        formatUnderScores(item.payment_method, { capitalize: true }),
    },
    {
      label: "Reference",
      key: "reference",
    },
    {
      label: "Amount",
      key: "amount",
      render: (item) => formatterUtility(Number(item.amount)),
    },
    {
      label: "Payment Status",
      key: "status",
      render: (item) => <StatusTurnPriorityCard status={item.status} />,
    },
    {
      label: "Date Created",
      key: "created_at",
      render: (item) => (
        formatISODateToCustom(item.created_at)
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.uuid}
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
            Manage Applicants
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid gap-4 mb-8 items-end grid-cols-12">
            <div className="relative w-full col-span-12 md:col-span-6 lg:col-span-4 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 flex gap-2 items-center px-3">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search Applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2 col-span-12 md:col-span-6 lg:col-span-3">
              <label className="text-xs font-semibold text-gray-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 rounded-lg border border-gray-300 outline-0 px-3 text-sm"
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
                className="h-12 rounded-lg border border-gray-300 outline-0 px-3 text-sm"
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
                className="h-12 rounded-lg border border-gray-300 outline-0 px-3 text-sm"
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
                className="h-12 w-full rounded-lg bg-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Reset filters
              </button>
            </div>
          </div>

          <ReusableTable
            columns={columns}
            data={applicants}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage) || 1}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            emptyDataHeading="No Applicants found"
            emptyDataMessage="Try adjusting your search or add a new property."
          />
        </main>
      </div>
    </div>
  );
};

export default ManageApplicants;
