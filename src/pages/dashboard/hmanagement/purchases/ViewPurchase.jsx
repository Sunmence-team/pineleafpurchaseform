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
import { formatterUtility } from "../../../../utilities/formatterUtility";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

const ViewPurchase = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [purchase, setPurchase] = useState(location.state || null);
  const [isLoading, setIsLoading] = useState(!location.state);

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

  const InfoItem = ({ label, value, className = "" }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm sm:text-base text-gray-900 font-medium">
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Purchase Details
              </h1>
              <p className="text-sm text-gray-500">Application ID: {id}</p>
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${
              purchase.status === "approved"
                ? "bg-green-100 text-green-700"
                : purchase.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {purchase.status}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Applicant & Application Details */}
          <div className="space-y-10">
            {/* Applicant Section */}
            <section>
              <SectionHeader icon={FaUser} title="Applicant Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <InfoItem
                  label="Full Name"
                  value={`${purchase.user?.firstname} ${purchase.user?.lastname}`}
                />
                <InfoItem label="Email" value={purchase.user?.email} />
                <InfoItem label="Phone" value={purchase.user?.phone} />
                <InfoItem
                  label="Occupation"
                  value={purchase.user?.job_description}
                />
                <InfoItem
                  label="Monthly Salary"
                  value={formatterUtility(Number(purchase.user?.salary))}
                />
                <InfoItem label="Country" value={purchase.user?.country} />
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
                  label="Salary Snapshot"
                  value={formatterUtility(Number(purchase.salary_snapshot))}
                />
                <InfoItem
                  label="Submitted On"
                  value={new Date(purchase.created_at).toLocaleDateString()}
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
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900 capitalize">
                        {tx.type} Payment
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.paid_at || tx.created_at).toLocaleString()}
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
            onClick={() => navigate("/dashboard/manage/purchases")}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchase;
