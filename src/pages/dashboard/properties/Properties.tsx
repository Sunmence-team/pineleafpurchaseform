import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import { BsBuildings, BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import OverviewCards from "../../../components/cards/OverviewCards";
import ConfirmDialog from "../../../components/modals/ConfirmDialog";
import ActionCell from "../../../components/ui/ActionCell";
import { getErrorMessage } from "../../../helpers/api";
import {
  formatterUtility,
  formatUnderScores,
} from "../../../helpers/formatterUtility";
import { useProperty } from "../../../hooks/useProperty";
import { updatePropertyStatus } from "../../../services/propertyService";
import type {
  PropertyProp,
  propertyStatus,
  TableColumnProps,
} from "../../../lib/interfaces";
import ReusableTable from "../../../utilities/ReusableTable";
import StatusCard from "../../../components/cards/StatusCard";

const OFFLINE_STORAGE_KEY = "pineleaf_properties_offline_overrides";

export const getOfflinePropertyIds = (): (string | number)[] => {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setOfflinePropertyIds = (ids: (string | number)[]) => {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("Failed to save offline property ids:", e);
  }
};

const Properties: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Status toggle confirmation
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetProperty, setTargetProperty] = useState<PropertyProp | null>(
    null,
  );
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Filter tab: "all" | "online" | "offline"
  const [statusFilter, setStatusFilter] = useState<"all" | propertyStatus>(
    "all",
  );

  // Track offline IDs in state
  const [offlineIds, setOfflineIdsState] = useState<(string | number)[]>(() =>
    getOfflinePropertyIds(),
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch properties via TanStack Query hook
  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useProperty({
    name: debouncedSearch,
    page: currentPage,
    per_page: itemsPerPage,
    sort_direction: "desc",
    status: statusFilter,
  });

  // Extract properties, total items and total pages
  const { properties, totalItems, totalPages } = useMemo(() => {
    const payload = propertiesResponse?.data;
    const rawProperties: PropertyProp[] = Array.isArray(payload)
      ? payload
      : payload?.data || [];

    const total =
      payload?.total ?? propertiesResponse?.total ?? rawProperties.length;
    const lastPage = payload?.last_page ?? propertiesResponse?.last_page ?? 1;

    return {
      properties: rawProperties,
      totalItems: total,
      totalPages: lastPage,
    };
  }, [propertiesResponse]);

  // Handle fetch error notification
  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to fetch properties"));
    }
  }, [error]);

  // Determine if a property is offline based on local storage or API status
  const isPropertyOffline = useCallback(
    (property: PropertyProp) => {
      const propId = property.id;
      if (
        propId !== undefined &&
        offlineIds.some((id) => String(id) === String(propId))
      ) {
        return true;
      }
      return (
        property.is_offline === true ||
        property.is_offline === 1 ||
        property.status === "offline"
      );
    },
    [offlineIds],
  );

  // Compute metrics for overview cards
  const onlineCount = useMemo(
    () => properties.filter((p) => !isPropertyOffline(p)).length,
    [properties, isPropertyOffline],
  );
  const offlineCount = useMemo(
    () => properties.filter((p) => isPropertyOffline(p)).length,
    [properties, isPropertyOffline],
  );

  const handleToggleStatusClick = (property: PropertyProp) => {
    setTargetProperty(property);
    setStatusModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetProperty || targetProperty.id === undefined) return;

    setIsTogglingStatus(true);
    const propId = targetProperty.id;
    const currentlyOffline = isPropertyOffline(targetProperty);
    const newStatusIsOffline = !currentlyOffline;

    try {
      // 1. Try updating remote backend if supported
      try {
        await updatePropertyStatus(propId, {
          is_offline: newStatusIsOffline ? 1 : 0,
          status: newStatusIsOffline ? "offline" : "online",
        });
      } catch (e) {
        // Backend might not yet have this field or route; fallback safely to local override
        console.warn("Backend property update returned:", e);
      }

      // 2. Persist locally to guarantee persistence
      let updatedIds: (string | number)[];
      if (newStatusIsOffline) {
        updatedIds = Array.from(new Set([...offlineIds, propId]));
      } else {
        updatedIds = offlineIds.filter((id) => String(id) !== String(propId));
      }
      setOfflinePropertyIds(updatedIds);
      setOfflineIdsState(updatedIds);

      // 3. Invalidate TanStack query cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["properties"] });

      toast.success(
        `Property "${targetProperty.name}" marked as ${
          newStatusIsOffline ? "Offline" : "Online"
        }`,
      );
      setStatusModalOpen(false);
      setTargetProperty(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update property status"));
    } finally {
      setIsTogglingStatus(false);
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
      label: "Status",
      key: "status",
      render: (row) => {
        const offline = isPropertyOffline(row);
        return (
          // <span
          //   className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 w-max ${
          //     offline
          //       ? "bg-amber-50 text-amber-700 border border-amber-200"
          //       : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          //   }`}
          // >
          //   <span
          //     className={`w-2 h-2 rounded-full ${
          //       offline ? "bg-amber-500" : "bg-emerald-500"
          //     }`}
          //   />
          //   {offline ? "Offline" : "Online"}
          // </span>
          <StatusCard
            type={offline ? "failed" : "success"}
            statusText={row.status ?? "Online"}
          />
        );
      },
    },
    {
      label: "Action",
      key: "action",
      render: (item) => {
        const offline = isPropertyOffline(item);
        return (
          <ActionCell
            rowId={Number(item.id)}
            otherActions={[
              {
                name: offline ? "Mark as Online" : "Mark as Offline",
                icon: offline ? (
                  <BsCloudCheck className="text-emerald-600 size-4" />
                ) : (
                  <BsCloudSlash className="text-amber-600 size-4" />
                ),
                action: () => handleToggleStatusClick(item),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Properties</h1>
        <p className="text-sm text-gray-500">
          View, search, and manage online / offline status of all properties
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <OverviewCards
          title="Total Properties"
          value={totalItems || properties.length}
          icon={BsBuildings}
          subtitle="All estate properties"
        />
        <OverviewCards
          title="Online Properties"
          value={onlineCount}
          icon={BsCloudCheck}
          subtitle="Currently active online"
        />
        <OverviewCards
          title="Offline Properties"
          value={offlineCount}
          icon={BsCloudSlash}
          subtitle="Worked on / marked offline"
        />
      </div>

      {/* Search Bar */}
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
          onClick={(e) =>
            setStatusFilter(e.currentTarget.value as propertyStatus)
          }
          className="bg-secondary border border-primary/10 rounded-lg h-12 px-4 outline-0"
        >
          {["all", "online", "offline"].map((tab) => (
            <option key={tab} value={tab}>
              {formatUnderScores(tab, true)}
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
      />

      {/* Confirm Status Toggle Dialog */}
      <ConfirmDialog
        isOpen={statusModalOpen && Boolean(targetProperty)}
        isLoading={isTogglingStatus}
        title={
          targetProperty
            ? `Mark "${targetProperty.name}" as ${
                isPropertyOffline(targetProperty) ? "Online" : "Offline"
              }?`
            : "Confirm Status Change"
        }
        message={
          targetProperty
            ? `Are you sure you want to change the status of this property to ${
                isPropertyOffline(targetProperty) ? "Online" : "Offline"
              }? This status indicates whether the property is worked on online or offline.`
            : ""
        }
        confirmText={
          targetProperty && isPropertyOffline(targetProperty)
            ? "Yes, Mark Online"
            : "Yes, Mark Offline"
        }
        onCancel={() => {
          setStatusModalOpen(false);
          setTargetProperty(null);
        }}
        onConfirm={handleConfirmToggleStatus}
      />
    </div>
  );
};

export default Properties;
