import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "sonner";
import assets from "../../../../assets/assests";
import api, { getErrorMessage } from "../../../../utilities/api";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

const ViewProperty = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/api/properties/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProperty(response.data.data || response.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate("/dashboard/manage/listings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Property not found
        </p>
        <button
          onClick={() => navigate("/dashboard/manage/listings")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-pryClr"
        >
          Back to Properties
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-4xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8">
          <button
            onClick={() => navigate("/dashboard/manage/listings")}
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <img src={assets.logo} className="w-10 h-10" alt="Logo" />
          <h1 className="text-2xl font-bold text-gray-900">Property Details</h1>
        </div>

        <div className="space-y-10">
          {/* Images Section */}
          {property.images && property.images.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
                Property Images
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${HM_STORAGE_API_URL}${img}`}
                    alt={`${property.name} - ${idx}`}
                    className="w-full h-48 object-cover rounded-xl border border-gray-100 shadow-sm"
                  />
                ))}
              </div>
            </section>
          )}

          {/* General Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
              General Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="Property Name" value={property.name} />
              <DetailItem label="Estate Name" value={property.estate_name} />
              <DetailItem label="Location" value={property.location} />
              <DetailItem label="Property Type" value={property.type} />
              <DetailItem
                label="Price"
                value={
                  property.price
                    ? `₦${Number(property.price).toLocaleString()}`
                    : "N/A"
                }
              />
              <DetailItem label="Bedrooms" value={property.no_of_bedrooms} />
              <DetailItem label="Total Units" value={property.total_units} />
            </div>
          </section>

          {/* Description Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
              Description
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {property.description || "No description provided."}
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 mt-10 flex justify-end gap-4">
          <button
            onClick={() => navigate(`/dashboard/manage/listings/${id}/edit`)}
            className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-pryClr transition"
          >
            Edit Property
          </button>
          <button
            onClick={() => navigate("/dashboard/manage/listings")}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProperty;
