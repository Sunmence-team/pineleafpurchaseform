import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { RiSkipLeftLine, RiSkipRightLine } from "react-icons/ri";
import { generatePerPageOptions } from "./generatePerPageOptions";

const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  perPageSteps=10
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const newOptions = generatePerPageOptions(totalItems, perPageSteps);
    setOptions(newOptions);
    
    if (!newOptions.includes(itemsPerPage)) {
      setItemsPerPage(newOptions[0]); 
    }

  }, [totalItems]);
  
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex justify-center items-center gap-6 text-xs">
      <div className="flex items-center gap-2">
        <span>Items per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          {options?.map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <span>{start} - {end} of {totalItems}</span>

      <div className="flex">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
          className="px-2 py-2.5 rounded-md hover:bg-gray-200 disabled:opacity-25"
        >
          <RiSkipLeftLine />
        </button>

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="px-2 py-2.5 rounded-md hover:bg-gray-200 disabled:opacity-25"
        >
          <MdKeyboardArrowLeft />
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          className="px-2 py-2.5 rounded-md hover:bg-gray-200 disabled:opacity-25"
        >
          <MdKeyboardArrowRight />
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-2 py-2.5 rounded-md hover:bg-gray-200 disabled:opacity-25"
        >
          <RiSkipRightLine />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
