import React, { useState, useEffect } from "react";
import SideNav from "../../../../components/SideNav";
import { branchOptions } from "../../../../lib/branchList";
import { FaBars } from "react-icons/fa6";
import assets from "../../../../assets/assests";
import ReusableTable from "../../../../utilities/ReusableTable";
import { useNavigate } from "react-router-dom";
import ActionCell from "../../../../components/ActionCell";
import api, { getErrorMessage } from "../../../../utilities/api";
import { toast } from "sonner";
import { formatterUtility } from "../../../../utilities/formatterUtility";

const ManagePurchases = () => {
    const token = localStorage.getItem("token");
  const [openMenu, setOpenMenu] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPurchases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/admin/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          per_page: itemsPerPage,
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
  }, [currentPage, itemsPerPage]);

  const columns = [
    {
      label: "Applicant",
      key: "user",
      render: (item) => (
        <span className="capitalize">
          {item.user?.firstname} {item.user?.lastname}
        </span>
      ),
    },
    {
      label: "Property",
      key: "property",
      render: (item) => <span>{item.property?.name}</span>,
    },
    {
      label: "Amount",
      key: "price",
      render: (item) => formatterUtility(Number(item.property?.price)),
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
      render: (item) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={(id) =>
            navigate(`/dashboard/manage/purchases/${id}/view`, {
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
            Manage Purchases
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <ReusableTable
            columns={columns}
            data={purchases}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage) || 1}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            emptyDataHeading="No purchases found"
            emptyDataMessage="There are currently no property applications in the system."
          />
        </main>
      </div>
    </div>
  );
};

export default ManagePurchases;
