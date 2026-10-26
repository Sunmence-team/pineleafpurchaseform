import React, { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { BsBuildings, BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { toast } from "sonner";
import OverviewCards from "../../../components/cards/OverviewCards";
import ConfirmDialog from "../../../components/modals/ConfirmDialog";
import PropertyEntriesModal from "../../../components/modals/PropertyEntriesModal";
import ActionCell from "../../../components/ui/ActionCell";
import { getErrorMessage } from "../../../helpers/api";
import {
  formatterUtility,
  formatUnderScores,
} from "../../../helpers/formatterUtility";
import {
  useProperty,
  useUpdatePropertyStatus,
} from "../../../hooks/useProperty";
import type { PropertyProp, TableColumnProps } from "../../../lib/interfaces";
import ReusableTable from "../../../utilities/ReusableTable";
import StatusCard from "../../../components/cards/StatusCard";
import { FaEye } from "react-icons/fa6";

const Properties: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Status toggle confirmation
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetProperty, setTargetProperty] = useState<PropertyProp | null>(
    null,
  );

  const [onlineFilter, setOnlineFilter] = useState<string>("all");
  const [entriesModalOpen, setEntriesModalOpen] = useState(false);
  const [selectedPropertyForEntries, setSelectedPropertyForEntries] =
    useState<PropertyProp | null>(null);

  const { mutateAsync: updateStatus, isPending: isTogglingStatus } =
    useUpdatePropertyStatus();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useProperty({
    name: debouncedSearch,
    page: currentPage,
    per_page: itemsPerPage,
    sort_direction: "desc",
    is_online: onlineFilter,
  });

  const properties: PropertyProp[] = propertiesResponse?.data?.data ?? [];
  const propertiesMeta = propertiesResponse?.data ?? [];
  const totalItems = propertiesMeta?.total ?? 1;
  const totalPages = propertiesMeta?.last_page ?? 1;
  const stats = propertiesResponse?.stats;

  // Handle fetch error notification
  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to fetch properties"));
    }
  }, [error]);

  const handleToggleStatusClick = (property: PropertyProp) => {
    setTargetProperty(property);
    setStatusModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetProperty || targetProperty.id === undefined) return;

    const newIsOnline = !targetProperty.is_online;

    try {
      await updateStatus({
        id: targetProperty.id,
        is_online: newIsOnline,
      });

      toast.success(
        `Property "${targetProperty.name}" marked as ${
          newIsOnline ? "Online" : "Offline"
        }`,
      );
      setStatusModalOpen(false);
      setTargetProperty(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update property status"));
    }
  };

  const columns: TableColumnProps<PropertyProp>[] = [
    {
      label: "Property Name",
      key: "name",
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.name}</span>
      ),
    },
    {
      label: "Location",
      key: "location",
      render: (row) => <span>{row.location || "-"}</span>,
    },
    {
      label: "Type",
      key: "type",
      render: (row) => <span className="capitalize">{row.type || "N/A"}</span>,
    },
    {
      label: "Price",
      key: "price",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.price ? formatterUtility(Number(row.price)) : "-"}
        </span>
      ),
    },
    {
      label: "Record Count",
      key: "stats.online+stats.offline",
      render: (row) => {
        const count =
          Number(row.stats.no_of_online) + Number(row.stats.no_of_offline);
        return (
          <span className="font-medium text-gray-900">
            {formatterUtility(count, true)} Record{count > 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      label: "Status",
      key: "status",
      render: (row) => {
        const isOnline = Boolean(row.is_online);
        return (
          <StatusCard
            type={isOnline ? "success" : "failed"}
            statusText={isOnline ? "Online" : "Offline"}
          />
        );
      },
    },
    {
      label: "Action",
      key: "action",
      render: (row) => {
        const isOnline = Boolean(row.is_online);
        return (
          <ActionCell
            rowId={Number(row.id)}
            otherActions={[
              {
                name: "View Entries",
                icon: <FaEye className="text-primary size-4" />,
                action: () => {
                  setSelectedPropertyForEntries(row);
                  setEntriesModalOpen(true);
                },
              },
              {
                name: isOnline ? "Mark as Offline" : "Mark as Online",
                icon: isOnline ? (
                  <BsCloudSlash className="text-amber-600 size-4" />
                ) : (
                  <BsCloudCheck className="text-emerald-600 size-4" />
                ),
                action: () => handleToggleStatusClick(row),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Properties</h2>
          <p className="text-sm text-gray-500">
            Manage properties, search inventory and toggle availability.
          </p>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverviewCards
          title="Total Properties"
          value={totalItems}
          icon={BsBuildings}
          subtitle="All estate properties"
        />
        <OverviewCards
          title="Online Properties"
          value={stats?.no_of_online}
          icon={BsCloudCheck}
          subtitle="Currently active online"
        />
        <OverviewCards
          title="Offline Properties"
          value={stats?.no_of_offline}
          icon={BsCloudSlash}
          subtitle="Worked on / marked offline"
        />
      </div>

      {/* Search Bar & Filter */}
      <div className="flex md:flex-row flex-col gap-4">
        <div className="max-w-md w-full bg-secondary border border-primary/10 rounded-lg relative flex gap-2 items-center h-12 px-4">
          <BiSearch className="w-4 h-4 md:w-5 md:h-5 opacity-50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search properties by name..."
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>
        <select
          value={onlineFilter}
          onChange={(e) => {
            setOnlineFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-secondary border border-primary/10 rounded-lg h-12 px-4 outline-0"
        >
          {[
            { label: "All", value: "all" },
            { label: "Online", value: "1" },
            { label: "Offline", value: "0" },
          ].map((tab) => (
            <option key={tab.value} value={tab.value}>
              {formatUnderScores(tab.label, true)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <ReusableTable
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
        hasSerialNo={true}
        getRowId={(row) => row.id}
      />

      {/* Confirm Status Toggle Dialog */}
      <ConfirmDialog
        isOpen={statusModalOpen && Boolean(targetProperty)}
        isLoading={isTogglingStatus}
        title={
          targetProperty
            ? `Mark "${targetProperty.name}" as ${
                targetProperty.is_online ? "Offline" : "Online"
              }?`
            : "Confirm Status Change"
        }
        message={
          targetProperty
            ? `Are you sure you want to change the status of this property to ${
                targetProperty.is_online ? "Offline" : "Online"
              }? This status indicates whether the property is worked on online or offline.`
            : ""
        }
        confirmText={
          targetProperty && targetProperty.is_online
            ? "Yes, Mark Offline"
            : "Yes, Mark Online"
        }
        onCancel={() => {
          if (!isTogglingStatus) {
            setStatusModalOpen(false);
            setTargetProperty(null);
          }
        }}
        onConfirm={handleConfirmToggleStatus}
      />

      {/* Property Entries Modal */}
      {entriesModalOpen && selectedPropertyForEntries && (
        <PropertyEntriesModal
          property={selectedPropertyForEntries}
          onClose={() => {
            setEntriesModalOpen(false);
            setSelectedPropertyForEntries(null);
          }}
        />
      )}
    </div>
  );
};

export default Properties;
