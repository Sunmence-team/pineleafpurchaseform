import React, { useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaDownload, FaArrowLeft } from "react-icons/fa";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import assets from "../../../assets/assets";
import { formatterUtility } from "../../../helpers/formatterUtility";
import EntryNotesSection from "../../../components/EntryNotesSection";
import {
  useEntryDetails,
  useOldEntryDetails,
} from "../../../hooks/useClientEntries";

interface ViewFormEntryProps {
  endpointType?: "applications" | "clients";
}

const ViewFormEntry: React.FC<ViewFormEntryProps> = ({ endpointType }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from;

  const isOldRecord =
    endpointType === "clients" ||
    (!endpointType && location.pathname.includes("/old-records/"));

  const handleBack = () => {
    if (fromPath) {
      navigate(fromPath);
    } else {
      navigate(isOldRecord ? "/dashboard/old-records" : "/dashboard/records");
    }
  };

  const backButtonText = fromPath
    ? "Go Back"
    : isOldRecord
      ? "Back to Old Records"
      : "Back to Records";

  const entryQuery = useEntryDetails(!isOldRecord ? id : null);
  const oldEntryQuery = useOldEntryDetails(isOldRecord ? id : null);

  const {
    data: responseData,
    isLoading,
    error,
  } = isOldRecord ? oldEntryQuery : entryQuery;

  const client = responseData?.data;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: client
      ? `${client.client_name || `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client"}_details`
      : "Client_Details",
    preserveAfterPrint: false,
    pageStyle: `
      @page { size: A4; margin: 15mm; }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-family: 'Inter', sans-serif;
        }
        .no-print { display: none !important; }
        .print-section { 
          padding: 16px; 
          background: #fff; 
          border: 1px solid #e5e7eb; 
        }
        .print-section h3 {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .print-section p {
          font-size: 12px;
          color: #374151;
          line-height: 1.5;
        }
        .print-section img {
          max-width: 100px;
          height: auto;
        }
      }
    `,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <p className="text-red-500 font-semibold mb-4">
          {error
            ? (error as any)?.response?.data?.message ||
              (error as Error).message ||
              "Failed to load client details"
            : "No client details found"}
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          {backButtonText}
        </button>
      </div>
    );
  }

  const isIndividual =
    !client.purchase_type || client.purchase_type === "individual";

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8 w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-200 pb-4 md:pb-6 mb-6 md:mb-8 no-print gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={handleBack}
              className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Back"
            >
              <FaArrowLeft className="text-gray-700 text-base md:text-lg" />
            </button>
            <img
              src={assets.logo}
              className="w-10 h-10 md:w-12 md:h-12"
              alt="Logo"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Client Details
            </h1>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center px-4 py-2 md:px-5 md:py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary transition-colors duration-200 w-full md:w-auto"
          >
            <FaDownload className="mr-2 text-sm md:text-base" />
            Download PDF
          </button>
        </div>

        {/* All Client Info */}
        <div
          ref={componentRef}
          className="space-y-6 md:space-y-10 print-section"
        >
          {/* Profile */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center border-b border-gray-200 pb-4 md:pb-6">
            {isIndividual ? (
              <>
                <img
                  src={
                    client.personal_picture ?? "https://via.placeholder.com/150"
                  }
                  alt="Client"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
                />
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {client.client_name ||
                      `${client.first_name || ""} ${client.last_name || ""}`.trim()}
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Email: {client.email}
                  </p>
                  <p className="text-sm md:text-base text-gray-600">
                    Phone: {client.mobile_number}
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2 w-full">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                  {client.purchase_type}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                  {client.client_name || client.club_name}
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Official Contact: {client.club_contact}
                </p>
              </div>
            )}
          </div>

          {/* Personal Information / Club Details dynamic block */}
          {isIndividual ? (
            <div>
              <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-6">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">First Name:</span>{" "}
                  {client.first_name}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Middle Name:</span>{" "}
                  {client.middle_name}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Last Name:</span>{" "}
                  {client.last_name}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Gender:</span> {client.gender}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Marital Status:</span>{" "}
                  {client.marital_status}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">State of Origin:</span>{" "}
                  {client.state_of_origin}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">LGA:</span> {client.lga}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Country of Residence:</span>{" "}
                  {client.country}
                </p>
                <p className="text-sm md:text-base text-gray-700 md:col-span-2">
                  <span className="font-medium">Address:</span> {client.address}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-6">
                  {client.purchase_type === "club"
                    ? "Club Details"
                    : "Association Details"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">Name:</span>{" "}
                    {client.client_name || client.club_name}
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">Official Contact:</span>{" "}
                    {client.club_contact}
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">State of Origin:</span>{" "}
                    {client.state_of_origin}
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">LGA:</span> {client.lga}
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">Country:</span>{" "}
                    {client.country}
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">Address:</span>{" "}
                    {client.address}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-4">
                  Registered Members
                </h3>
                {client.club_members && client.club_members.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full text-left text-sm text-gray-700">
                      <thead className="bg-gray-50 text-gray-700 uppercase text-xs tracking-wider">
                        <tr>
                          <th className="py-3 px-4 font-bold">S/N</th>
                          <th className="py-3 px-4 font-bold">Title</th>
                          <th className="py-3 px-4 font-bold">Full Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {client.club_members.map(
                          (member: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 text-gray-500 font-medium">
                                {index + 1}
                              </td>
                              <td className="py-3 px-4 font-semibold text-primary">
                                {member.title || member.Title || ""}
                              </td>
                              <td className="py-3 px-4">
                                {member.first_name || member.firstName || ""}{" "}
                                {member.middle_name || member.middleName
                                  ? (member.middle_name || member.middleName) +
                                    " "
                                  : ""}
                                {member.last_name || member.lastName || ""}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-red-500 font-medium">
                    No members registered under this club.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Spouse Info */}
          {isIndividual &&
            (client.first_name_of_spouse || client.last_name_of_spouse) && (
              <div>
                <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-6">
                  Spouse Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">First Name:</span>{" "}
                    {client.first_name_of_spouse}
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">Middle Name:</span>{" "}
                    {client.middle_name_of_spouse}
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    <span className="font-medium">Last Name:</span>{" "}
                    {client.last_name_of_spouse}
                  </p>
                </div>
              </div>
            )}

          {/* Contact Info */}
          {isIndividual && (
            <div>
              <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-6">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Email:</span> {client.email}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Mobile Number:</span>{" "}
                  {client.mobile_number}
                </p>
              </div>
            </div>
          )}

          {/* Next of Kin / Representative Details */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-6">
              {isIndividual
                ? "Next of Kin"
                : "Representative / Trustee Details"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">
                  {isIndividual
                    ? "Full Name:"
                    : "Representative / Trustee Full Name:"}
                </span>{" "}
                {client.next_of_kin_full_name}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">
                  {isIndividual ? "Relationship:" : "Role / Designation:"}
                </span>{" "}
                {client.next_of_kin_relationship}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">
                  {isIndividual ? "Phone:" : "Representative Contact Mobile:"}
                </span>{" "}
                {client.next_of_kin_mobile_number}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">
                  {isIndividual ? "Email:" : "Representative Contact Email:"}
                </span>{" "}
                {client.next_of_kin_email}
              </p>
            </div>
          </div>

          {/* Land Details */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-6">
              Land Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Property Name:</span>{" "}
                {client.properties?.name || client.site_location}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Price per plot:</span>{" "}
                {formatterUtility(Number(client.land_price || 0))}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Number of Plots:</span>{" "}
                {client.number_of_plot}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Total Amount:</span>{" "}
                {formatterUtility(Number(client.land_price || 0) * Number(client.number_of_plot || 0))}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Plot Number:</span>{" "}
                {client.plot_number}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Branch:</span>{" "}
                {client.branch?.name || client.branches}
              </p>
            </div>
          </div>

          {/* Declaration */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-6">
              Declaration
            </h3>
            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
              <div className="space-y-2">
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Name:</span>{" "}
                  {client.declaration_name}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Date:</span>{" "}
                  {client.declaration_date
                    ? format(new Date(client.declaration_date), "dd/MM/yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm md:text-base text-gray-700 font-medium mb-2">
                  Signature:
                </p>
                <img
                  src={client.signature ?? "https://via.placeholder.com/150"}
                  alt="Signature"
                  className="w-40 h-24 md:w-56 md:h-36 object-contain border-2 border-gray-100 rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Referral */}
          {client.referral_name && (
            <div>
              <h3 className="text-lg md:text-2xl font-semibold text-primary border-b border-gray-200 py-3 mb-6">
                Referral
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Name:</span>{" "}
                  {client.referral_name}
                </p>
                <p className="text-sm md:text-base text-gray-700">
                  <span className="font-medium">Phone:</span>{" "}
                  {client.referral_number}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Entry Notes Section */}
        <div className="no-print">
          <EntryNotesSection entryId={id || ""} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 md:pt-6 mt-6 md:mt-8 flex justify-end no-print">
          <button
            onClick={handleBack}
            className="px-4 py-2 md:px-5 md:py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 w-full md:w-auto"
          >
            {backButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFormEntry;
