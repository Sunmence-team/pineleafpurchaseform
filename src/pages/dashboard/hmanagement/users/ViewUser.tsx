import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import { hmApi, getErrorMessage } from "../../../../helpers/api";
import { FaDownload } from "react-icons/fa6";
import Modal from "../../../../components/modals/Modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../../../../helpers/formatterUtility";
import FormattedNumberInput from "../../../../components/FormattedNumberInput";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

export interface UserDetail {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  address2?: string;
  country?: string;
  state?: string;
  city?: string;
  branch?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_email?: string;
  next_of_kin_relationship?: string;
  next_of_kin_address?: string;
  job_type?: string;
  salary?: number | string;
  monthly_revenue?: number | string;
  admin_approved_salary?: number | string;
  verified_salary?: number | string;
  statement_of_account?: string;
  is_verified?: number | boolean;
  is_interested?: number | boolean;
  interest_transactions_count?: number;
  [key: string]: any;
}

const ViewUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserDetail | null>(location.state || null);
  const [isLoading, setIsLoading] = useState(!location.state);
  const [isVerifying, setIsVerifying] = useState(false);
  const [openVerificationModal, setOpenVerificationModal] = useState(false);

  useEffect(() => {
    if (!user && id) {
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
  }, [id, user, token]);

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
          toast.success("User verified successfully");
          setOpenVerificationModal(false);
          resetForm();
        }
      } catch (err) {
        const msg = getErrorMessage(err);
        toast.error(msg);
        console.error("Error verifying user:", err);
      } finally {
        setIsVerifying(false);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
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
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const DetailItem = ({ label, value }: { label: string; value: any }) => (
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
    (user?.interest_transactions_count ?? 0) > 0 && !user?.is_interested;
  const awaitingVerification =
    (user?.interest_transactions_count ?? 0) > 0 && user?.is_interested;
  const isVerified = user?.is_verified;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex md:flex-row flex-col items-center justify-between pb-6 mb-8 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navigate("/dashboard/manage/users", {
                state: location.state?.listState
                  ? { listState: location.state.listState }
                  : undefined,
              })
            }
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Status: </span>
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
              rel="noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200 w-full sm:w-auto text-sm cursor-pointer"
            >
              <FaDownload className="mr-2 text-sm" />
              Download Statement
            </a>
          )}
        </div>
      </div>

      <div className="space-y-10">
        {/* Profile Section */}
        <section className="border-b pb-4 border-primary/10">
          <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
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
                user.date_of_birth
                  ? formatISODateToCustom(user.date_of_birth).split(" ")[0]
                  : "N/A"
              }
            />
          </div>
        </section>

        {/* Address Section */}
        <section className="border-b pb-4 border-primary/10">
          <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
            Address Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label="Address" value={user.address} />
            <DetailItem label="Address 2" value={user.address2} />
            <DetailItem label="Country" value={user.country} />
            <DetailItem label="State" value={user.state} />
            <DetailItem label="City" value={user.city} />
            <DetailItem label="Closest Branch" value={user.branch} />
          </div>
        </section>

        {/* Next of Kin Section */}
        <section className="border-b pb-4 border-primary/10">
          <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
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
        <section className="border-b pb-4 border-primary/10">
          <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
            Professional Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label="Job Type" value={user.job_type} />
            <DetailItem
              label="Declared Monthly Revenue"
              value={
                user.salary
                  ? formatterUtility(Number(user.salary))
                  : user.monthly_revenue
                    ? formatterUtility(Number(user.monthly_revenue))
                    : "N/A"
              }
            />
            <DetailItem
              label="Verified Monthly Revenue"
              value={
                user.admin_approved_salary
                  ? formatterUtility(Number(user.admin_approved_salary))
                  : user.verified_salary
                    ? formatterUtility(Number(user.verified_salary))
                    : "N/A"
              }
            />
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={() => setOpenVerificationModal(true)}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition cursor-pointer"
        >
          Verify User
        </button>
      </div>

      {openVerificationModal && (
        <Modal onClose={() => setOpenVerificationModal(false)}>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Verify User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                >
                  <option value="">Select Status</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                {formik.touched.status && formik.errors.status ? (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.status as string}
                  </p>
                ) : null}
              </div>

              {formik.values.status === "verified" && (
                <div>
                  <FormattedNumberInput
                    label="Concluded monthly revenue"
                    name="admin_approved_salary"
                    value={formik.values.admin_approved_salary}
                    onChange={(val) =>
                      formik.setFieldValue("admin_approved_salary", val)
                    }
                    onBlur={formik.handleBlur}
                    placeholder="Enter concluded revenue"
                    error={
                      formik.touched.admin_approved_salary &&
                      Boolean(formik.errors.admin_approved_salary)
                    }
                    helperText={
                      formik.touched.admin_approved_salary &&
                      (formik.errors.admin_approved_salary as string)
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpenVerificationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? "Verifying..." : "Confirm Verification"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ViewUser;
