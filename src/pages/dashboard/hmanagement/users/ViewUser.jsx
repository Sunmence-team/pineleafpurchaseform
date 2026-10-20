import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import assets from "../../../../assets/assets";
import { api, getErrorMessage } from "../../../../helpers/api";
import { FaDownload } from "react-icons/fa6";
import Modal from "../../../../components/modals/Modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../../../../utilities/formatterUtility";
import FormattedNumberInput from "../../../../components/FormattedNumberInput";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

const ViewUser = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state || null);
  const [isLoading, setIsLoading] = useState(!location.state);
  const [isVerifying, setIsVerifying] = useState(false);
  const [openVerificationModal, setOpenVerificationModal] = useState(false);

  useEffect(() => {
    if (!user) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const response = await hmApi.get(`/api/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data.data || response.data);
        } catch (err) {
          const msg = getErrorMessage(err);
          toast.error(msg);
          console.error("Error fetching user:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, user]);

  const formik = useFormik({
    initialValues: {
      status: "",
      admin_approved_salary: "",
    },
    validationSchema: Yup.object({
      status: Yup.string().required("Status is required"),
      admin_approved_salary: Yup.number()
        .nullable()
        .when("status", {
          is: "verified",
          then: (schema) => schema.required("Concluded revenue is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsVerifying(true);
      try {
        const response = await hmApi.post(
          `/api/admin/users/${user?.id}/verify`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 200) {
          setUser(response.data.data || response.data);
          toast.success(response.data.message || "User verified successfully");
          setOpenVerificationModal(false);
          resetForm();
        }
      } catch (err) {
        const msg = getErrorMessage(err, "Failed to verify user");
        toast.error(msg);
        console.error("Error verifying user:", err);
      } finally {
        setIsVerifying(false);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-secondary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          User not found
        </p>
        <button
          onClick={() =>
            navigate("/dashboard/manage/users", {
              state: location.state?.listState
                ? { listState: location.state.listState }
                : undefined,
            })
          }
          className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const DetailItem = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm sm:text-base text-gray-900 font-medium">
        {value || "N/A"}
      </span>
    </div>
  );

  const hasPendingIndication =
    user?.interest_transactions_count > 0 && !user?.is_interested;
  const awaitingVerification =
    user?.interest_transactions_count > 0 && user?.is_interested;
  const isVerified = user?.is_verified;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-4xl border border-gray-100">
        {/* Header */}
        <div className="flex md:flex-row flex-col items-center justify-between pb-6 mb-8  border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate("/dashboard/manage/users", {
                  state: location.state?.listState
                    ? { listState: location.state.listState }
                    : undefined,
                })
              }
              className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <img src={assets.logo} className="w-10 h-10" alt="Logo" />
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          </div>
          <div className="flex items-center gap-4">
            <p>
              <b>Status: </b>
              {isVerified && user?.admin_approved_salary
                ? "Verified"
                : hasPendingIndication
                  ? "Has Pending Indication"
                  : awaitingVerification
                    ? "Awaiting Verification"
                    : "No indication"}
            </p>
            {user?.statement_of_account && (
              <a
                href={`${HM_STORAGE_API_URL}${user?.statement_of_account}`}
                target="_blank"
                className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary transition-colors duration-200 w-full sm:w-auto text-sm"
              >
                <FaDownload className="mr-2 text-sm" />
                Download Statement
              </a>
            )}
          </div>
        </div>

        <div className="space-y-10">
          {/* Profile Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-secondary pl-3 mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="First Name" value={user.firstname} />
              <DetailItem label="Last Name" value={user.lastname} />
              <DetailItem label="Email" value={user.email} />
              <DetailItem label="Phone" value={user.phone} />
              <DetailItem label="Gender" value={user.gender} />
              <DetailItem
                label="Date of Birth"
                value={
                  formatISODateToCustom(user.date_of_birth)?.split(" ")?.[0]
                }
              />
            </div>
          </section>

          {/* Address Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-secondary pl-3 mb-6">
              Address Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="Address" value={user.address} />
              <DetailItem label="Address 2" value={user.address2} />
              <DetailItem label="Country" value={user.country} />
              <DetailItem label="State" value={user.state} />
              <DetailItem label="City" value={user.city} />
              <DetailItem label="Close Branch" value={user.branch} />
            </div>
          </section>

          {/* Next of Kin Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-secondary pl-3 mb-6">
              Next of Kin
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="Name" value={user.next_of_kin_name} />
              <DetailItem label="Phone" value={user.next_of_kin_phone} />
              <DetailItem label="Email" value={user.next_of_kin_email} />
              <DetailItem
                label="Relationship"
                value={user.next_of_kin_relationship}
              />
              <DetailItem label="Address" value={user.next_of_kin_address} />
            </div>
          </section>

          {/* Professional Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-secondary pl-3 mb-6">
              Professional Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DetailItem
                label="Job Description"
                value={user.job_description}
              />
              <DetailItem
                label="Salary"
                value={formatterUtility(Number(user.salary))}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 mt-10 flex gap-3 justify-end">
          {awaitingVerification && !isVerified && (
            <button
              onClick={() => setOpenVerificationModal(true)}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Verify
            </button>
          )}
          <button
            onClick={() =>
              navigate("/dashboard/manage/users", {
                state: location.state?.listState
                  ? { listState: location.state.listState }
                  : undefined,
              })
            }
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      {openVerificationModal && (
        <Modal onClose={() => setOpenVerificationModal(null)}>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Verify <span className="capitalize">{user?.firstname}</span>'s
              eligibilty
            </h2>
            <div>
              <label
                htmlFor="status"
                className="block text-gray-700 mb-2 font-medium"
              >
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  id="status"
                  defaultValue={formik.values.status || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition duration-300 capitalize"
                >
                  <option disabled value={""}>
                    Pick a status
                  </option>
                  {["verified", "declined"].map((status) => (
                    <option value={status} key={status} className="capitalize">
                      {status}
                    </option>
                  ))}
                </select>
                {formik.touched.status && formik.errors.status ? (
                  <div className="text-red-500 text-xs mt-2">
                    {formik.errors.status}
                  </div>
                ) : null}
              </div>
            </div>
            {formik.values.status === "verified" && (
              <div>
                <label
                  htmlFor="admin_approved_salary"
                  className="block text-gray-700 font-medium"
                >
                  Enter estimated monthly income based on statement review
                </label>
                <div className="relative">
                  <FormattedNumberInput
                    id="admin_approved_salary"
                    name="admin_approved_salary"
                    value={formik.values.admin_approved_salary}
                    onChange={(value) =>
                      formik.setFieldValue("admin_approved_salary", value)
                    }
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition duration-300"
                  />
                  {formik.touched.admin_approved_salary &&
                  formik.errors.admin_approved_salary ? (
                    <div className="text-red-500 text-xs mt-2">
                      {formik.errors.admin_approved_salary}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={isVerifying || !formik.isValid}
              className="w-full h-12 bg-[#2F5318] text-white font-medium rounded-lg hover:bg-[#254015] transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? "Verifying..." : "Proceed"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ViewUser;
