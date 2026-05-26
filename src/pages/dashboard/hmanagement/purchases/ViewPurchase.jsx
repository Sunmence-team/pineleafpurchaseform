import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaFileInvoiceDollar,
  FaHome,
  FaUser,
} from "react-icons/fa";
import { toast } from "sonner";
import assets from "../../../../assets/assests";
import api, { getErrorMessage } from "../../../../utilities/api";
import {
  formatISODateToCustom,
  formatterUtility,
  formatUnderScores,
} from "../../../../utilities/formatterUtility";
import { StatusTurnPriorityCard } from "../../../../components/cards/StatusCard";
import Modal from "../../../../components/modals/Modal";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

const ViewPurchase = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [purchase, setPurchase] = useState(location.state || null);
  const [isLoading, setIsLoading] = useState(!location.state);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentActionNote, setPaymentActionNote] = useState("");
  const [isProcessingPaymentAction, setIsProcessingPaymentAction] =
    useState(false);

  useEffect(() => {
    const fetchPurchaseDetail = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/admin/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 && response.data.data) {
          setPurchase(response.data.data);
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate("/dashboard/manage/purchases");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseDetail();
  }, [id, navigate]);

  const resolveProofUrl = (proofValue) => {
    if (!proofValue) return "";
    const raw =
      typeof proofValue === "string"
        ? proofValue
        : proofValue?.url || proofValue?.path || "";
    if (!raw) return "";
    return raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `${HM_STORAGE_API_URL}${raw}`;
  };

  const handlePaymentAction = async (paymentReference, action) => {
    if (action === "rejected" && !paymentActionNote.trim()) {
      toast.error("Please provide a rejection note.");
      return;
    }

    setIsProcessingPaymentAction(true);

    try {
      const payload = {
        reference: paymentReference,
      };

      if (action === "rejected") {
        payload.status = "rejected";
        payload.note = paymentActionNote.trim();
      } else {
        payload.status = "success";
      }

      const response = await api.post(
        `/api/admin/applications/verify/manual`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        toast.success(
          response.data.message ||
            (action === "rejected"
              ? "Payment rejected successfully."
              : "Payment verified successfully."),
        );
        setPurchase(response.data?.data);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      console.error("Error processing payment action:", err);
    } finally {
      setIsProcessingPaymentAction(false);
      setPaymentDetails(null);
      setPaymentActionNote("");
    }
  };

  const paymentProofUrl = resolveProofUrl(
    paymentDetails?.payment_gateway_response?.proof_of_payment,
  );
  const isPaymentProofPdf = paymentProofUrl.toLowerCase().endsWith(".pdf");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Application not found
        </p>
        <button
          onClick={() => navigate("/dashboard/manage/purchases")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-pryClr"
        >
          Back to Purchases
        </button>
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title }) => (
    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6 flex items-center gap-2">
      {/* <Icon className="text-primary" /> */}
      {title}
    </h3>
  );

  const InfoItem = ({ label, value, className = "", capitalize = false }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-sm sm:text-base text-gray-900 font-medium truncate ${capitalize ? "capitalize" : ""}`}
      >
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-5xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/manage/purchases")}
              className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <img src={assets.logo} className="w-10 h-10" alt="Logo" />
            <h1 className="text-2xl font-bold text-gray-900">
              Purchase Details
            </h1>
          </div>
          <StatusTurnPriorityCard status={purchase?.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Applicant & Application Details */}
          <div className="space-y-10">
            {/* Applicant Section */}
            <section>
              <SectionHeader icon={FaUser} title="Applicant Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <InfoItem
                  label="Full Name"
                  value={`${purchase.user?.firstname} ${purchase.user?.lastname}`}
                />
                <InfoItem label="Phone" value={purchase.user?.phone} />
                <div className="md:col-span-2">
                  <InfoItem label="Email" value={purchase.user?.email} />
                </div>
                <InfoItem
                  label="Occupation"
                  value={purchase.user?.job_description}
                />
                <InfoItem label="Country" value={purchase.user?.country} />
                <InfoItem
                  label="Indicated Monthly Salary"
                  value={formatterUtility(Number(purchase.user?.salary))}
                />
                <InfoItem
                  label="Approved Monthly Salary"
                  value={formatterUtility(
                    Number(purchase.user?.admin_approved_salary),
                  )}
                />
              </div>
            </section>

            {/* Application Details Section */}
            <section>
              <SectionHeader
                icon={FaFileInvoiceDollar}
                title="Application Details"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <InfoItem
                  label="Agreed Duration"
                  value={`${purchase.agreed_duration_months} Months`}
                />
                <InfoItem
                  label="Upfront Paid"
                  value={purchase.upfront_paid ? "Yes" : "No"}
                />
                <InfoItem
                  label="Submitted On"
                  value={new Date(purchase.created_at).toLocaleDateString()}
                />
                <InfoItem
                  label="Approved Date"
                  value={formatISODateToCustom(purchase.approved_at)}
                />
              </div>
            </section>
          </div>

          {/* Property Section */}
          <section>
            <SectionHeader icon={FaHome} title="Property Information" />
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
              {purchase.property?.images &&
                purchase.property?.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {purchase.property?.images.map((image) => (
                      <img
                        src={HM_STORAGE_API_URL + image}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                        alt={purchase.property?.name}
                      />
                    ))}
                  </div>
                )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem
                  label="Property Name"
                  value={purchase.property?.name}
                />
                <InfoItem
                  label="Estate"
                  value={purchase.property?.estate_name}
                />
                <InfoItem
                  label="Type"
                  value={purchase.property?.type}
                  className="capitalize"
                />
                <InfoItem
                  label="Price"
                  value={formatterUtility(Number(purchase.property?.price))}
                />
                <InfoItem
                  label="Location"
                  value={purchase.property?.location}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          </section>

          {/* Transactions Section */}
          <section className="lg:col-span-2">
            <SectionHeader icon={FaFileInvoiceDollar} title="Transactions" />
            <div className="space-y-4 grid lg:grid-cols-2 gap-4">
              {purchase.transactions && purchase.transactions.length > 0 ? (
                purchase.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col gap-4 justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex w-full justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900 capitalize">
                          {tx.type} Payment
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            tx.paid_at || tx.created_at,
                          ).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">
                          Ref: {tx.reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {formatterUtility(Number(tx.amount))}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            tx.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentDetails(tx)}
                      className="bg-secClr h-10 rounded-lg text-white w-full cursor-pointer"
                    >
                      View Payment
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500">
                    No transactions recorded yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 pt-8 mt-10 flex justify-end gap-4">
          <button
            onClick={() =>
              navigate("/dashboard/manage/purchases", {
                state: location.state?.listState,
              })
            }
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Back to List
          </button>
        </div>
      </div>

      {paymentDetails && (
        <Modal onClose={() => setPaymentDetails(null)}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem
                label="Payment Type"
                value={paymentDetails.type}
                capitalize={true}
              />
              <InfoItem
                label="Amount"
                value={formatterUtility(Number(paymentDetails.amount))}
              />
              <InfoItem
                label="status"
                value={paymentDetails?.status}
                capitalize={true}
              />
              <InfoItem
                label="Payment Method"
                value={formatUnderScores(paymentDetails?.payment_method, {
                  capitalize: true,
                })}
              />
              <InfoItem label="Reference" value={paymentDetails?.reference} />
              <InfoItem
                label="Payment Date"
                value={formatISODateToCustom(paymentDetails.created_at)}
              />
              <InfoItem
                label="Confirmation Date"
                value={paymentDetails.paid_at}
              />
            </div>
            {paymentDetails?.payment_gateway_response?.proof_of_payment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment Proof
                  </h3>
                  <a
                    href={paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-sm font-semibold text-primary underline"
                  >
                    {isPaymentProofPdf
                      ? "Open / Download PDF"
                      : "Open / Download Proof"}
                  </a>
                </div>
                {isPaymentProofPdf ? (
                  <div className="space-y-2">
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <object
                        data={paymentProofUrl}
                        type="application/pdf"
                        width="100%"
                        height="500"
                      >
                        <p className="p-4 text-sm text-gray-500">
                          PDF preview is not available. You can open or download
                          it below.
                        </p>
                      </object>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <img
                      src={paymentProofUrl}
                      alt="Payment proof"
                      className="w-full max-h-[500px] object-contain border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
            {paymentDetails.type === "upfront" &&
              paymentDetails.status === "pending" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Rejection Note
                    </label>
                    <textarea
                      rows={4}
                      value={paymentActionNote}
                      onChange={(e) => setPaymentActionNote(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                      placeholder="Enter a note when rejecting this payment"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={isProcessingPaymentAction}
                      onClick={() =>
                        handlePaymentAction(paymentDetails.reference, "success")
                      }
                      className="h-12 rounded-lg bg-[#2F5318] text-white font-medium hover:bg-[#254015] transition duration-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isProcessingPaymentAction ? "Processing..." : "Verify"}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingPaymentAction}
                      onClick={() =>
                        handlePaymentAction(
                          paymentDetails.reference,
                          "rejected",
                        )
                      }
                      className="h-12 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition duration-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isProcessingPaymentAction ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewPurchase;
