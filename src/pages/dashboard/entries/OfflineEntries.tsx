import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BiSearch } from "react-icons/bi";
import { BsCloudSlash, BsBuildings, BsCalendarCheck } from "react-icons/bs";
import { toast } from "sonner";
import OverviewCards from "../../../components/cards/OverviewCards";
import ConfirmDialog from "../../../components/modals/ConfirmDialog";
import ActionCell from "../../../components/ui/ActionCell";
import { useClients } from "../../../context/ClientsContext";
import { getOfflinePropertyIds } from "../properties/Properties";
import { propertyApi, api, getErrorMessage } from "../../../helpers/api";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../../../helpers/formatterUtility";
import type { TableColumnProps, PropertyProp } from "../../../lib/interfaces";
import ReusableTable from "../../../utilities/ReusableTable";

const OfflineEntries: React.FC = () => {
  const { allClients, loadingAllClients, fetchAllClients, removeClient } =
    useClients();

  const [properties, setProperties] = useState<PropertyProp[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all clients if not already loaded
  useEffect(() => {
    if (allClients.length === 0 && !loadingAllClients) {
      fetchAllClients(true);
    }
  }, [allClients.length, loadingAllClients, fetchAllClients]);

  // Fetch properties from property service
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await propertyApi.get("/properties/search", {
          params: { per_page: 200 },
        });
        const list = res.data?.data?.data || res.data?.data || [];
        setProperties(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load properties for offline mapping:", err);
      }
    };
    fetchProps();
  }, []);

  // Set of names for properties marked offline
  const offlinePropertyNames = useMemo(() => {
    const offlineIds = new Set(getOfflinePropertyIds().map(String));
    const names = new Set<string>();

    for (const p of properties) {
      const isOffline =
        offlineIds.has(String(p.id)) ||
        p.is_offline === true ||
        p.is_offline === 1 ||
        p.status === "offline";

      if (isOffline && p.name) {
        names.add(p.name.trim().toLowerCase());
        if (p.estate_name) {
          names.add(p.estate_name.trim().toLowerCase());
        }
      }
    }
    return names;
  }, [properties]);

  // Filter entries that match offline properties or have offline purchase flag
  const offlineEntries = useMemo(() => {
    return allClients.filter((client: any) => {
      // Check if entry itself is marked offline
      if (
        client.is_offline === true ||
        client.is_offline === 1 ||
        client.purchase_mode === "offline" ||
        client.status === "offline"
      ) {
        return true;
      }

      // Check if the property/site location is on the offline list
      const site = (client.site_location || "").trim().toLowerCase();
      if (site && offlinePropertyNames.has(site)) {
        return true;
      }

      return false;
    });
  }, [allClients, offlinePropertyNames]);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return offlineEntries;
    const lower = searchTerm.toLowerCase();
    return offlineEntries.filter((item: any) => {
      const name = (item.client_name || "").toLowerCase();
      const site = (item.site_location || "").toLowerCase();
      const branch = (item.branches || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      return (
        name.includes(lower) ||
        site.includes(lower) ||
        branch.includes(lower) ||
        email.includes(lower)
      );
    });
  }, [offlineEntries, searchTerm]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const handleDelete = async () => {
    if (!targetId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/applications/${targetId}`);
      removeClient(targetId);
      toast.success("Entry deleted successfully");
      setDeleteModalOpen(false);
      setTargetId(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete entry"));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumnProps<any>[] = [
    {
      label: "Client Name",
      key: "client_name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.client_name}</span>
          <span className="text-xs text-gray-400">{row.email || "-"}</span>
        </div>
      ),
    },
    {
      label: "Property Purchased",
      key: "site_location",
      render: (row) => (
        <span className="font-medium text-gray-800">
          {row.site_location || "Not Specified"}
        </span>
      ),
    },
    {
      label: "Branch",
      key: "branches",
      render: (row) => <span>{row.branches || "-"}</span>,
    },
    {
      label: "Plots",
      key: "number_of_plot",
      render: (row) => <span>{row.number_of_plot || "1"}</span>,
    },
    {
      label: "Land Price",
      key: "land_price",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.land_price ? formatterUtility(Number(row.land_price)) : "-"}
        </span>
      ),
    },
    {
      label: "Submission Date",
      key: "created_at",
      render: (row) => <span>{formatISODateToCustom(row.created_at)}</span>,
    },
    {
      label: "Property Mode",
      key: "mode",
      render: () => (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-max">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Offline Property
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={Number(item.id)}
          canView={true}
          onView={() => window.open(`/view-client/${item.id}`, "_self")}
          onEdit={() => window.open(`/edit-client/${item.id}`, "_self")}
          onDelete={() => {
            setTargetId(item.id);
            setDeleteModalOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Offline Property Entries
        </h1>
        <p className="text-sm text-gray-500">
          Purchase entries containing properties that were bought while marked
          offline
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <OverviewCards
          title="Offline Property Entries"
          value={offlineEntries.length}
          icon={BsCloudSlash}
          subtitle="Entries on properties marked offline"
        />
        <OverviewCards
          title="Offline Properties Total"
          value={offlinePropertyNames.size}
          icon={BsBuildings}
          subtitle="Distinct offline estates/properties"
        />
        <OverviewCards
          title="Total Form Entries"
          value={allClients.length}
          icon={BsCalendarCheck}
          subtitle="All submitted purchase forms"
        />
      </div>

      {/* Search */}
      <div className="max-w-md w-full bg-secondary border border-primary/10 rounded-lg relative flex gap-2 items-center h-[45px] px-4">
        <BiSearch className="w-4 h-4 md:w-5 md:h-5 opacity-50" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search offline entries..."
          className="w-full h-full focus:outline-none text-sm"
        />
      </div>

      {/* Table */}
      <ReusableTable
        columns={columns}
        data={paginatedData}
        isLoading={loadingAllClients}
        error={null}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        hasSerialNo={true}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        isLoading={isDeleting}
        title="Delete Offline Entry?"
        message="Are you sure you want to delete this purchase entry? This action cannot be undone."
        confirmText="Yes, Delete"
        onCancel={() => {
          setDeleteModalOpen(false);
          setTargetId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default OfflineEntries;
