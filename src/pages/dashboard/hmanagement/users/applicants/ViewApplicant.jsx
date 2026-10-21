import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import assets from "../../../../../assets/assets";
import { api, getErrorMessage } from "../../../../../helpers/api";
import {
  formatISODateToCustom,
  formatterUtility,
  formatUnderScores,
} from "../../../../../helpers/formatterUtility";
import { StatusTurnPriorityCard } from "../../../../../components/cards/StatusCard";
import { FaDownload } from "react-icons/fa6";
import Modal from "../../../../../components/modals/Modal";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

const ViewApplicant = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [application, setApplication] = useState(location.state || null);
  const [isLoading, setIsLoading] = useState(!location.state);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentActionNote, setPaymentActionNote] = useState("");

  useEffect(() => {
    if (!application) {
      const fetchApplication = async () => {
        setIsLoading(true);
        try {
          const response = await hmApi.get(`/api/interest/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setApplication(response.data.data || response.data);
        } catch (err) {
          const msg = getErrorMessage(err);
          toast.error(msg);
          console.error("Error fetching application:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchApplication();
    }
  }, [id, application]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-secondary"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Application not found
        </p>
        <button
          onClick={() =>
            navigate("/dashboard/manage/applicants", {
              state: location.state?.listState
                ? { listState: location.state.listState }
                : undefined,
            })
          }
          className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
        >
          Back to applicants
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

  const handlePaymentAction = async (paymentReference, action) => {
    if (action === "rejected" && !paymentActionNote.trim()) {
      toast.error("Please provide a rejection note.");
      return;
    }

    setIsVerifying(true);
    try {
      const payload = {
        reference: paymentReference,
        status: "approved",
      };

      if (action === "rejected") {
        payload.status = "rejected";
        payload.note = paymentActionNote.trim();
      }

      const response = await hmApi.post(
        `/api/admin/interest/verify/manual`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setApplication(response.data.data || response.data);
        toast.success(
          response.data.message ||
            (action === "rejected"
              ? "Payment rejected successfully"
              : "Payment verified successfully"),
        );
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      console.error("Error processing payment action:", err);
    } finally {
      setIsVerifying(false);
      setPaymentActionNote("");
    }
  };

  const proofOfPaymentImage = `${HM_STORAGE_API_URL}${application?.proof_of_payment}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-4xl border border-gray-100">
        {/* Header */}
        <div className="flex md:flex-row flex-col items-center justify-between pb-6 mb-8  border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate("/dashboard/manage/applicants", {
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
            <h1 className="text-2xl font-bold text-gray-900">
              Application Details
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <StatusTurnPriorityCard status={application?.status} />
            {application?.user?.statement_of_account && (
              <a
                href={`${HM_STORAGE_API_URL}${application?.user?.statement_of_account}`}
                target="_blank"
                download
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem
                label="First Name"
                value={application?.user.firstname}
              />
              <DetailItem
                label="Last Name"
                value={application?.user.lastname}
              />
              <DetailItem label="Email" value={application?.user.email} />
              <DetailItem label="Phone" value={application?.user.phone} />
              <DetailItem label="Gender" value={application?.user.gender} />
              <DetailItem
                label="Date of Birth"
                value={
                  formatISODateToCustom(application?.user.date_of_birth).split(
                    " ",
                  )[0]
                }
              />
            </div>
          </section>

          {/* Address Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-secondary pl-3 mb-6">
              Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Address" value={application?.user.address} />
              <DetailItem
                label="Address 2"
                value={application?.user.address2}
              />
              <DetailItem label="Country" value={application?.user.country} />
              <DetailItem label="State" value={application?.user.state} />
              <DetailItem label="City" value={application?.user.city} />
              <DetailItem
                label="Close Branch"
                value={application?.user.branch}
              />
            </div>
          </section>

          {/* Next of Kin Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-secondary pl-3 mb-6">
              Next of Kin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem
                label="Name"
                value={application?.user.next_of_kin_name}
              />
              <DetailItem
                label="Phone"
                value={application?.user.next_of_kin_phone}
              />
              <DetailItem
                label="Email"
                value={application?.user.next_of_kin_email}
              />
              <DetailItem
                label="Relationship"
                value={application?.user.next_of_kin_relationship}
              />
              <DetailItem
                label="Address"
                value={application?.user.next_of_kin_address}
              />
            </div>
          </section>

          {/* Professional Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-secondary pl-3 mb-6">
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem
                label="Job Description"
                value={application?.user.job_description}
              />
              <DetailItem
                label="Salary"
                value={formatterUtility(Number(application?.user.salary))}
              />
              <DetailItem
                label="Statement Of Account"
                value={
                  application?.user?.statement_of_account
                    ? "Uploaded"
                    : "Not available"
                }
              />
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-secondary pl-3 mb-6">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem
                label="Date Filled"
                value={formatISODateToCustom(application?.created_at)}
              />
              <DetailItem
                label="Payment Date"
                value={formatISODateToCustom(application?.paid_at)}
              />
              <DetailItem
                label="Payment Method"
                value={formatUnderScores(application?.payment_method, {
                  capitalize: true,
                })}
              />
              <DetailItem
                label="Payment Reference"
                value={
                  application?.reference || application?.paystack_reference
                }
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 mt-10">
          {application?.payment_method !== "paysatck" &&
            application?.status === "pending" && (
              <div className="space-y-4 mb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Rejection Note
                  </label>
                  <textarea
                    rows={4}
                    value={paymentActionNote}
                    onChange={(e) => setPaymentActionNote(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                    placeholder="Add a reason when rejecting this payment"
                  />
                </div>
              </div>
            )}
          <div className="flex gap-3 justify-end">
            {application.proof_of_payment && (
              <a
                href={proofOfPaymentImage}
                target="_blank"
                download
                className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary transition-colors duration-200 w-full sm:w-auto text-sm"
              >
                <FaDownload className="mr-2 text-sm" />
                Download proof of payment
              </a>
            )}
            {application?.payment_method !== "paysatck" &&
              application?.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handlePaymentAction(application?.reference, "success")
                    }
                    disabled={isVerifying}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? "Processing..." : "Verify Payment"}
                  </button>
                  <button
                    onClick={() =>
                      handlePaymentAction(application?.reference, "rejected")
                    }
                    disabled={isVerifying}
                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? "Processing..." : "Reject Payment"}
                  </button>
                </>
              )}
            <button
              onClick={() =>
                navigate("/dashboard/manage/applicants", {
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
      </div>
    </div>
  );
};

export default ViewApplicant;
