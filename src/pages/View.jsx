import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaDownload, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import assets from "../assets/assests";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ViewClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view client details.");
          navigate("/login");
          return;
        }

        const response = await axios.post(
          `${API_URL}/api/applications/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const application = response.data.data;
        if (!application) throw new Error("No client data found");

        const clientData = {
          id: application.id,
          personal_picture: application.personal_picture
            ? `${API_URL}/${application.personal_picture.replace(/^\//, "")}`
            : "https://via.placeholder.com/150",

          client_name: application.client_name || "",
          first_name: application.first_name || "",
          middle_name: application.middle_name || "",
          last_name: application.last_name || "",
          address: application.address || "",
          dob: application.dob ? new Date(application.dob) : null,
          nationality: application.nationality || "",
          marital_status: application.marital_status || "",
          gender: application.gender || "",
          first_name_of_spouse: application.first_name_of_spouse || "",
          middle_name_of_spouse: application.middle_name_of_spouse || "",
          last_name_of_spouse: application.last_name_of_spouse || "",
          state_of_origin: application.state_of_origin || "",
          lga: application.lga || "",
          occupation: application.occupation || "",
          country: application.country || "",
          language: application.language || "",
          email: application.email || "",
          mobile_number: application.mobile_number || "",
          telephone_number: application.telephone_number || "",
          next_of_kin_full_name: application.next_of_kin_full_name || "",
          next_of_kin_address: application.next_of_kin_address || "",
          next_of_kin_mobile_number: application.next_of_kin_mobile_number || "",
          next_of_kin_email: application.next_of_kin_email || "",
          land_price: application.land_price || "",
          number_of_plot: application.number_of_plot || "",
          site_location: application.site_location || "",
          plot_number: application.plot_number || "",
          branches: application.branches || "",
          signature: application.signature
            ? `${API_URL}/${application.signature}`
            : "https://via.placeholder.com/150",
          declaration_date: application.declaration_date
            ? new Date(application.declaration_date)
            : null,
          declaration_name: application.declaration_name || "",
          referral_name: application.referral_name || "",
          referral_number: application.referral_number || "",
          referral_date: application.referral_date
            ? new Date(application.referral_date)
            : null,
          referral_email: application.referral_email || "",
        };

        console.log("Image URL:", `${API_URL.replace(/\/$/, "")}/${application.personal_picture.replace(/^\//, "")}`);
        console.log("Full API Response:", response.data);

        // If you want just the application object
        console.log("Application Object:", response.data.data);
        console.log("Profile URL:", clientData.personal_picture);
console.log("Signature URL:", clientData.signature);


console.log("Image URL:", `${API_URL}/personal_pictures/${application.personal_picture.split('/').pop()}`);
console.log("Signature URL:", `${API_URL}/signatures/${application.signature.split('/').pop()}`);



        setClient(clientData);
      } catch (err) {
        console.error("Error fetching client:", err);
        toast.error(
          "Failed to fetch client details: " + (err.message || "Unknown error")
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
    removeAfterPrint: true,
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
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 pb-4 sm:pb-6 mb-6 sm:mb-8 no-print gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Back to Dashboard"
            >
              <FaArrowLeft className="text-gray-700 text-base sm:text-lg" />
            </button>
            <img src={assets.logo} className="w-10 h-10 sm:w-12 sm:h-12" alt="Logo" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Client Details</h1>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-3 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr transition-colors duration-200 w-full sm:w-auto"
          >
            <FaDownload className="mr-2 text-sm sm:text-base" />
            Download PDF
          </button>
        </div>

        {/* All Client Info */}
        <div ref={componentRef} className="space-y-6 sm:space-y-10 print-section">
          {/* Profile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center border-b border-gray-200 pb-4 sm:pb-6">
            <img
              src={client.personal_picture}
              alt="Client"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
            />
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{client.client_name}</h2>
              <p className="text-sm sm:text-base text-gray-600">Email: {client.email}</p>
              <p className="text-sm sm:text-base text-gray-600">Phone: {client.mobile_number}</p>
              <p className="text-sm sm:text-base text-gray-600">Nationality: {client.nationality}</p>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-secClr border-b border-gray-200  py-3 mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">First Name:</span> {client.first_name}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Middle Name:</span> {client.middle_name}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Last Name:</span> {client.last_name}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Gender:</span> {client.gender}</p>
              <p className="text-sm sm:text-base text-gray-700">
                <span className="font-medium">Date of Birth:</span>{" "}
                {client.dob ? format(client.dob, "dd/MM/yyyy") : "N/A"}
              </p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Marital Status:</span> {client.marital_status}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">State of Origin:</span> {client.state_of_origin}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">LGA:</span> {client.lga}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Occupation:</span> {client.occupation}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Language:</span> {client.language}</p>
              <p className="text-sm sm:text-base text-gray-700 sm:col-span-2"><span className="font-medium">Address:</span> {client.address}</p>
            </div>
          </div>

          {/* Spouse Info */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-secClr border-b border-gray-200  py-3 mb-6">
              Spouse Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">First Name:</span> {client.first_name_of_spouse}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Middle Name:</span> {client.middle_name_of_spouse}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Last Name:</span> {client.last_name_of_spouse}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-secClr border-b border-gray-200  py-3 mb-6">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Email:</span> {client.email}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Mobile Number:</span> {client.mobile_number}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Telephone Number:</span> {client.telephone_number}</p>
            </div>
          </div>

          {/* Next of Kin */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-secClr border-b border-gray-200  py-3 mb-6">
              Next of Kin
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Full Name:</span> {client.next_of_kin_full_name}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Address:</span> {client.next_of_kin_address}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Phone:</span> {client.next_of_kin_mobile_number}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Email:</span> {client.next_of_kin_email}</p>
            </div>
          </div>

          {/* Land Details */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-secClr border-b border-gray-200  py-3 mb-6">
              Land Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Price:</span> {client.land_price}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Number of Plots:</span> {client.number_of_plot}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Site Location:</span> {client.site_location}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Plot Number:</span> {client.plot_number}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Branch:</span> {client.branches}</p>
            </div>
          </div>

          {/* Declaration */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-secClr border-b border-gray-200  py-3 mb-6">
              Declaration
            </h3>
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Name:</span> {client.declaration_name}</p>
                <p className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">Date:</span>{" "}
                  {client.declaration_date
                    ? format(client.declaration_date, "dd/MM/yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">Signature:</p>
                <img
                  src={client.signature}
                  alt="Signature"
                  className="w-40 h-24 sm:w-56 sm:h-36 object-contain border-2 border-gray-100 rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Referral */}
          <div>
            <h3 className="text-lg md:text-2xl font-semibold text-secClr border-b border-gray-200  py-3 mb-6">
              Referral
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Name:</span> {client.referral_name}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Phone:</span> {client.referral_number}</p>
              <p className="text-sm sm:text-base text-gray-700"><span className="font-medium">Email:</span> {client.referral_email}</p>
              <p className="text-sm sm:text-base text-gray-700">
                <span className="font-medium">Date:</span>{" "}
                {client.referral_date
                  ? format(client.referral_date, "dd/MM/yyyy")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 sm:pt-6 mt-6 sm:mt-8 flex justify-end no-print">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 sm:px-5 sm:py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 w-full sm:w-auto"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewClient;