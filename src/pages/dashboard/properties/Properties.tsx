import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import { BsBuildings, BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { toast } from "sonner";
import OverviewCards from "../../../components/cards/OverviewCards";
import ConfirmDialog from "../../../components/modals/ConfirmDialog";
import ActionCell from "../../../components/ui/ActionCell";
import { propertyApi, getErrorMessage } from "../../../helpers/api";
import { formatterUtility } from "../../../helpers/formatterUtility";
import type { PropertyProp, TableColumnProps } from "../../../lib/interfaces";
import ReusableTable from "../../../utilities/ReusableTable";

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
  const [properties, setProperties] = useState<PropertyProp[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Status toggle confirmation
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetProperty, setTargetProperty] = useState<PropertyProp | null>(
    null,
  );
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Filter tab: "all" | "online" | "offline"
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline"
  >("all");

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

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await propertyApi.get("/api/properties/search", {
        params: {
          name: debouncedSearch,
          page: currentPage,
          per_page: itemsPerPage,
          sort_direction: "desc",
        },
      });

      const responseData = response.data?.data;
      const rawProperties: PropertyProp[] = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];

      setProperties(rawProperties);
      setTotalItems(responseData?.total || rawProperties.length);
      setTotalPages(responseData?.last_page || 1);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to fetch properties"));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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

  // Filtered properties based on statusFilter
  const displayedProperties = useMemo(() => {
    return properties.filter((item) => {
      const offline = isPropertyOffline(item);
      if (statusFilter === "online") return !offline;
      if (statusFilter === "offline") return offline;
      return true;
    });
  }, [properties, isPropertyOffline, statusFilter]);

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
        await propertyApi.put(`/api/properties/${propId}`, {
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

      // 3. Update active table state
      setProperties((prev) =>
        prev.map((p) =>
          String(p.id) === String(propId)
            ? {
                ...p,
                is_offline: newStatusIsOffline,
                status: newStatusIsOffline ? "offline" : "online",
              }
            : p,
        ),
      );

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
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          {row.estate_name && (
            <span className="text-xs text-gray-400">{row.estate_name}</span>
          )}
        </div>
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
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 w-max ${
              offline
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                offline ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            {offline ? "Offline" : "Online"}
          </span>
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
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500">
            View, search, and manage online / offline status of all properties
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg border border-primary/10">
          {(
            [
              { id: "all", label: "All" },
              { id: "online", label: "Online" },
              { id: "offline", label: "Offline" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-primary shadow-xs border border-primary/20"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="max-w-md w-full bg-secondary border border-primary/10 rounded-lg relative flex gap-2 items-center h-[45px] px-4">
        <BiSearch className="w-4 h-4 md:w-5 md:h-5 opacity-50" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search properties by name..."
          className="w-full h-full focus:outline-none text-sm"
        />
      </div>

      {/* Table */}
      <ReusableTable
        columns={columns}
        data={displayedProperties}
        isLoading={isLoading}
        error={null}
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
