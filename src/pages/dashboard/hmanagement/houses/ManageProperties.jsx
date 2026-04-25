import React, { useState, useEffect } from "react";
import SideNav from "../../../../components/SideNav";
import { branchOptions } from "../../../../lib/branchList";
import assets from "../../../../assets/assests";
import ReusableTable from "../../../../utilities/ReusableTable";
import { useNavigate } from "react-router-dom";
import ActionCell from "../../../../components/ActionCell";
import api, { getErrorMessage } from "../../../../utilities/api";
import { toast } from "sonner";
import ConfirmDialog from "../../../../components/modals/confirmdialog";
import { FaBars, FaPlus } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";

const ManageProperties = () => {
  const token = localStorage.getItem("token");
  const [openMenu, setOpenMenu] = useState(false);
  const [properties, setProperties] = useState([]);
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

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/properties", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchQuery,
        },
      });

      if (response.status === 200) {
        const { data, total } = response.data.data;
        setProperties(data);
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
    fetchProperties();
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  const handleDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/properties/${propertyToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Property deleted successfully");
      setPropertyToDelete(null);
      fetchProperties();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      label: "Property Name",
      key: "name",
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      label: "Estate Name",
      key: "estate_name",
    },
    {
      label: "Location",
      key: "location",
    },
    {
      label: "Price",
      key: "price",
      render: (item) => `₦${Number(item.price).toLocaleString()}`,
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.uuid}
          onView={() => navigate(`/dashboard/manage/listings/${item.uuid}/view`)}
          onEdit={() => navigate(`/dashboard/manage/listings/${item.uuid}/edit`)}
          onDelete={() => setPropertyToDelete(item.uuid)}
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
            Manage Properties
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => navigate("/dashboard/manage/listings/create")}
              className="flex items-center gap-2 bg-secClr text-white px-4 py-2 rounded-lg transition"
            >
              <FaPlus /> Create Property
            </button>
          </div>

          <ReusableTable
            columns={columns}
            data={properties}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage) || 1}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            emptyDataHeading="No properties found"
            emptyDataMessage="Try adjusting your search or add a new property."
          />
        </main>
      </div>

      <ConfirmDialog
        isOpen={!!propertyToDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setPropertyToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageProperties;
