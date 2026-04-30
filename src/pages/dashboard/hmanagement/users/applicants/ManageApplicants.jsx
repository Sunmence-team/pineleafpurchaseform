import React, { useState, useEffect } from "react";
import SideNav from "../../../../../components/SideNav";
import { branchOptions } from "../../../../../lib/branchList";
import assets from "../../../../../assets/assests";
import ReusableTable from "../../../../../utilities/ReusableTable";
import { useNavigate } from "react-router-dom";
import ActionCell from "../../../../../components/ActionCell";
import api, { getErrorMessage } from "../../../../../utilities/api";
import { toast } from "sonner";
import { FaBars, FaPlus } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchApplicants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/interest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: debouncedSearchQuery,
        },
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
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

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
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.uuid}
          onView={() =>
            navigate(`/dashboard/manage/applicants/${item.id}/view`, {
              state: item,
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
          <div className="relative w-full md:w-96 mb-8">
            <input
              type="text"
              placeholder="Search Applicants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
