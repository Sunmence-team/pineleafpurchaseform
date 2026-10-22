import React from "react";
import Modal from "./Modal";

const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Yes, Confirm",
  cancelText = "Cancel",
  onCancel,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onCancel}>
      <div className="p-4 text-center">
        <h4 className="text-xl font-semibold mb-4">{title}</h4>
        <div className="mb-6">
          {typeof message === "string" ? (
            <p className="text-primary">{message}</p>
          ) : (
            message
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            onClick={onCancel}
            className="w-full md:w-1/2 h-[50px] rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full md:w-1/2 h-[50px] bg-primary text-white rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
