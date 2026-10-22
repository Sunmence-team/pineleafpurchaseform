import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActionCell from "../../../../components/ui/ActionCell";
import { hmApi, getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import ConfirmDialog from "../../../../components/modals/ConfirmDialog";
import { FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import ReusableTable from "../../../../utilities/ReusableTable";
import type { TableColumnProps } from "../../../../lib/interfaces";
import ActionButton from "../../../../components/ui/ActionButton";

export interface PropertyItem {
  id: number;
  name?: string;
  estate_name?: string;
  location?: string;
  price?: number | string;
  [key: string]: any;
}

const ManageProperties: React.FC = () => {
  const token = localStorage.getItem("token");
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
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
      const response = await hmApi.get("/api/admin/properties", {
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
      await hmApi.delete(`/api/admin/properties/${propertyToDelete}`, {
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

  const columns: TableColumnProps<PropertyItem>[] = [
    {
      label: "Property Name",
      key: "name",
      render: (item) => (
        <span className="font-medium text-tableData">{item.name ?? "-"}</span>
      ),
    },
    {
      label: "Estate Name",
      key: "estate_name",
      render: (item) => <span>{item.estate_name ?? "-"}</span>,
    },
    {
      label: "Location",
      key: "location",
      render: (item) => <span>{item.location ?? "-"}</span>,
    },
    {
      label: "Price",
      key: "price",
      render: (item) => (
        <span className="font-medium text-tableData">
          {item.price ? `₦${Number(item.price).toLocaleString()}` : "-"}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      tableHeadingClassName: "text-center",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={() =>
            navigate(`/dashboard/manage/properties/${item.id}/view`)
          }
          onEdit={() =>
            navigate(`/dashboard/manage/properties/${item.id}/edit`)
          }
          onDelete={() => setPropertyToDelete(item.id)}
          canView
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex lg:items-center gap-4 justify-between lg:flex-row flex-col">
        <div>
          <h2 className="text-lg font-semibold">Manage Properties</h2>
          <p className="text-sm text-tableHeading">
            View, search, edit and manage all properties on the housing scheme.
          </p>
        </div>
        <ActionButton
          text="Create New Property"
          icon={<FaPlus className="w-3.5 h-3.5 mr-1" />}
          action={() => navigate("/dashboard/manage/properties/create")}
          buttonStyle="text-white font-medium"
        />
      </div>

      <div className="grid gap-4 items-end grid-cols-12">
        <div className="relative w-full col-span-12 md:col-span-6 lg:col-span-5 h-12 bg-secondary border border-primary/10 rounded-lg flex gap-2 items-center px-3">
          <IoIosSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>
      </div>

      <ReusableTable<PropertyItem>
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
        getRowId={(item) => item.id}
      />

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
