import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import Modal from "./Modal";
import ActionButton from "../ui/ActionButton";
import type {
  DownloadBatchDocument,
  BatchFeedbackRecord,
} from "../../pages/dashboard/documents/DocumentLibrary";
import { saveStoredBatchFeedback } from "../../pages/dashboard/documents/DocumentLibrary";
import { api, getErrorMessage } from "../../helpers/api";

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-primary/20 bg-white px-3 text-sm outline-none focus:border-primary transition";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1";
const errorStyle = "text-red-500 text-xs mt-1";

interface SubmitFeedbackModalProps {
  document: DownloadBatchDocument;
  onClose: () => void;
  onSuccess: (feedback: BatchFeedbackRecord) => void;
}

const validationSchema = Yup.object({
  barrister_name: Yup.string().trim().required("Barrister name is required"),
  total_sent: Yup.number()
    .required("Total entries sent is required")
    .min(0, "Cannot be negative"),
  signed_count: Yup.number()
    .required("Signed count is required")
    .min(0, "Cannot be negative"),
  unsigned_count: Yup.number()
    .required("Unsigned count is required")
    .min(0, "Cannot be negative"),
  date_returned: Yup.string().required("Return date is required"),
  remarks: Yup.string().optional(),
});

const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  document,
  onClose,
  onSuccess,
}) => {
  const existingFeedback = document.feedback;

  const formik = useFormik({
    initialValues: {
      barrister_name: existingFeedback?.barrister_name || "",
      total_sent: existingFeedback?.total_sent ?? (document.total_entries || 0),
      signed_count: existingFeedback?.signed_count ?? 0,
      unsigned_count: existingFeedback?.unsigned_count ?? 0,
      date_returned:
        existingFeedback?.date_returned ||
        new Date().toISOString().split("T")[0],
      remarks: existingFeedback?.remarks || "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload: BatchFeedbackRecord = {
        document_id: document.id,
        barrister_name: values.barrister_name.trim(),
        total_sent: Number(values.total_sent),
        signed_count: Number(values.signed_count),
        unsigned_count: Number(values.unsigned_count),
        date_returned: values.date_returned,
        remarks: values.remarks?.trim() || undefined,
        updated_at: new Date().toISOString(),
      };

      try {
        // 1. Dispatch to backend if available
        try {
          await api.post(`/documents/${document.id}/feedback`, payload);
        } catch (err) {
          console.warn("Backend feedback endpoint fallback:", err);
        }

        // 2. Persist locally
        saveStoredBatchFeedback(document.id, payload);

        toast.success("Feedback recorded successfully");
        onSuccess(payload);
        onClose();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to submit feedback"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Submit Document Feedback
          </h3>
          <p className="text-sm text-gray-500">
            Record barrister return metrics for{" "}
            <span className="font-semibold text-primary">{document.title}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="barrister_name" className={labelClass}>
              Which Barrister Brought It Back? *
            </label>
            <input
              id="barrister_name"
              name="barrister_name"
              type="text"
              placeholder="e.g. Barr. Emeka Okafor"
              value={formik.values.barrister_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass}
            />
            {formik.touched.barrister_name && formik.errors.barrister_name && (
              <p className={errorStyle}>{formik.errors.barrister_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="total_sent" className={labelClass}>
                Entries Sent
              </label>
              <input
                id="total_sent"
                name="total_sent"
                type="number"
                min="0"
                value={formik.values.total_sent}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
              {formik.touched.total_sent && formik.errors.total_sent && (
                <p className={errorStyle}>{formik.errors.total_sent}</p>
              )}
            </div>

            <div>
              <label htmlFor="signed_count" className={labelClass}>
                Signed / Approved
              </label>
              <input
                id="signed_count"
                name="signed_count"
                type="number"
                min="0"
                value={formik.values.signed_count}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
              {formik.touched.signed_count && formik.errors.signed_count && (
                <p className={errorStyle}>{formik.errors.signed_count}</p>
              )}
            </div>

            <div>
              <label htmlFor="unsigned_count" className={labelClass}>
                Not Signed / Rejected
              </label>
              <input
                id="unsigned_count"
                name="unsigned_count"
                type="number"
                min="0"
                value={formik.values.unsigned_count}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
              {formik.touched.unsigned_count &&
                formik.errors.unsigned_count && (
                  <p className={errorStyle}>{formik.errors.unsigned_count}</p>
                )}
            </div>
          </div>

          <div>
            <label htmlFor="date_returned" className={labelClass}>
              Date Returned *
            </label>
            <input
              id="date_returned"
              name="date_returned"
              type="date"
              value={formik.values.date_returned}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass}
            />
            {formik.touched.date_returned && formik.errors.date_returned && (
              <p className={errorStyle}>{formik.errors.date_returned}</p>
            )}
          </div>

          <div>
            <label htmlFor="remarks" className={labelClass}>
              Remarks / Feedback Notes (Optional)
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows={3}
              placeholder="e.g. 2 entries missing client photo, requested resubmission..."
              value={formik.values.remarks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="mt-1.5 w-full rounded-lg border border-primary/20 bg-white p-3 text-sm outline-none focus:border-primary transition"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <ActionButton
            text="Save Feedback"
            loadingText="Saving..."
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
};

export default SubmitFeedbackModal;
