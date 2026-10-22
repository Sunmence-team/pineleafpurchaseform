import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaDownload, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import assets from "../assets/assets";
import { formatterUtility } from "../helpers/formatterUtility";
import { api } from "../helpers/api";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = "https://forms.pineleafestates.com/back/storage/app/public";

const ViewClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const componentRef = useRef(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view client details.");
          navigate("/login");
          return;
        }

        const response = await api.post(
          `${API_URL}/api/applications/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const application = response.data.data;
        if (!application) throw new Error("No client data found");

        // console.log("Raw API response:", application);

        const clientData = {
          id: application.id,
          purchase_type: application.purchase_type || "individual",
          club_name: application.club_name || "",
          club_contact: application.club_contact || "",
          club_members: application.club_members || [],
          personal_picture: application.personal_picture
            ? `${STORAGE_URL}/${application.personal_picture.replace(/^public\//, "")}`
            : "https://via.placeholder.com/150",
          client_name: application.client_name || "",
          first_name: application.first_name || "",
          middle_name: application.middle_name || "",
          last_name: application.last_name || "",
          address: application.address || "",
          marital_status: application.marital_status || "",
          gender: application.gender || "",
          first_name_of_spouse: application.first_name_of_spouse || "",
          middle_name_of_spouse: application.middle_name_of_spouse || "",
          last_name_of_spouse: application.last_name_of_spouse || "",
          state_of_origin: application.state_of_origin || "",
          lga: application.lga || "",
          country: application.country || "",
          email: application.email || "",
          mobile_number: application.mobile_number || "",
          next_of_kin_full_name: application.next_of_kin_full_name || "",
          next_of_kin_relationship: application.next_of_kin_relationship || "",
          next_of_kin_mobile_number:
            application.next_of_kin_mobile_number || "",
          next_of_kin_email: application.next_of_kin_email || "",
          land_price: application.land_price || "",
          number_of_plot: application.number_of_plot || "",
          site_location: application.site_location || "",
          plot_number: application.plot_number || "",
          branches: application.branches || "",
          signature: application.signature
            ? `${STORAGE_URL}/${application.signature.replace(/^public\//, "")}`
            : "https://via.placeholder.com/150",
          declaration_date: application.declaration_date
            ? new Date(application.declaration_date)
            : null,
          declaration_name: application.declaration_name || "",
          referral_name: application.referral_name || "",
          referral_number: application.referral_number || "",
        };

        // console.log("Raw personal_picture:", application.personal_picture);
        // console.log("Built Profile URL:", clientData.personal_picture);
        // console.log("Raw signature:", application.signature);
        // console.log("Built Signature URL:", clientData.signature);

        setClient(clientData);
      } catch (err) {
        console.error("Error fetching client:", err);
        toast.error(
          "Failed to fetch client details: " + (err.message || "Unknown error"),
        );
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchClient();
  }, [id, navigate]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: client ? `${client.client_name}_details` : "Client_Details",
    // removeAfterPrint: true,
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

  if (!client) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8 w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-200 pb-4 md:pb-6 mb-6 md:mb-8 no-print gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => navigate("/dashboard/overview")}
              className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Back to Dashboard"
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
            {client.purchase_type === "individual" ? (
              <>
                <img
                  src={client.personal_picture}
                  alt="Client"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
                />
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {client.client_name}
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
                  {client.client_name}
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Official Contact: {client.club_contact}
                </p>
              </div>
            )}
          </div>

          {/* Personal Information / Club Details dynamic block */}
          {client.purchase_type === "individual" ? (
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
                    {client.client_name}
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
                        {client.club_members.map((member, index) => (
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
                        ))}
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
          {client.purchase_type === "individual" &&
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
          {client.purchase_type === "individual" && (
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
              {client.purchase_type === "individual"
                ? "Next of Kin"
                : "Representative / Trustee Details"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">
                  {client.purchase_type === "individual"
                    ? "Full Name:"
                    : "Representative / Trustee Full Name:"}
                </span>{" "}
                {client.next_of_kin_full_name}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">
                  {client.purchase_type === "individual"
                    ? "Relationship:"
                    : "Role / Designation:"}
                </span>{" "}
                {client.next_of_kin_relationship}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">
                  {client.purchase_type === "individual"
                    ? "Phone:"
                    : "Representative Contact Mobile:"}
                </span>{" "}
                {client.next_of_kin_mobile_number}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">
                  {client.purchase_type === "individual"
                    ? "Email:"
                    : "Representative Contact Email:"}
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
                <span className="font-medium">Price:</span>{" "}
                {formatterUtility(Number(client.land_price))}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Number of Plots:</span>{" "}
                {client.number_of_plot}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Site Location:</span>{" "}
                {client.site_location}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Plot Number:</span>{" "}
                {client.plot_number}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <span className="font-medium">Branch:</span> {client.branches}
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
                    ? format(client.declaration_date, "dd/MM/yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm md:text-base text-gray-700 font-medium mb-2">
                  Signature:
                </p>
                <img
                  src={client.signature}
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

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 md:pt-6 mt-6 md:mt-8 flex justify-end no-print">
          <button
            onClick={() => navigate("/dashboard/overview")}
            className="px-4 py-2 md:px-5 md:py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 w-full md:w-auto"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewClient;
