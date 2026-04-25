import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import assets from "../../../../assets/assests";
import api, { getErrorMessage } from "../../../../utilities/api";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state || null);
  const [isLoading, setIsLoading] = useState(!location.state);

  useEffect(() => {
    if (!user) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          // Following the pattern of using POST for detail if that's what's expected
          // but trying GET first as it's more standard for "users/:id"
          // The user mentioned "post req to 'users/8'" so I'll use POST as requested
          const response = await api.post(`/users/${id}`, {});
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-700 mb-4">User not found</p>
        <button
          onClick={() => navigate("/dashboard/manage/users")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const DetailItem = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm sm:text-base text-gray-900 font-medium">{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-4xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8">
          <button
            onClick={() => navigate("/dashboard/manage/users")}
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <img src={assets.logo} className="w-10 h-10" alt="Logo" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-sm text-gray-500">ID: {id}</p>
          </div>
        </div>

        <div className="space-y-10">
          {/* Profile Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="First Name" value={user.firstname} />
              <DetailItem label="Last Name" value={user.lastname} />
              <DetailItem label="Email" value={user.email} />
              <DetailItem label="Phone" value={user.phone} />
              <DetailItem label="Gender" value={user.gender} />
              <DetailItem label="Date of Birth" value={user.date_of_birth} />
            </div>
          </section>

          {/* Address Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
              Address Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="Address" value={user.address} />
              <DetailItem label="Address 2" value={user.address2} />
              <DetailItem label="Country" value={user.country} />
              <DetailItem label="State" value={user.state} />
              <DetailItem label="City" value={user.city} />
              <DetailItem label="Postal Code" value={user.postal_code} />
            </div>
          </section>

          {/* Next of Kin Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
              Next of Kin
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="Name" value={user.next_of_kin_name} />
              <DetailItem label="Phone" value={user.next_of_kin_phone} />
              <DetailItem label="Email" value={user.next_of_kin_email} />
              <DetailItem label="Relationship" value={user.next_of_kin_relationship} />
              <DetailItem label="Address" value={user.next_of_kin_address} />
            </div>
          </section>

          {/* Professional Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
              Professional Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DetailItem label="Job Description" value={user.job_description} />
              <DetailItem label="Salary" value={user.salary} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 mt-10 flex justify-end">
          <button
            onClick={() => navigate("/dashboard/manage/users")}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
