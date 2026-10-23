import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaFileInvoiceDollar,
  FaHome,
  FaUser,
} from "react-icons/fa";
import { toast } from "sonner";
import { getErrorMessage } from "../../../../helpers/api";
import {
  formatISODateToCustom,
  formatterUtility,
  formatUnderScores,
} from "../../../../helpers/formatterUtility";
import Modal from "../../../../components/modals/Modal";
import StatusCard from "../../../../components/cards/StatusCard";
import {
  usePurchase,
  useVerifyPurchasePayment,
} from "../../../../hooks/usePurchases";
import type {
  PurchaseItem,
  PurchaseTransaction,
  VerifyPurchasePaymentPayload,
} from "../../../../services/purchaseService";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

export type PurchaseDetail = PurchaseItem;
export type TransactionDetail = PurchaseTransaction;

const ViewPurchase: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // TanStack Query for purchase details
  const {
    data: purchase,
    isLoading,
  } = usePurchase(id, location.state);

  const [paymentDetails, setPaymentDetails] =
    useState<PurchaseTransaction | null>(null);
  const [paymentActionNote, setPaymentActionNote] = useState("");

  // TanStack Mutation for verifying manual payment
  const verifyPaymentMutation = useVerifyPurchasePayment();

  const resolveProofUrl = (proofValue: any): string => {
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

  const handlePaymentAction = async (
    paymentReference: string | undefined,
    action: "approved" | "rejected",
  ) => {
    if (!paymentReference) return;
    if (action === "rejected" && !paymentActionNote.trim()) {
      toast.error("Please provide a rejection note.");
      return;
    }

    try {
      const payload: VerifyPurchasePaymentPayload = {
        reference: paymentReference,
        status: action,
        ...(action === "rejected" ? { note: paymentActionNote.trim() } : {}),
      };

      const res = await verifyPaymentMutation.mutateAsync(payload);

      toast.success(
        res?.message ||
          (action === "rejected"
            ? "Payment rejected successfully."
            : "Payment verified successfully."),
      );
      setPaymentDetails(null);
      setPaymentActionNote("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Error processing payment action"));
      console.error("Error processing payment action:", err);
    }
  };

  const paymentProofUrl = resolveProofUrl(
    paymentDetails?.payment_gateway_response?.proof_of_payment,
  );
  const isPaymentProofPdf = paymentProofUrl.toLowerCase().endsWith(".pdf");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Application not found
        </p>
        <button
          onClick={() => navigate("/dashboard/manage/purchases")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer"
        >
          Back to Purchases
        </button>
      </div>
    );
  }

  const SectionHeader = ({ title }: { icon?: any; title: string }) => (
    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6 flex items-center gap-2">
      {title}
    </h3>
  );

  const InfoItem = ({
    label,
    value,
    className = "",
    capitalize = false,
  }: {
    label: string;
    value: any;
    className?: string;
    capitalize?: boolean;
  }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-sm md:text-base text-gray-900 font-medium truncate ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex md:flex-row flex-col items-center justify-between pb-6 mb-8 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navigate("/dashboard/manage/purchases", {
                state: location.state?.listState
                  ? { listState: location.state.listState }
                  : undefined,
              })
            }
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Purchase Application Details
          </h1>
        </div>
        <StatusCard type={purchase?.status} statusText={purchase?.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Applicant & Application Summary */}
        <div className="space-y-10">
          {/* Applicant Section */}
          <section className="border-b pb-4 border-primary/10">
            <SectionHeader icon={FaUser} title="Applicant Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary p-6 rounded-xl border border-primary/10">
              <InfoItem
                label="Full Name"
                value={`${purchase.user?.firstname ?? ""} ${purchase.user?.lastname ?? ""}`.trim()}
              />
              <InfoItem label="Email" value={purchase.user?.email} />
              <InfoItem label="Phone" value={purchase.user?.phone} />
              <InfoItem
                label="Job / Occupation"
                value={purchase.user?.job_description}
              />
              <InfoItem
                label="Declared Monthly Revenue"
                value={
                  purchase.user?.salary
                    ? formatterUtility(Number(purchase.user.salary))
                    : "N/A"
                }
              />
              <InfoItem
                label="Verified Monthly Revenue"
                value={
                  purchase.user?.admin_approved_salary
                    ? formatterUtility(
                        Number(purchase.user.admin_approved_salary),
                      )
                    : "N/A"
                }
              />
            </div>
          </section>

          {/* Application Details Section */}
          <section className="border-b pb-4 border-primary/10">
            <SectionHeader
              icon={FaFileInvoiceDollar}
              title="Application Details"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary p-6 rounded-xl border border-primary/10">
              <InfoItem
                label="Application Status"
                value={purchase.status}
                capitalize={true}
              />
              <InfoItem
                label="Payment Duration"
                value={
                  purchase.agreed_duration_months
                    ? `${purchase.agreed_duration_months} Months`
                    : "Outright / N/A"
                }
              />
              <InfoItem
                label="Upfront Requirement"
                value={purchase.upfront_paid ? "Satisfied" : "Pending / None"}
              />
              <InfoItem
                label="Applied On"
                value={formatISODateToCustom(purchase.created_at)}
              />
              {purchase.approved_at && (
                <div className="md:col-span-2">
                  <InfoItem
                    label="Approved Date"
                    value={formatISODateToCustom(purchase.approved_at)}
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Property Summary */}
        <div className="space-y-10">
          <section className="border-b pb-4 border-primary/10">
            <SectionHeader icon={FaHome} title="Selected Property" />
            <div className="bg-secondary p-6 rounded-xl border border-primary/10 space-y-6">
              {purchase.property?.images &&
                purchase.property.images.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={`${HM_STORAGE_API_URL}${purchase.property.images[0]}`}
                      alt={purchase.property.name || "Property image"}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  label="Property Name"
                  value={purchase.property?.name}
                />
                <InfoItem
                  label="Estate Name"
                  value={purchase.property?.estate_name}
                />
                <InfoItem
                  label="Property Type"
                  value={purchase.property?.type}
                  capitalize={true}
                />
                <InfoItem
                  label="Price"
                  value={
                    purchase.property?.price
                      ? formatterUtility(Number(purchase.property.price))
                      : "N/A"
                  }
                />
                <div className="md:col-span-2">
                  <InfoItem
                    label="Location"
                    value={purchase.property?.location}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Full Width Bottom: Transaction & Payment History */}
      <div className="mt-8">
        <SectionHeader
          icon={FaFileInvoiceDollar}
          title="Payment & Transactions History"
        />
        {purchase.transactions && purchase.transactions.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-primary/10">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-secondary text-xs uppercase text-gray-500 font-semibold border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {purchase.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {tx.reference || `TX-${tx.id}`}
                    </td>
                    <td className="px-6 py-4">
                      {formatUnderScores(tx.type || "N/A", true)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatterUtility(Number(tx.amount))}
                    </td>
                    <td className="px-6 py-4">
                      {formatUnderScores(tx.payment_method || "N/A", true)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          tx.status === "approved" || tx.status === "success"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatISODateToCustom(tx.paid_at || tx.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tx.payment_method !== "paystack" &&
                      tx.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => setPaymentDetails(tx)}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer"
                        >
                          Review Payment
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPaymentDetails(tx)}
                          className="px-3 py-1.5 bg-secondary text-gray-700 border border-primary/10 rounded-lg text-xs font-semibold hover:bg-gray-100 transition cursor-pointer"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-secondary p-8 rounded-xl border border-primary/10 text-center text-gray-500 text-sm">
            No transactions or payment records recorded for this application yet.
          </div>
        )}
      </div>

      {paymentDetails && (
        <Modal onClose={() => setPaymentDetails(null)}>
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
              Transaction Details & Proof
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-secondary p-4 rounded-xl border border-primary/10">
              <div>
                <span className="text-gray-500 text-xs block font-semibold uppercase">
                  Reference
                </span>
                <span className="font-semibold text-gray-800">
                  {paymentDetails.reference || `TX-${paymentDetails.id}`}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block font-semibold uppercase">
                  Amount
                </span>
                <span className="font-semibold text-gray-800">
                  {formatterUtility(Number(paymentDetails.amount))}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block font-semibold uppercase">
                  Payment Method
                </span>
                <span className="font-semibold text-gray-800 capitalize">
                  {formatUnderScores(
                    paymentDetails.payment_method || "N/A",
                    true,
                  )}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block font-semibold uppercase">
                  Transaction Status
                </span>
                <span className="font-semibold text-gray-800 capitalize">
                  {paymentDetails.status}
                </span>
              </div>
            </div>

            {paymentProofUrl ? (
              <div className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 block">
                  Uploaded Proof of Payment
                </span>
                <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 flex flex-col items-center justify-center max-h-96 overflow-auto">
                  {isPaymentProofPdf ? (
                    <div className="p-6 text-center space-y-3">
                      <p className="text-sm text-gray-600 font-medium">
                        Proof is in PDF format.
                      </p>
                      <a
                        href={paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition"
                      >
                        Open PDF Document
                      </a>
                    </div>
                  ) : (
                    <img
                      src={paymentProofUrl}
                      alt="Proof of payment"
                      className="max-h-80 w-auto rounded-lg object-contain shadow-xs"
                    />
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200 text-center">
                No proof document attached with this transaction.
              </p>
            )}

            {paymentDetails.payment_method !== "paystack" &&
              paymentDetails.status === "pending" && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rejection Reason / Admin Note
                    </label>
                    <textarea
                      value={paymentActionNote}
                      onChange={(e) => setPaymentActionNote(e.target.value)}
                      placeholder="Add an administrative reason (required if rejecting)..."
                      className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2 border-t">
                    <button
                      type="button"
                      disabled={verifyPaymentMutation.isPending}
                      onClick={() =>
                        handlePaymentAction(
                          paymentDetails.reference,
                          "rejected",
                        )
                      }
                      className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {verifyPaymentMutation.isPending
                        ? "Processing..."
                        : "Reject Payment"}
                    </button>
                    <button
                      type="button"
                      disabled={verifyPaymentMutation.isPending}
                      onClick={() =>
                        handlePaymentAction(
                          paymentDetails.reference,
                          "approved",
                        )
                      }
                      className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {verifyPaymentMutation.isPending
                        ? "Processing..."
                        : "Verify & Approve"}
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
