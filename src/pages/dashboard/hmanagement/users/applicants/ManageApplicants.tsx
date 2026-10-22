import React, { useState, useEffect, useRef } from "react";
import assets from "../../../../../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import ActionCell from "../../../../../components/ui/ActionCell";
import { getErrorMessage, hmApi } from "../../../../../helpers/api";
import { toast } from "sonner";
import { FaBars, FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import {
  formatISODateToCustom,
  formatterUtility,
  formatUnderScores,
} from "../../../../../helpers/formatterUtility";
import { StatusTurnPriorityCard } from "../../../../../components/cards/StatusCard";
import { branchOptions } from "../../../../../lib/branchList";
import ReusableTable from "../../../../../utilities/ReusableTable";

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
      render: (item) => formatISODateToCustom(item.created_at),
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
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Manage Applicants</h2>
        <p className="text-sm text-tableHeading">
          View and manage all individuals who has shown interest in the housing
          sheme.
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
    </div>
  );
};

export default ManageApplicants;
