import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  BsCheckCircle,
  BsFileEarmarkText,
  BsPerson,
  BsChatSquareText,
} from "react-icons/bs";
import { FiEdit3 } from "react-icons/fi";
import Modal from "./Modal";
import ActionButton from "../ui/ActionButton";
import SearchableInput from "../ui/SearchableInput";
import { useBarristers } from "../../hooks/useBarristers";
import { useSubmitDocumentFeedback } from "../../hooks/useDocumentLibrary";
import { getErrorMessage } from "../../helpers/api";
import type { LibraryDocumentItem, BarristerProp } from "../../lib/interfaces";
import OverviewCards from "../cards/OverviewCards";

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-primary/20 bg-white px-3 text-sm outline-none focus:border-primary transition";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1";
const errorStyle = "text-red-500 text-xs mt-1";

const getBarristerDisplayLabel = (b: BarristerProp) =>
  b.full_name || b.name || "";

const renderBarristerOption = (item: BarristerProp) => (
  <div>
    <p className="font-semibold text-gray-900 capitalize">
      {item.full_name || item.name}
    </p>
    {item.phone_number && (
      <p className="text-xs text-gray-400">{item.phone_number}</p>
    )}
  </div>
);

export interface SubmitFeedbackModalProps {
  document: LibraryDocumentItem;
  initialMode?: "submit" | "view";
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = (totalCount: number) =>
  Yup.object({
    barrister: Yup.string().trim().required("Barrister is required"),
    worked_on_count: Yup.number()
      .required("Worked on count is required")
      .min(0, "Cannot be negative")
      .max(totalCount, `Cannot exceed total count (${totalCount})`),
    not_worked_on_count: Yup.number()
      .required("Not worked on count is required")
      .min(0, "Cannot be negative")
      .max(totalCount, `Cannot exceed total count (${totalCount})`)
      .test(
        "sum-matches-total",
        `Worked on + Not worked on must equal total records (${totalCount})`,
        function (val) {
          const { worked_on_count } = this.parent;
          if (worked_on_count === undefined || val === undefined) return true;
          return Number(worked_on_count) + Number(val) === totalCount;
        },
      ),
    reason: Yup.string()
      .trim()
      .nullable()
      .when("not_worked_on_count", {
        is: (val: any) => Number(val) > 0,
        then: (schema) =>
          schema.required(
            "Please provide a reason or note explaining why some applications were not worked on",
          ),
        otherwise: (schema) => schema.optional(),
      }),
  });

const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  document,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const existingFeedback = document.feedback;
  const isFeedbackFilled = document.is_feedback_filled;
  const totalRecords = document.records_count || 0;

  const { data: barristersResponse, isLoading: isLoadingBarristers } =
    useBarristers({
      per_page: 100,
    });
  const barristers = barristersResponse?.barristers || [];

  const [mode, setMode] = useState<"submit" | "view">(
    initialMode || (isFeedbackFilled ? "view" : "submit"),
  );

  const submitMutation = useSubmitDocumentFeedback();

  const formik = useFormik({
    initialValues: {
      barrister: existingFeedback?.barrister || "",
      worked_on_count: existingFeedback?.worked_on_count ?? totalRecords,
      not_worked_on_count: existingFeedback?.not_worked_on_count ?? 0,
      reason: existingFeedback?.reason || "",
    },
    enableReinitialize: true,
    validationSchema: validationSchema(totalRecords),
    onSubmit: (values, { setSubmitting }) => {
      submitMutation.mutate(
        {
          documentId: document.id,
          payload: {
            barrister: values.barrister.trim(),
            worked_on_count: Number(values.worked_on_count),
            not_worked_on_count: Number(values.not_worked_on_count),
            reason: values.reason?.trim() || null,
          },
        },
        {
          onSuccess: () => {
            toast.success("Document feedback recorded successfully");
            setSubmitting(false);
            onSuccess?.();
            onClose();
          },
          onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to submit feedback"));
            setSubmitting(false);
          },
        },
      );
    },
  });

  const handleWorkedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === "") {
      formik.setFieldValue("worked_on_count", "");
      return;
    }
    const val = Number(rawVal);
    formik.setFieldValue("worked_on_count", val);
    const remaining = Math.max(0, totalRecords - val);
    formik.setFieldValue("not_worked_on_count", remaining);
  };

  const handleNotWorkedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === "") {
      formik.setFieldValue("not_worked_on_count", "");
      return;
    }
    const val = Number(rawVal);
    formik.setFieldValue("not_worked_on_count", val);
    const remaining = Math.max(0, totalRecords - val);
    formik.setFieldValue("worked_on_count", remaining);
  };

  return (
    <Modal onClose={onClose}>
      {mode === "view" ? (
        /* View Feedback Details Mode */
        <div className="space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Document Feedback Details
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Recorded barrister feedback for{" "}
              <span className="font-semibold text-primary">
                {document.title}
              </span>
            </p>
          </div>

          {/* Document & Barrister Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OverviewCards 
              title="Document"
              icon={BsFileEarmarkText}
              value={document.title}
              subtitle={document.file_name}
            />
            <OverviewCards 
              title="Assigned Barrister"
              icon={BsPerson}
              value={existingFeedback?.barrister}
              subtitle={"Feedback recorded by: " + existingFeedback?.submitted_by}
            />
          </div>

          {/* Counts Breakdown Grid */}
          <div className="grid grid-cols-3 gap-3">
            <OverviewCards 
              title="Total Records"
              value={existingFeedback?.total_count ?? totalRecords}
            />
            <OverviewCards 
              title="Worked On"
              value={existingFeedback?.worked_on_count ?? 0}
            />
            <OverviewCards 
              title="Not Worked On"
              value={existingFeedback?.not_worked_on_count ?? 0}
            />
          </div>

          {/* Notes / Reason */}
          {existingFeedback?.reason && (
            <div className="bg-secondary p-3.5 rounded-lg border border-primary/10 text-xs space-y-1">
              <p className="text-gray-700 leading-relaxed italic">
                <span className="text-gray-500 font-medium inline-flex items-center gap-1.5">
                  <BsChatSquareText size={12} />
                  Reason / Note:
                </span>
                {" "}
                "{existingFeedback.reason}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setMode("submit")}
              className="px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <FiEdit3 size={13} />
              <span>Update Feedback</span>
            </button>
          </div>
        </div>
      ) : (
        /* Submit / Edit Feedback Mode */
        <form onSubmit={formik.handleSubmit}>
          {/* Header */}
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {isFeedbackFilled
                ? "Update Document Feedback"
                : "Submit Document Feedback"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Record barrister return metrics for{" "}
              <span className="font-semibold text-primary">
                {document.title}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            {/* Searchable Barrister Input */}
            <div>
              <label className={labelClass}>Select Barrister *</label>
              <SearchableInput<BarristerProp>
                options={barristers}
                value={formik.values.barrister}
                displayKey="name"
                getDisplayLabel={getBarristerDisplayLabel}
                renderOption={renderBarristerOption}
                placeholder={
                  isLoadingBarristers
                    ? "Loading barristers..."
                    : "Select registered barrister by name..."
                }
                clearable={true}
                fetchOnEmpty={true}
                inputContClassName="h-11 bg-white border border-primary/20 rounded-lg"
                className="text-sm"
                onSelect={(selected: BarristerProp) => {
                  formik.setFieldValue(
                    "barrister",
                    selected.full_name || selected.name || "",
                  );
                }}
                onClear={() => {
                  formik.setFieldValue("barrister", "");
                }}
                onInputChange={(val) => {
                  formik.setFieldValue("barrister", val);
                }}
              />
              {formik.touched.barrister && formik.errors.barrister && (
                <p className={errorStyle}>{formik.errors.barrister}</p>
              )}
            </div>

            {/* Worked On & Not Worked On Counts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="total_records" className={labelClass}>
                  Total Records
                </label>
                <input
                  id="total_records"
                  name="total_records"
                  type="number"
                  value={totalRecords}
                  readOnly
                  className={inputClass + " cursor-not-allowed opacity-75"}
                />
              </div>

              <div>
                <label htmlFor="worked_on_count" className={labelClass}>
                  Worked On Count *
                </label>
                <input
                  id="worked_on_count"
                  name="worked_on_count"
                  type="number"
                  min="0"
                  max={totalRecords}
                  value={formik.values.worked_on_count}
                  onChange={handleWorkedOnChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {formik.touched.worked_on_count &&
                  formik.errors.worked_on_count && (
                    <p className={errorStyle}>
                      {formik.errors.worked_on_count}
                    </p>
                  )}
              </div>

              <div>
                <label htmlFor="not_worked_on_count" className={labelClass}>
                  Not Worked On Count *
                </label>
                <input
                  id="not_worked_on_count"
                  name="not_worked_on_count"
                  type="number"
                  min="0"
                  max={totalRecords}
                  value={formik.values.not_worked_on_count}
                  onChange={handleNotWorkedOnChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {formik.touched.not_worked_on_count &&
                  formik.errors.not_worked_on_count && (
                    <p className={errorStyle}>
                      {formik.errors.not_worked_on_count}
                    </p>
                  )}
              </div>
            </div>

            {/* Reason / Remarks */}
            <div>
              <label htmlFor="reason" className={labelClass}>
                Reason / Note{" "}
                {Number(formik.values.not_worked_on_count) > 0
                  ? "*"
                  : "(Optional)"}
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder={
                  Number(formik.values.not_worked_on_count) > 0
                    ? "Provide reason why applications were not worked on (e.g. 20 applications pending governor consent verification)..."
                    : "e.g. Any additional remarks or follow-up notes (optional)..."
                }
                value={formik.values.reason}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1.5 w-full rounded-lg border border-primary/20 bg-white p-3 text-sm outline-none focus:border-primary transition"
              />
              {formik.touched.reason && formik.errors.reason && (
                <p className={errorStyle}>{formik.errors.reason}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            {isFeedbackFilled && (
              <button
                type="button"
                onClick={() => setMode("view")}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer mr-auto"
              >
                Back to Details
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <ActionButton
              text={isFeedbackFilled ? "Update Feedback" : "Submit Feedback"}
              loadingText="Submitting..."
              loading={submitMutation.isPending || formik.isSubmitting}
              disabled={submitMutation.isPending || formik.isSubmitting}
              action={formik.handleSubmit}
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default SubmitFeedbackModal;
