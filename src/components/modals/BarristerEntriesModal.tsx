import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaSearch } from "react-icons/fa";
import { HiXMark } from "react-icons/hi2";
import Modal from "./Modal";
import ReusableTable from "../../utilities/ReusableTable";
import { useClientEntries } from "../../hooks/useClientEntries";
import { formatISODateToCustom } from "../../helpers/formatterUtility";
import { getErrorMessage } from "../../helpers/api";
import type {
  BarristerProp,
  ClientEntry,
  TableColumnProps,
} from "../../lib/interfaces";
import ActionCell from "../ui/ActionCell";

interface BarristerEntriesModalProps {
  barrister: BarristerProp;
  onClose: () => void;
}

const BarristerEntriesModal: React.FC<BarristerEntriesModalProps> = ({
  barrister,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: responseData,
    isLoading,
    error,
  } = useClientEntries({
    barrister_id: barrister.id,
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearch,
  });

  const clientEntries: ClientEntry[] = responseData?.data?.data || [];
  const totalItems = responseData?.data?.total || 0;
  const totalPages = responseData?.data?.last_page || 1;

  const columns: TableColumnProps<ClientEntry>[] = [
    {
      label: "Client Name",
      key: "client_name",
      className: "px-3 py-2 text-xs font-medium text-tableData max-w-[200px]",
      render: (item) => (
        <span
          className="font-medium text-gray-900 block truncate capitalize"
          title={item.client_name ?? item.club_name}
        >
          {item.client_name ?? item.club_name ?? "-"}
        </span>
      ),
    },
    {
      label: "Email",
      key: "email",
      className: "px-3 py-2 text-xs text-gray-600 max-w-[180px]",
      render: (item) => (
        <span className="truncate block" title={item.email}>
          {item.email ?? "-"}
        </span>
      ),
    },
    {
      label: "Phone Number",
      key: "mobile_number",
      className: "px-3 py-2 text-xs text-gray-700 whitespace-nowrap",
      render: (item) => (
        <span>{item.mobile_number ?? item.club_contact ?? "-"}</span>
      ),
    },
    {
      label: "Branch",
      key: "branches",
      className: "px-3 py-2 text-xs text-gray-700 whitespace-nowrap",
      render: (item) => (
        <span>{item.branch?.name ?? item.branches ?? "-"}</span>
      ),
    },
    {
      label: "Property Name",
      key: "properties.name",
      className: "px-3 py-2 text-xs text-gray-700 max-w-[200px]",
      render: (item) => (
        <span className="truncate block" title={item.properties?.name}>
          {item.properties?.name ?? "-"}
        </span>
      ),
    },
    {
      label: "Date Filled",
      key: "created_at",
      className: "px-3 py-2 text-xs text-gray-700 whitespace-nowrap",
      render: (item) => (
        <span>
          {item.created_at ? formatISODateToCustom(item.created_at) : "-"}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      className: "px-3 py-2 text-center whitespace-nowrap",
      render: (item) => (
        <ActionCell
          rowId={Number(item.id)}
          canView
          onView={() => {
            onClose();
            navigate(`/dashboard/records/view/${item.id}`, {
              state: { from: location.pathname },
            });
          }}
        />
      ),
    },
  ];

  return (
    <Modal onClose={onClose} customMode={true}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 lg:w-4/5 md:w-11/12 w-full max-h-[90vh] flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Entries for {barrister.full_name || barrister.name || "Barrister"}
            </h3>
            <p className="text-xs text-gray-500">
              All client applications linked to this barrister
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md w-full bg-secondary border border-primary/10 rounded-lg relative flex gap-2 items-center h-10 px-3">
          <FaSearch className="w-3.5 h-3.5 opacity-50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search entries by client name..."
            className="w-full h-full focus:outline-none text-xs"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ReusableTable
            columns={columns}
            data={clientEntries}
            isLoading={isLoading}
            error={
              error
                ? getErrorMessage(error, "Failed to fetch barrister entries")
                : null
            }
            hasSerialNo={true}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            getRowId={(item) => item.id}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BarristerEntriesModal;
