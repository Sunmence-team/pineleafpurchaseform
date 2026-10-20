import React from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import { formatISODateToCustom } from "../utilities/formatterUtility";

const ApplicationsList = ({
  filteredData,
  currentPage,
  recordsPerPage,
  isDeleting,
  handleDelete,
}) => {
  return (
    <div className="space-y-2 md:space-y-0">
      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-4">
        {filteredData.length === 0 ? (
          <div className="p-3 text-center text-sm text-gray-600 bg-white rounded-lg shadow-sm border border-gray-200">
            No records found
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:bg-gray-50 transition duration-200 overflow-hidden"
            >
              <div className="flex justify-between gap-2 items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 wrap-break-word line-clamp-2">
                    {(currentPage - 1) * recordsPerPage + index + 1}.{" "}
                    {item.client_name ?? item.club_name}
                  </p>
                  <p className="text-xs text-gray-600 wrap-break-word">
                    {item.email ?? "-"}
                  </p>
                  <p className="text-xs text-gray-600 wrap-break-word">
                    {item.mobile_number ?? item.club_contact}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/view-client/${item.id}`}
                      className="p-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      aria-label={`View ${item.client_name || "Client"}`}
                    >
                      <FaEye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/edit-client/${item.id}`}
                      className="p-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      aria-label={`Edit ${item.client_name || "Client"}`}
                    >
                      <FaEdit className="w-4 h-4" />
                    </Link>
                  </div>
                  <button
                    disabled={isDeleting}
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete ${item.client_name || "Client"}`}
                    title={`Delete ${item.client_name || "Client"}`}
                    className="p-2 bg-red-800 text-white rounded-md hover:bg-red-800/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaTrashAlt className="mx-auto w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block relative overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wider">
                S/N
              </th>
              <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wider">
                Client Name
              </th>
              <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wider">
                Email
              </th>
              <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wider">
                Phone Number
              </th>
              <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wider">
                Branch
              </th>
              <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wider">
                Property name/Location
              </th>
              <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wider">
                Date Filled
              </th>
              <th className="p-2 md:p-5 text-left text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="p-2 md:p-5 text-center text-sm md:text-base text-gray-600"
                >
                  No records found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-primary/10 transition duration-200"
                >
                  <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">
                    {(currentPage - 1) * recordsPerPage + index + 1}
                  </td>
                  <td className="p-2 md:p-5 text-sm md:text-base font-medium text-gray-900 max-w-[400px] min-w-[300px]">
                    <p className="lg:line-clamp-0 line-clamp-2">
                      {item.client_name ?? item.club_name}
                    </p>
                  </td>
                  <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">
                    {item.email ?? "-"}
                  </td>
                  <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">
                    {item.mobile_number ?? item.club_contact}
                  </td>
                  <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">
                    {item.branches}
                  </td>
                  <td className="p-2 md:p-5 text-sm md:text-base text-gray-700 max-w-[300px] min-w-[300px]">
                    <p className="lg:line-clamp-0 line-clamp-2">
                      {item.site_location}
                    </p>
                  </td>
                  <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">
                    {formatISODateToCustom(item.created_at)}
                  </td>
                  <td className="p-2 md:p-5 whitespace-nowrap text-sm md:text-base text-gray-700">
                    <div className="flex space-x-2 md:space-x-3">
                      <Link
                        to={`/view-client/${item.id}`}
                        aria-label={`View ${item.client_name || "Client"}`}
                      >
                        <FaEye className="text-primary cursor-pointer w-4 h-4 md:w-5 md:h-5 hover:text-primary/90" />
                      </Link>
                      <Link
                        to={`/edit-client/${item.id}`}
                        aria-label={`Edit ${item.client_name || "Client"}`}
                      >
                        <FaEdit className="text-primary cursor-pointer w-4 h-4 md:w-5 md:h-5 hover:text-primary/90" />
                      </Link>
                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.client_name || "Client"}`}
                        title={`Delete ${item.client_name || "Client"}`}
                        className="disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaTrashAlt className="text-red-600 cursor-pointer w-4 h-4 hover:text-red-800" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsList;
