import React from 'react';

const PaginationControls = ({
  currentPage,
  totalPages,
  setCurrentPage,
  getPageNumbers,
  totalRecords,
  filteredData,
}) => {
  return (
    <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
      <div className="text-sm md:text-base text-gray-600">
        Showing {filteredData.length} of {totalRecords} records
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          aria-label="Previous page"
        >
          Prev
        </button>
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold transition duration-300 shadow-sm ${
              currentPage === page
                ? 'bg-secClr text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
