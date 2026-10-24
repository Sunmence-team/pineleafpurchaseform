import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa6";
import axios from "axios";
import { toast } from "sonner";
import { api, getErrorMessage } from "../../../helpers/api";
import ActionButton from "../../../components/ui/ActionButton";

const ChangePassword: React.FC = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required("Current password is required"),
      new_password: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters"),
      new_password_confirmation: Yup.string()
        .required("Please confirm your new password")
        .oneOf([Yup.ref("new_password")], "Passwords do not match"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const toastId = toast.loading("Changing password...");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first.", { id: toastId });
          return;
        }

        const response = await api.post("/change-password", values, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          toast.success("Password changed successfully!", { id: toastId });
          resetForm();
        }
      } catch (err: unknown) {
        console.error("Error changing password:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            toast.error("Current password is incorrect.", { id: toastId });
          } else if (err.response?.status === 422) {
            const errors = err.response.data?.errors || {};
            const msg = Object.values(errors).flat().join("; ");
            toast.error(msg || "Validation error.", { id: toastId });
          } else {
            toast.error(
              err.response?.data?.message ||
                getErrorMessage(err, "Failed to change password."),
              { id: toastId },
            );
          }
        } else {
          toast.error("An unexpected error occurred.", { id: toastId });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputClass =
    "mt-1.5 flex items-center h-12 w-full rounded-lg border border-primary/10 bg-secondary px-3.5 transition duration-200";
  const inputInnerClass =
    "w-full bg-transparent focus:outline-none text-sm indent-2 text-gray-900";
  const labelClass =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-500">
          Ensure your account is using a secure password to stay protected
        </p>
      </div>

      <div className="md:w-3/4 w-full">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="current_password" className={labelClass}>
              Current Password
            </label>
            <div className={inputClass}>
              <FaLock className="text-primary text-sm" />
              <input
                id="current_password"
                name="current_password"
                type={showCurrent ? "text" : "password"}
                value={formik.values.current_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter current password"
                className={inputInnerClass}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-gray-400 hover:text-primary transition cursor-pointer"
              >
                {showCurrent ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {formik.touched.current_password &&
              formik.errors.current_password && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.current_password}
                </div>
              )}
          </div>

          <div className="relative">
            <label htmlFor="new_password" className={labelClass}>
              New Password
            </label>
            <div className={inputClass}>
              <FaLock className="text-primary text-sm" />
              <input
                id="new_password"
                name="new_password"
                type={showNew ? "text" : "password"}
                value={formik.values.new_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter new password (min. 8 characters)"
                className={inputInnerClass}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-gray-400 hover:text-primary transition cursor-pointer"
              >
                {showNew ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {formik.touched.new_password && formik.errors.new_password && (
              <div className="text-xs text-red-500 mt-1">
                {formik.errors.new_password}
              </div>
            )}
          </div>

          <div className="relative">
            <label htmlFor="new_password_confirmation" className={labelClass}>
              Confirm New Password
            </label>
            <div className={inputClass}>
              <FaLock className="text-primary text-sm" />
              <input
                id="new_password_confirmation"
                name="new_password_confirmation"
                type={showConfirm ? "text" : "password"}
                value={formik.values.new_password_confirmation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Re-enter new password"
                className={inputInnerClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-gray-400 hover:text-primary transition cursor-pointer"
              >
                {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {formik.touched.new_password_confirmation &&
              formik.errors.new_password_confirmation && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.new_password_confirmation}
                </div>
              )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
            <button
              type="button"
              onClick={() => formik.resetForm()}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Reset
            </button>
            <ActionButton
              text="Update Password"
              loadingText="Updating..."
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
