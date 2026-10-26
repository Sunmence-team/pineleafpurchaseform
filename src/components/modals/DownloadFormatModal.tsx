import React from "react";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import Modal from "./Modal";

export type DownloadFormat = "pdf" | "csv";

export interface DownloadFormatModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  onClose: () => void;
  onSelectFormat: (format: DownloadFormat) => void;
}

const DownloadFormatModal: React.FC<DownloadFormatModalProps> = ({
  isOpen,
  title = "Select Download Format",
  subtitle = "Choose the format you would like to export your records in.",
  isLoading = false,
  onClose,
  onSelectFormat,
}) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="p-2 md:p-4 text-center">
        <h4 className="text-xl font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelectFormat("pdf")}
            className="group p-5 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition flex flex-col items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaFilePdf className="size-6" />
            </div>
            <div className="text-center">
              <span className="font-semibold text-gray-900 block text-base group-hover:text-primary transition-colors">
                Download PDF
              </span>
              <span className="text-xs text-gray-500 block mt-0.5">
                Formatted document (.pdf)
              </span>
            </div>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelectFormat("csv")}
            className="group p-5 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition flex flex-col items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaFileCsv className="size-6" />
            </div>
            <div className="text-center">
              <span className="font-semibold text-gray-900 block text-base group-hover:text-primary transition-colors">
                Download CSV
              </span>
              <span className="text-xs text-gray-500 block mt-0.5">
                Spreadsheet tabular data (.csv)
              </span>
            </div>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DownloadFormatModal;
