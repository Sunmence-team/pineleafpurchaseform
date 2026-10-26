import React, { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import {
  BsDownload,
  BsFileEarmarkText,
  BsArchive,
  BsClockHistory,
} from "react-icons/bs";
import {
  FaFilePdf,
  FaFileZipper,
  FaFileExcel,
  FaFileCsv,
} from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import OverviewCards from "../../../components/cards/OverviewCards";
import PaginationControls from "../../../utilities/PaginationControls";
import ConfirmDialog from "../../../components/modals/ConfirmDialog";
import {
  useDocumentLibrary,
  useDeleteLibraryDocument,
} from "../../../hooks/useDocumentLibrary";
import type { LibraryDocumentItem } from "../../../services/documentLibraryService";
import { getErrorMessage } from "../../../helpers/api";

export interface BatchFeedbackRecord {
  document_id: string | number;
  barrister_name: string;
  total_sent: number;
  signed_count: number;
  unsigned_count: number;
  date_returned: string;
  remarks?: string;
  updated_at: string;
}

export interface DownloadBatchDocument {
  id: string | number;
  title: string;
  filename: string;
  download_type: string;
  site_location?: string;
  branch?: string;
  total_entries: number;
  created_at: string;
  download_url?: string;
  feedback?: BatchFeedbackRecord;
}

export const getStoredDocuments = (): DownloadBatchDocument[] => [];
export const saveStoredBatchFeedback = (
  _docId: string | number,
  _record: BatchFeedbackRecord,
) => {};

const getFileFormatVisuals = (fileType: string) => {
  const type = fileType ? fileType.toLowerCase() : "";
  switch (type) {
    case "pdf":
      return {
        icon: <FaFilePdf className="size-5" />,
        containerClass: "bg-red-50 text-red-600 border border-red-100",
        badgeClass: "bg-red-50 text-red-700 border border-red-200",
      };
    case "zip":
      return {
        icon: <FaFileZipper className="size-5" />,
        containerClass: "bg-amber-50 text-amber-600 border border-amber-100",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
      };
    case "excel":
    case "xlsx":
    case "xls":
      return {
        icon: <FaFileExcel className="size-5" />,
        containerClass:
          "bg-emerald-50 text-emerald-600 border border-emerald-100",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      };
    case "csv":
      return {
        icon: <FaFileCsv className="size-5" />,
        containerClass: "bg-blue-50 text-blue-600 border border-blue-100",
        badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
      };
    default:
      return {
        icon: <BsFileEarmarkText className="size-5" />,
        containerClass: "bg-gray-50 text-gray-600 border border-gray-100",
        badgeClass: "bg-gray-50 text-gray-700 border border-gray-200",
      };
  }
};

const DocumentLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [downloadTypeFilter, setDownloadTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [documentToDelete, setDocumentToDelete] =
    useState<LibraryDocumentItem | null>(null);

  const deleteMutation = useDeleteLibraryDocument();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: libraryResponse,
    isLoading,
    error,
  } = useDocumentLibrary({
    search: debouncedSearch,
    file_type: fileTypeFilter !== "all" ? fileTypeFilter : undefined,
    type: downloadTypeFilter !== "all" ? downloadTypeFilter : undefined,
    page: currentPage,
    per_page: itemsPerPage,
  });

  const handleConfirmDelete = () => {
    if (!documentToDelete) return;

    deleteMutation.mutate(documentToDelete.id, {
      onSuccess: () => {
        toast.success("Document deleted from library successfully");
        setDocumentToDelete(null);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err, "Failed to delete document"));
      },
    });
  };

  const summary = libraryResponse?.summary;
  const pagination = libraryResponse?.pagination;
  const documents: LibraryDocumentItem[] = libraryResponse?.documents || [];

  const totalDocuments = summary?.total_documents ?? pagination?.total ?? 0;
  const totalRecordsRepresented = summary?.total_records_represented ?? 0;
  const pdfCount = summary?.format_breakdown?.pdf ?? 0;
  const zipCount = summary?.format_breakdown?.zip ?? 0;
  const excelCount = summary?.format_breakdown?.excel ?? 0;
  const csvCount = summary?.format_breakdown?.csv ?? 0;
  const otherFormatsCount = zipCount + excelCount + csvCount;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Downloaded Documents Library
        </h1>
        <p className="text-sm text-gray-500">
          Browse, filter, and retrieve all generated PDF, ZIP, and tabular export files.
        </p>
      </div>

      {/* Summary Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCards
          title="Total Documents"
          value={isLoading ? "..." : totalDocuments}
          icon={BsFileEarmarkText}
        />
        <OverviewCards
          title="Records Represented"
          value={isLoading ? "..." : totalRecordsRepresented}
          icon={BsDownload}
        />
        <OverviewCards
          title="PDF Documents"
          value={isLoading ? "..." : pdfCount}
          icon={FaFilePdf}
        />
        <OverviewCards
          title="Archives & Sheets"
          value={isLoading ? "..." : otherFormatsCount}
          icon={BsArchive}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="max-w-md w-full bg-secondary border border-primary/10 rounded-lg relative flex gap-2 items-center h-[45px] px-4">
          <BiSearch className="w-4 h-4 md:w-5 md:h-5 opacity-50 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by filename, user, or memory key..."
            className="w-full h-full focus:outline-none text-sm bg-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          {/* Format Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">
              Format:
            </label>
            <select
              value={fileTypeFilter}
              onChange={(e) => {
                setFileTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-secondary border border-primary/10 rounded-lg h-[45px] px-3 text-xs outline-0 cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="zip">ZIP Archive (.zip)</option>
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">
              Export Type:
            </label>
            <select
              value={downloadTypeFilter}
              onChange={(e) => {
                setDownloadTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-secondary border border-primary/10 rounded-lg h-[45px] px-3 text-xs outline-0 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="single">Single Application</option>
              <option value="all">All Records</option>
              <option value="by_branch">By Branch</option>
              <option value="by_property">By Property</option>
              <option value="by_barrister">By Barrister</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {getErrorMessage(error, "Failed to load document library.")}
        </div>
      )}

      {/* Grid of Documents */}
      {isLoading && documents.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 bg-secondary/50 rounded-xl border border-primary/10 animate-pulse"
            />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-gray-200 bg-secondary">
          <FaFilePdf className="mx-auto text-gray-300 size-12 mb-3" />
          <h4 className="text-base font-semibold text-gray-700">
            No library documents found
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            {debouncedSearch || fileTypeFilter !== "all" || downloadTypeFilter !== "all"
              ? "Try adjusting your search criteria or filters."
              : "Exported application and batch files will be listed here automatically."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => {
            const visuals = getFileFormatVisuals(doc.file_type);
            return (
              <div
                key={doc.id}
                className="flex flex-col bg-white rounded-xl border border-primary/10 transition duration-200 p-5 justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${visuals.containerClass}`}
                    >
                      {visuals.icon}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-semibold text-gray-900 text-sm leading-snug truncate"
                        title={doc.title}
                      >
                        {doc.title}
                      </h3>
                      <p
                        className="text-[11px] text-gray-400 font-mono truncate"
                        title={doc.file_name}
                      >
                        {doc.file_name}
                      </p>
                    </div>
                  </div>

                  {/* Details Box */}
                  <div className="bg-secondary p-3 rounded-lg border border-primary/10 text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        Export Type:
                      </span>
                      <span className="font-semibold text-gray-800 capitalize truncate max-w-[150px]">
                        {doc.download_type
                          ? doc.download_type.replace(/_/g, " ")
                          : doc.filter_type || "Export"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        Records Included:
                      </span>
                      <span className="font-semibold text-primary">
                        {doc.records_count}{" "}
                        {doc.records_count === 1 ? "record" : "records"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        Downloaded By:
                      </span>
                      <span className="font-medium text-gray-700">
                        {doc.downloaded_by || "Admin"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        Date Generated:
                      </span>
                      <span
                        className="text-gray-700 truncate max-w-[140px]"
                        title={doc.downloaded_at?.datetime}
                      >
                        {doc.downloaded_at?.human ||
                          doc.downloaded_at?.date ||
                          "Recently"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={doc.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.file_name}
                    className="flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 shadow-2xs"
                  >
                    <BsDownload size={13} />
                    <span>Download {doc.file_type.toUpperCase()}</span>
                  </a>

                  <button
                    type="button"
                    title="Delete document"
                    onClick={() => setDocumentToDelete(doc)}
                    className="p-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={pagination.last_page}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(documentToDelete)}
        isLoading={deleteMutation.isPending}
        title="Delete Document"
        message={
          documentToDelete ? (
            <span>
              Are you sure you want to permanently delete{" "}
              <strong className="text-gray-900">
                "{documentToDelete.title || documentToDelete.file_name}"
              </strong>
              ? This file will be removed from your download library.
            </span>
          ) : (
            "This action cannot be undone."
          )
        }
        confirmText="Yes, Delete"
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setDocumentToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default DocumentLibrary;
