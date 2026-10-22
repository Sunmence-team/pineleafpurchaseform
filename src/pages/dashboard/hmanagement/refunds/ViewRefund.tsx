import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaUniversity,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "sonner";
import { hmApi, getErrorMessage } from "../../../../helpers/api";
import { formatterUtility } from "../../../../helpers/formatterUtility";
import { StatusTurnPriorityCard } from "../../../../components/cards/StatusCard";

export interface RefundDetail {
  id: number;
  amount?: number | string;
  status?: string;
  created_at?: string;
  admin_note?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  user?: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

const ViewRefund: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [refund, setRefund] = useState<RefundDetail | null>(
    location.state?.refund || null,
  );
  const [isLoading, setIsLoading] = useState(!location.state?.refund);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchRefundDetail = async () => {
      setIsLoading(true);
      try {
        const response = await hmApi.get(`/api/admin/refunds/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 && response.data.data) {
          setRefund(response.data.data);
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate("/dashboard/manage/refunds");
      } finally {
        setIsLoading(false);
      }
    };

    if (!refund && id) {
      fetchRefundDetail();
    }
  }, [id, navigate, refund, token]);

  const handleStatusUpdate = async (status: "settled" | "rejected") => {
    if (status === "rejected" && !adminNote.trim()) {
      toast.error("Please provide a reason for rejection in the admin note.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await hmApi.patch(
        `/api/admin/refunds/${id}`,
        {
          status,
          admin_note: adminNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        toast.success(
          `Refund ${status === "settled" ? "approved" : "rejected"} successfully.`,
        );
        setRefund(response.data.data || { ...refund, status });
        setAdminNote("");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!refund) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Refund request not found
        </p>
        <button
          onClick={() => navigate("/dashboard/manage/refunds")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer"
        >
          Back to Refunds
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
        className={`text-sm sm:text-base text-gray-900 font-medium truncate ${
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
              navigate("/dashboard/manage/refunds", {
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
            Refund Request Details
          </h1>
        </div>
        <StatusTurnPriorityCard status={refund?.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: User & Refund Information */}
        <div className="space-y-10">
          {/* User Section */}
          <section className="border-b pb-4 border-primary/10">
            <SectionHeader icon={FaUser} title="User Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary p-6 rounded-xl border border-primary/10">
              <InfoItem
                label="Full Name"
                value={`${refund.user?.firstname ?? ""} ${refund.user?.lastname ?? ""}`.trim()}
              />
              <InfoItem label="Phone" value={refund.user?.phone} />
              <div className="md:col-span-2">
                <InfoItem label="Email" value={refund.user?.email} />
              </div>
            </div>
          </section>

          {/* Refund Details Section */}
          <section className="border-b pb-4 border-primary/10">
            <SectionHeader icon={FaInfoCircle} title="Refund Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-secondary p-6 rounded-xl border border-primary/10">
              <InfoItem
                label="Amount"
                value={formatterUtility(Number(refund.amount))}
              />
              <InfoItem
                label="Status"
                value={refund.status}
                capitalize={true}
              />
              <InfoItem
                label="Requested On"
                value={
                  refund.created_at
                    ? new Date(refund.created_at).toLocaleString()
                    : "-"
                }
              />
              {refund.admin_note && (
                <div className="sm:col-span-2">
                  <InfoItem label="Admin Note" value={refund.admin_note} />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Bank Section & Actions */}
        <div className="space-y-10">
          <section className="border-b pb-4 border-primary/10">
            <SectionHeader icon={FaUniversity} title="Bank Information" />
            <div className="bg-secondary p-6 rounded-xl border border-primary/10 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <InfoItem label="Bank Name" value={refund.bank_name} />
                <InfoItem
                  label="Account Number"
                  value={refund.account_number}
                />
                <InfoItem label="Account Name" value={refund.account_name} />
              </div>
            </div>
          </section>

          {/* Action Section (if pending) */}
          {refund.status === "pending" && (
            <section className="bg-secondary p-6 rounded-xl border border-primary/10 space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                Process Request
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin Note
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a reason or note (Required if rejecting)..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusUpdate("settled")}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer text-sm"
                >
                  {isProcessing ? "Processing..." : "Approve & Settle"}
                </button>
                <button
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer text-sm"
                >
                  {isProcessing ? "Processing..." : "Reject"}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRefund;
