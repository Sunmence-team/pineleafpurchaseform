import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useLocation } from "react-router-dom";
import ReusableTable from "../../../utilities/ReusableTable";
import ActionCell from "../../../components/ui/ActionCell";
import type { ClientEntry, TableColumnProps } from "../../../lib/interfaces";
import { formatISODateToCustom } from "../../../helpers/formatterUtility";
import { TfiReload } from "react-icons/tfi";
import { FaBars, FaX } from "react-icons/fa6";
import { useOldClientEntries } from "../../../hooks/useClientEntries";
import { toast } from "sonner";
import { getErrorMessage } from "../../../helpers/api";

const OldRecords: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const {
    data: responseData,
    isLoading,
    error,
  } = useOldClientEntries({
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearchQuery,
  });

  const clientEntries: ClientEntry[] = responseData?.data?.data || [];
  const totalItems = responseData?.data?.total || 0;
  const totalPages = responseData?.data?.last_page || 1;

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to fetch client entries."));
    }
  }, [error]);

  // const handleDelete = async (id) => {
  //   if (!id) return;
  //   if (
  //     confirm(
  //       "Are you sure to delete this entry?. This action is irreversible.",
  //     )
  //   ) {
  //     const toastId = toast.loading("Deleting entry...");
  //     setIsDeleting(true);
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         toast.error("Please log in to perform this action.", { id: toastId });
  //         setIsDeleting(false);
  //         return;
  //       }

  //       const response = await api.delete(`${API_URL}/applications/${id}`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (response.status === 200 || response.status === 204) {
  //         toast.success("Client entry deleted successfully!", { id: toastId });
  //         removeClient(id);
  //         if (filteredData.length === 1 && currentPage > 1) {
  //           setCurrentPage(currentPage - 1);
  //         } else if (!filterBranch && !filterDateFrom && !filterDateTo) {
  //           fetchApplications(
  //             currentPage,
  //             recordsPerPage,
  //             debouncedSearchQuery,
  //           );
  //         }
  //       } else {
  //         toast.error(`Failed to delete client. Status: ${response.status}`, {
  //           id: toastId,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error deleting client:", error);
  //       toast.error(
  //         "Failed to delete client: " +
  //           (error.response?.data?.message || error.message || "Unknown error"),
  //         { id: toastId },
  //       );
  //       if (axios.isAxiosError(error) && error.response?.status === 401) {
  //         toast.info("Session expired!. Logging out...");
  //         setTimeout(() => localStorage.removeItem("token"), 500);
  //       }
  //     } finally {
  //       setIsDeleting(false);
  //     }
  //   }
  // };

  const columns: TableColumnProps<ClientEntry>[] = [
    {
      label: "Client Name",
      key: "client_name",
      className: "px-3 py-2 text-xs font-medium text-tableData max-w-[280px]",
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
      className: "px-3 py-2 text-xs text-gray-600 max-w-[200px]",
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
      render: (item) => <span>{item.branches ?? "-"}</span>,
    },
    {
      label: "Property Name",
      key: "site_location",
      className: "px-3 py-2 text-xs text-gray-700 max-w-[250px]",
      render: (item) => (
        <span className="truncate block" title={item.site_location}>
          {item.site_location ?? "-"}
        </span>
      ),
    },
    {
      label: "Date Filled",
      key: "created_at",
      className: "px-3 py-2 text-xs text-gray-700 whitespace-nowrap",
      render: (item) => <span>{formatISODateToCustom(item.created_at)}</span>,
    },
    {
      label: "Actions",
      key: "action",
      tableHeadingClassName: "text-center",
      className: "px-3 py-2 text-center whitespace-nowrap",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          canView
          onView={(id) =>
            navigate(`/dashboard/old-records/view/${id}`, {
              state: { from: location.pathname },
            })
          }
          onEdit={(id) => navigate(`/dashboard/records/edit/${id}`)}
          // onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex lg:items-center gap-4 justify-between lg:flex-row flex-col">
        <div>
          <h2 className="text-lg font-semibold">Old Records</h2>
          <p className="text-sm text-tableHeading">
            Manage and check all system legacy entries here.
          </p>
        </div>
        {/* <ActionButton
          text="Check new records"
          icon={<FaPlus />}
          action={() => navigate("/dashboar/")}
        /> */}
      </div>
      <div className="flex flex-col justify-between md:flex-row gap-2 md:gap-3 w-full">
        <div className="max-w-md w-full bg-secondary border border-primary/10 rounded-lg relative flex gap-2 items-center h-[45px] px-4">
          <FaSearch className="w-4 h-4 md:w-5 md:h-5 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name..."
            className="w-full h-full focus:outline-none text-sm"
          />
        </div>

        {/* <div className="flex flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
          <ActionButton
            text="Reload Data"
            icon={
              <TfiReload
                className={`${(loading || loadingAllClients || loadingApplications) && "animate-spin"} size-4`}
              />
            }
            action={() => {
              fetchAllClients(true);
              fetchApplications(
                currentPage,
                recordsPerPage,
                debouncedSearchQuery,
              );
            }}
            disabled={loading || loadingAllClients || loadingApplications}
            buttonStyle="text-white font-medium"
          />

          <ActionButton
            text="Branch"
            icon={<FaFilter className="mr-1 w-3.5 h-3.5" />}
            action={() => {
              fetchAllClients();
              setBranchFilterModalOpen(true);
            }}
            buttonStyle="text-white font-medium"
          />

          <ActionButton
            text="Filter"
            icon={<FaFilter className="mr-1 w-3.5 h-3.5" />}
            action={() => setDateFilterModalOpen(true)}
            buttonStyle="text-white font-medium"
          />

          <div className="relative">
            <ActionButton
              text="Download"
              icon={<FaCaretDown className="ml-1 w-4 h-4 order-last" />}
              action={() => {
                fetchAllClients();
                setShowMoreDownloadOptions((prev) => !prev);
              }}
              buttonStyle="text-white font-medium w-full md:w-auto"
            />
            {showMoreDownloadOptions && (
              <div className="absolute right-0 mt-2 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-sm font-semibold overflow-hidden">
                <button
                  onClick={() => {
                    fetchAllClients(true);
                    setShowMoreDownloadOptions(false);
                    setDownloadModalOpen(true);
                  }}
                  className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  Continue from last download
                </button>
                <button
                  onClick={() => {
                    fetchAllClients(true);
                    setShowMoreDownloadOptions(false);
                    setDownloadAllModalOpen(true);
                  }}
                  className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  Download from all times
                </button>
                <button
                  onClick={() => {
                    fetchAllClients(true);
                    setShowMoreDownloadOptions(false);
                    setSiteDownloadModalOpen(true);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 transition"
                >
                  Download for a specific site
                </button>
              </div>
            )}
          </div>
        </div> */}
      </div>

      <ReusableTable
        columns={columns}
        data={clientEntries}
        isLoading={isLoading}
        error={error ? getErrorMessage(error) : null}
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
  );
};

export default OldRecords;