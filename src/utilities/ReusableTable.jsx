import React from "react";
import PaginationControls from "./PaginationControls";
import { LuLoaderCircle } from "react-icons/lu";

const ReusableTable = ({
  columns,
  data,
  isLoading,
  error,
  currentPage,
  totalPages,
  totalItems,
  perPageSteps,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  emptyDataHeading,
  emptyDataMessage,
  emptyDataButtonText,
  emptyDataAction,
  hasSerialNo = true,
  showPagination = true,
}) => {
  const columnsWithSN = [
    ...(hasSerialNo
      ? [
          {
            label: "S/N",
            key: "sn",
            render: (_, index) => {
              const serial = (currentPage - 1) * itemsPerPage + index + 1;
              return serial.toString().padStart(3, "0");
            },
            className: "p-4 text-xs whitespace-nowrap font-medium",
            headingClassName:
              "p-4 text-[10px] font-semibold text-tableHeading whitespace-nowrap",
          },
        ]
      : []),

    ...columns,
  ];

  return (
    <div className="overflow-x-auto no-scrollbar w-full lg:p-0 pe-4">
      <table className="w-full min-w-[800px] text-center bg-white mb-2">
        <thead>
          <tr className="bg-fadedBlack h-[50px]">
            {columnsWithSN.map((col, idx) => (
              <th
                key={col.key ?? idx}
                className={
                  col?.headingClassName ||
                  "p-4 text-[10px] font-semibold text-tableHeading whitespace-nowrap"
                }
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr className="h-[50px] border-y border-black/15">
              <td colSpan={columnsWithSN.length}>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <LuLoaderCircle className="animate-spin" />
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr className="h-[50px] border-y border-black/15">
              <td colSpan={columnsWithSN.length}>
                {typeof error === "string"
                  ? error
                  : error?.message || "An error occurred"}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr className="h-[50px] border-y border-black/15">
              <td colSpan={columnsWithSN.length}>
                {typeof error === "string"
                  ? error
                  : error?.message || "No data found"}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={item.id || index}
                className={`h-[50px] border-y border-black/15`}
              >
                {columnsWithSN.map((col, idx) => (
                  <td
                    key={col.key ?? idx}
                    className={
                      col.className ||
                      "p-3 text-xs whitespace-nowrap text-tableData relativ"
                    }
                  >
                    {col.render
                      ? col.render(item, index)
                      : col.key
                        ? item[col.key]
                        : "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showPagination && !isLoading && !error && data.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          perPageSteps={perPageSteps}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default ReusableTable;
