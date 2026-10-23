import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "sonner";
import { getErrorMessage } from "../../../../helpers/api";
import { useHouse } from "../../../../hooks/useHouse";
import type { HouseItem } from "../../../../services/houseService";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

export type PropertyDetail = HouseItem;

const ViewProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TanStack Query hook for single house property
  const { data: property, isLoading, error } = useHouse(id);

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to load property"));
      navigate("/dashboard/manage/properties");
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Property not found
        </p>
        <button
          onClick={() => navigate("/dashboard/manage/properties")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  const DetailItem = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm md:text-base text-gray-900 font-medium">
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
            onClick={() => navigate("/dashboard/manage/properties")}
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Property Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/dashboard/manage/properties/${id}/edit`)}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition cursor-pointer text-sm"
          >
            Edit Property
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {/* Images Section */}
        {property.images && property.images.length > 0 && (
          <section className="border-b pb-4 border-primary/10">
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
              Property Images
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4">
              {property.images.map((img, idx) => (
                <img
                  key={idx}
                  src={`${HM_STORAGE_API_URL}${img}`}
                  alt={`${property.name} - ${idx}`}
                  className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-xs"
                />
              ))}
            </div>
          </section>
        )}

        {/* General Information */}
        <section className="border-b pb-4 border-primary/10">
          <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
            General Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-6">
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
        <section className="border-b pb-4 border-primary/10">
          <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
            Description
          </h3>
          <div className="bg-secondary p-5 rounded-xl border border-primary/10">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
              {property.description || "No description provided."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ViewProperty;
