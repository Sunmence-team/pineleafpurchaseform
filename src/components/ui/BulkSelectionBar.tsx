import React from "react";
import type { BulkSelectionBarProps } from "../../lib/interfaces";
import ActionButton from "./ActionButton";

const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
  count,
  itemLabel = "item",
  proceedText = "Delete selected",
  cancelText = "Cancel",
  isLoading = false,
  onProceed,
  onCancel,
}) => {
  if (count <= 0) return null;

  const label = count === 1 ? itemLabel : `${itemLabel}(s)`;

  return (
    <div className="fixed bottom-4 md:right-6 md:bottom-6 rounded-xl border border-primary/20 bg-white shadow-xl px-4 py-3 z-50">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700 font-medium">
          {count} {label} selected
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cancelText}
          </button>
          <ActionButton
            text={proceedText}
            loadingText="Please wait..."
            loading={isLoading}
            disabled={isLoading}
            action={onProceed}
          />
        </div>
      </div>
    </div>
  );
};

export default BulkSelectionBar;
