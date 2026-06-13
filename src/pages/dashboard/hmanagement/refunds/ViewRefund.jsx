import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaUniversity,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "sonner";
import assets from "../../../../assets/assests";
import api, { getErrorMessage } from "../../../../utilities/api";
import {
  formatterUtility,
} from "../../../../utilities/formatterUtility";
import { StatusTurnPriorityCard } from "../../../../components/cards/StatusCard";

const ViewRefund = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [refund, setRefund] = useState(location.state?.refund || null);
  const [isLoading, setIsLoading] = useState(!location.state?.refund);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchRefundDetail = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/admin/refunds/${id}`, {
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

    if (!refund) {
      fetchRefundDetail();
    }
  }, [id, navigate, refund, token]);

  const handleStatusUpdate = async (status) => {
    if (status === "rejected" && !adminNote.trim()) {
      toast.error("Please provide a reason for rejection in the admin note.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.patch(
        `/api/admin/refunds/${id}`,
        {
          status,
          admin_note: adminNote.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(`Refund marked as ${status} successfully.`);
        setRefund(response.data.data);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!refund) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Refund request not found
        </p>
        <button
          onClick={() => navigate("/dashboard/manage/refunds")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-pryClr"
        >
          Back to Refunds
        </button>
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title }) => (
    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6 flex items-center gap-2">
      <Icon className="text-primary" />
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
              onClick={() => navigate("/dashboard/manage/refunds", { state: location.state?.listState })}
              className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <img src={assets.logo} className="w-10 h-10" alt="Logo" />
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
            <section>
              <SectionHeader icon={FaUser} title="User Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <InfoItem
                  label="Full Name"
                  value={`${refund.user?.firstname} ${refund.user?.lastname}`}
                />
                <InfoItem label="Phone" value={refund.user?.phone} />
                <div className="md:col-span-2">
                  <InfoItem label="Email" value={refund.user?.email} />
                </div>
              </div>
            </section>

            {/* Refund Details Section */}
            <section>
              <SectionHeader
                icon={FaInfoCircle}
                title="Refund Details"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
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
                  value={new Date(refund.created_at).toLocaleString()}
                />
                {refund.admin_note && (
                  <div className="sm:col-span-2">
                    <InfoItem label="Admin Note" value={refund.admin_note} />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Bank Section */}
          <section>
            <SectionHeader icon={FaUniversity} title="Bank Information" />
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <InfoItem
                  label="Bank Name"
                  value={refund.bank_name}
                />
                <InfoItem
                  label="Account Number"
                  value={refund.account_number}
                />
                <InfoItem
                  label="Account Name"
                  value={refund.account_name}
                  className="capitalize"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Action Section for Pending Refunds */}
        {refund.status === "pending" && (
          <div className="mt-10 border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Process Refund</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Admin Note / Reason
                </label>
                <textarea
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter a note or reason for the action..."
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStatusUpdate("settled")}
                  className="px-8 py-3 rounded-lg bg-[#2F5318] text-white font-medium hover:bg-[#254015] transition duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? "Processing..." : "Mark as Settled"}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStatusUpdate("rejected")}
                  className="px-8 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? "Processing..." : "Reject Refund"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-gray-100 pt-8 mt-10 flex justify-end gap-4">
          <button
            onClick={() =>
              navigate("/dashboard/manage/refunds", {
                state: { listState: location.state?.listState },
              })
            }
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRefund;
