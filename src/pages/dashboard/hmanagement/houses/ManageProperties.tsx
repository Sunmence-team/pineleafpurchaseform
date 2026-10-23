import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActionCell from "../../../../components/ui/ActionCell";
import { getErrorMessage } from "../../../../helpers/api";
import { toast } from "sonner";
import ConfirmDialog from "../../../../components/modals/ConfirmDialog";
import { FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import ReusableTable from "../../../../utilities/ReusableTable";
import type { TableColumnProps } from "../../../../lib/interfaces";
import ActionButton from "../../../../components/ui/ActionButton";
import { useHouses, useDeleteHouse } from "../../../../hooks/useHouse";
import type { HouseItem } from "../../../../services/houseService";

export type PropertyItem = HouseItem;

const ManageProperties: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch houses via TanStack Query hook
  const {
    data: responseData,
    isLoading,
    error,
  } = useHouses({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchQuery,
  });

  const properties: HouseItem[] = responseData?.data?.data || [];
  const totalItems = responseData?.data?.total || 0;
  const totalPages =
    responseData?.data?.last_page || Math.ceil(totalItems / itemsPerPage) || 1;

  // Delete mutation
  const deleteMutation = useDeleteHouse();

  const handleDelete = async () => {
    if (!propertyToDelete) return;
    try {
      await deleteMutation.mutateAsync(propertyToDelete);
      toast.success("Property deleted successfully");
      setPropertyToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns: TableColumnProps<HouseItem>[] = [
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

      <ReusableTable<HouseItem>
        columns={columns}
        data={properties}
        isLoading={isLoading}
        error={error ? getErrorMessage(error) : null}
        currentPage={currentPage}
        totalPages={totalPages}
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
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ManageProperties;
