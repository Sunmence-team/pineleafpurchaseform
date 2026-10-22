import type React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { api, getErrorMessage } from "../../helpers/api";
import Modal from "./Modal";
import ActionButton from "../ui/ActionButton";

const inputClass =
  "mt-2 h-11 w-full rounded-md border border-primary/10 bg-secondary px-3 text-sm outline-none focus:border-primary transition";
const errorStyle = "text-red-500 text-xs mt-1";

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  phone_number: Yup.string()
    .min(10, "Phone number should be at least 10 digits")
    .max(15, "Phone number must be at most 15 characters")
    .optional()
    .nullable(),
});

interface AddBarristerModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const AddBarristerModal: React.FC<AddBarristerModalProps> = ({
  onClose,
  onCreated,
}) => {
  const formik = useFormik({
    initialValues: {
      name: "",
      phone_number: "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload: { name: string; phone_number?: string } = {
          name: values.name.trim(),
        };
        if (values.phone_number) {
          payload.phone_number = values.phone_number.trim();
        }

        const res = await api.post("/barristers", payload);

        if ([200, 201].includes(res.status)) {
          toast.success("Barrister created successfully");
          onCreated();
          onClose();
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to create barrister"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Add Barrister</h3>
          <p className="text-sm text-gray-500">
            Create a new barrister record.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Name
            <input
              name="name"
              placeholder="e.g. Barr. John Doe"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass}
            />
            {formik.touched.name && formik.errors.name && (
              <p className={errorStyle}>{formik.errors.name}</p>
            )}
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Phone Number (Optional)
            <input
              name="phone_number"
              type="text"
              value={formik.values.phone_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. 08012345678"
              className={inputClass}
            />
            {formik.touched.phone_number && formik.errors.phone_number && (
              <p className={errorStyle}>{formik.errors.phone_number}</p>
            )}
          </label>
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
            text="Create Barrister"
            loadingText="Creating..."
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddBarristerModal;
