import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa6";
import { FaBars } from "react-icons/fa";
import axios from "axios";
import { toast } from "sonner";
import assets from "../assets/assests";
import SideNav from "../components/SideNav";
import { branchOptions } from "../lib/branchList";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ChangePassword = () => {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

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
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("Changing password...");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first.", { id: toastId });
          navigate("/login");
          return;
        }

        const response = await axios.post(
          `${API_URL}/api/change-password`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 200) {
          toast.success("Password changed successfully!", { id: toastId });
          formik.resetForm();
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      } catch (err) {
        console.error("Error changing password:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            toast.error("Current password is incorrect.", { id: toastId });
          } else if (err.response?.status === 422) {
            const errors = err.response.data.errors || {};
            const msg = Object.values(errors).flat().join("; ");
            toast.error(msg || "Validation error.", { id: toastId });
          } else {
            toast.error(
              err.response?.data?.message || "Failed to change password.",
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
    "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[50px] px-2 flex items-center bg-white";
  const inputInnerClass = "w-full focus:outline-0 text-sm h-full indent-2";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SideNav
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        branches={branchOptions}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center bg-white shadow-sm z-10 w-full px-4 md:px-6 lg:px-8 py-4">
          <button
            onClick={() => setOpenMenu(true)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <img src={assets.logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-gray-900 ps-6">
            Change Password
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8 w-full max-w-lg">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="current_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <div className={inputClass}>
                  <FaLock className="text-secClr" />
                  <input
                    id="current_password"
                    name="current_password"
                    type={showCurrent ? "text" : "password"}
                    value={formik.values.current_password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={inputInnerClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 text-gray-500 hover:text-secClr transition"
                  >
                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
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
                <label
                  htmlFor="new_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className={inputClass}>
                  <FaLock className="text-secClr" />
                  <input
                    id="new_password"
                    name="new_password"
                    type={showNew ? "text" : "password"}
                    value={formik.values.new_password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={inputInnerClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 text-gray-500 hover:text-secClr transition"
                  >
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formik.touched.new_password && formik.errors.new_password && (
                  <div className="text-xs text-red-500 mt-1">
                    {formik.errors.new_password}
                  </div>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="new_password_confirmation"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className={inputClass}>
                  <FaLock className="text-secClr" />
                  <input
                    id="new_password_confirmation"
                    name="new_password_confirmation"
                    type={showConfirm ? "text" : "password"}
                    value={formik.values.new_password_confirmation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={inputInnerClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-gray-500 hover:text-secClr transition"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formik.touched.new_password_confirmation &&
                  formik.errors.new_password_confirmation && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.new_password_confirmation}
                    </div>
                  )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex-1 py-3 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/80 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formik.isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChangePassword;
