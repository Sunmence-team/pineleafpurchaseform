import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import assets from "../assets/assets";
import {
  FaArrowLeft,
  FaUser,
  FaAddressCard,
  FaCalendarAlt,
  FaFlag,
  FaVenusMars,
  FaMapMarkerAlt,
  FaLanguage,
  FaPhoneAlt,
  FaEnvelope,
  FaMap,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { BiBriefcase } from "react-icons/bi";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
  });
  const [error, setError] = useState(null);
  const [countryCodeMap, setCountryCodeMap] = useState({});
  const [formData, setFormData] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newMiddleName, setNewMiddleName] = useState("");
  const [newLastName, setNewLastName] = useState("");

  const parentClass =
    "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[50px] px-2 flex items-center bg-white";
  const inputClass = "w-full focus:outline-0 text-sm h-full indent-2";

  // Fetch countries and ISO codes on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading((prev) => ({ ...prev, countries: true }));
      setError(null);
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries",
        );
        const result = await response.json();
        if (result.error) throw new Error(result.msg);

        const countryMap = {};
        const countryList = result.data
          .map((c) => ({ name: c.country, isoCode: c.iso2 }))
          .sort((a, b) => a.name.localeCompare(b.name));

        countryList.forEach((c) => {
          countryMap[c.name] = c.isoCode;
        });

        setCountries(countryList.map((c) => c.name));
        setCountryCodeMap(countryMap);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("Failed to load countries. Please try again later.");
        toast.error("Failed to load countries.");
      } finally {
        setLoading((prev) => ({ ...prev, countries: false }));
      }
    };
    fetchCountries();
  }, []);

  // Fetch states when formData and countryOfResidence are available
  useEffect(() => {
    if (formData && formData.countryOfResidence) {
      const fetchStates = async () => {
        setLoading((prev) => ({ ...prev, states: true }));
        setError(null);
        try {
          const response = await fetch(
            "https://countriesnow.space/api/v0.1/countries/states",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ country: formData.countryOfResidence }),
            },
          );
          const result = await response.json();
          if (result.error) throw new Error(result.msg);

          const stateList = result.data?.states?.map((s) => s.name) || [];
          setStates(stateList.sort());
        } catch (err) {
          console.error("Error fetching states:", err);
          setError("Failed to load states for selected country.");
          toast.error("Failed to load states. Please select a valid country.");
          setStates([]);
        } finally {
          setLoading((prev) => ({ ...prev, states: false }));
        }
      };
      fetchStates();
    } else {
      setStates([]);
    }
  }, [formData?.countryOfResidence, formData]);

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to edit client details.");
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
        if (!application) {
          throw new Error("No client data found in response");
        }

        const isIndividual =
          (application.purchase_type || "individual") === "individual";
        const standardRelationships = isIndividual
          ? [
              "brother",
              "sister",
              "father",
              "mother",
              "husband",
              "husband",
              "wife",
              "son",
              "daughter",
            ]
          : [
              "board member / trustee",
              "board member",
              "trustee",
              "president / chairman",
              "president",
              "chairman",
              "general secretary",
              "representative",
            ];
        const isStandard = application.next_of_kin_relationship
          ? standardRelationships.includes(
              application.next_of_kin_relationship.toLowerCase(),
            )
          : true;

        const initialRelationship = application.next_of_kin_relationship
          ? isStandard
            ? application.next_of_kin_relationship
            : "others"
          : "";
        const initialRelationshipOther =
          application.next_of_kin_relationship && !isStandard
            ? application.next_of_kin_relationship
            : "";

        setFormData({
          purchase_type: application.purchase_type || "individual",
          clubName: application.club_name || "",
          clubContact: application.club_contact || "",
          clubMembers: application.club_members
            ? application.club_members.map((m) => ({
                title: m.title || "",
                firstName: m.first_name || m.firstName || "",
                middleName: m.middle_name || m.middleName || "",
                lastName: m.last_name || m.lastName || "",
              }))
            : [],
          firstName: application.first_name || "",
          middleName: application.middle_name || "",
          lastName: application.last_name || "",
          address: application.address || "",
          maritalStatus: application.marital_status || "",
          gender: application.gender || "",
          spouseTitle: application.title_of_spouse || "",
          spouseFirstName: application.first_name_of_spouse || "",
          spouseMiddleName: application.middle_name_of_spouse || "",
          spouseLastName: application.last_name_of_spouse || "",
          shouldSpouseNameShow:
            application.first_name_of_spouse || application.last_name_of_spouse
              ? true
              : false,
          stateOfOrigin: application.state_of_origin || "",
          lga: application.lga || "",
          countryOfResidence: application.country || "",
          email: application.email || "",
          mobileNumber: application.mobile_number || "",
          nextOfKinFullName: application.next_of_kin_full_name || "",
          nextOfKinRelationship: initialRelationship,
          nextOfKinRelationshipOther: initialRelationshipOther,
          nextOfKinMobileNumber: application.next_of_kin_mobile_number || "",
          nextOfKinEmail: application.next_of_kin_email || "",
          clientDeclarationLandPrice: application.land_price || "",
          clientDeclarationNumberOfPlots: application.number_of_plot || "",
          clientDeclarationSiteLocation: application.site_location || "",
          clientDeclarationPlotNumber: application.plot_number || "",
          branches: application.branches || "",
          clientDeclarationDate: application.declaration_date
            ? new Date(application.declaration_date)
            : null,
          referralFullName: application.referral_name || "",
          referralMobileNumber: application.referral_number || "",
        });

        toast.success("Client data loaded for editing!");
      } catch (err) {
        console.error("Error fetching client:", err);
        toast.error(
          "Failed to load client data: " + (err.message || "Unknown error"),
        );
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchClient();
  }, [id, navigate]);

  // Get dynamic placeholder for phone numbers
  const getMobilePlaceholder = () => {
    const country = formData?.countryOfResidence;
    if (!country || !countryCodeMap[country]) return "Enter phone number";
    const countryCode = getCountryCallingCode(countryCodeMap[country]);
    return `+${countryCode} XXXXXXXXXX`;
  };

  const validationSchema = Yup.object({
    purchase_type: Yup.string().required(),
    firstName: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) => schema.required("First name is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    middleName: Yup.string().nullable(),
    lastName: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) => schema.required("Last name is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    address: Yup.string().required("Address is required"),
    maritalStatus: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) => schema.required("Marital status is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    gender: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) => schema.required("Gender is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    shouldSpouseNameShow: Yup.boolean().nullable(),
    spouseTitle: Yup.string().when(
      ["purchase_type", "maritalStatus", "shouldSpouseNameShow"],
      ([purchase_type, maritalStatus, shouldSpouseNameShow], schema) => {
        return purchase_type === "individual" &&
          maritalStatus === "Married" &&
          shouldSpouseNameShow
          ? schema.required("Spouse title is required")
          : schema.nullable();
      },
    ),
    spouseFirstName: Yup.string().when(
      ["purchase_type", "maritalStatus", "shouldSpouseNameShow"],
      ([purchase_type, maritalStatus, shouldSpouseNameShow], schema) => {
        return purchase_type === "individual" &&
          maritalStatus === "Married" &&
          shouldSpouseNameShow
          ? schema.required("Spouse first name is required")
          : schema.nullable();
      },
    ),
    spouseMiddleName: Yup.string().when(
      ["purchase_type", "maritalStatus", "shouldSpouseNameShow"],
      ([purchase_type, maritalStatus, shouldSpouseNameShow], schema) => {
        return purchase_type === "individual" &&
          maritalStatus === "Married" &&
          shouldSpouseNameShow
          ? schema.required("Spouse middle name is required")
          : schema.nullable();
      },
    ),
    spouseLastName: Yup.string().when(
      ["purchase_type", "maritalStatus", "shouldSpouseNameShow"],
      ([purchase_type, maritalStatus, shouldSpouseNameShow], schema) => {
        return purchase_type === "individual" &&
          maritalStatus === "Married" &&
          shouldSpouseNameShow
          ? schema.required("Spouse last name is required")
          : schema.nullable();
      },
    ),
    stateOfOrigin: Yup.string().required("State of origin is required"),
    lga: Yup.string().required("Local government (LGA) is required"),
    countryOfResidence: Yup.string().required(
      "Country of residence is required",
    ),
    email: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) =>
        schema.email("Invalid email address").required("Email is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    mobileNumber: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) =>
        schema
          .required("Mobile number is required")
          .test(
            "valid-phone",
            "Must be a valid phone number for the selected country",
            function (value) {
              const { countryOfResidence } = this.parent;
              if (!countryOfResidence || !value) return false;
              const isoCode = countryCodeMap[countryOfResidence];
              if (!isoCode) return false;
              return isValidPhoneNumber(value, isoCode);
            },
          ),
      otherwise: (schema) => schema.nullable(),
    }),
    clubName: Yup.string().when("purchase_type", {
      is: (val) => val === "club" || val === "association",
      then: (schema) => schema.required("Club/Association name is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    clubContact: Yup.string().when("purchase_type", {
      is: (val) => val === "club" || val === "association",
      then: (schema) => schema.required("Club contact is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    clubMembers: Yup.array().when("purchase_type", {
      is: (val) => val === "club" || val === "association",
      then: (schema) =>
        schema
          .of(
            Yup.object().shape({
              title: Yup.string().required("Title is required"),
              firstName: Yup.string().required("First name is required"),
              lastName: Yup.string().required("Last name is required"),
            }),
          )
          .min(1, "At least one member is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    nextOfKinFullName: Yup.string().required(
      "Representative/Next of Kin name is required",
    ),
    nextOfKinRelationship: Yup.string().required(
      "Role/Relationship is required",
    ),
    nextOfKinRelationshipOther: Yup.string().when(
      ["nextOfKinRelationship"],
      ([nextOfKinRelationship], schema) => {
        return nextOfKinRelationship === "others"
          ? schema.required("Please specify role/relationship")
          : schema.nullable();
      },
    ),
    nextOfKinMobileNumber: Yup.string()
      .required("Phone number is required")
      .test(
        "valid-phone",
        "Must be a valid phone number for the selected country",
        function (value) {
          const { countryOfResidence } = this.parent;
          if (!countryOfResidence || !value) return false;
          const isoCode = countryCodeMap[countryOfResidence];
          if (!isoCode) return false;
          return isValidPhoneNumber(value, isoCode);
        },
      ),
    nextOfKinEmail: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    clientDeclarationLandPrice: Yup.string().required("Land price is required"),
    clientDeclarationNumberOfPlots: Yup.string().required(
      "Number of plots is required",
    ),
    clientDeclarationSiteLocation: Yup.string().required(
      "Site location is required",
    ),
    clientDeclarationPlotNumber: Yup.string().required(
      "Plot number is required",
    ),
    branches: Yup.string().required("Branch is required"),
    clientDeclarationDate: Yup.date()
      .required("Declaration date is required")
      .nullable()
      .typeError("Invalid date format, use DD-MM-YYYY"),
    referralFullName: Yup.string().nullable(),
    referralMobileNumber: Yup.string().when(
      "referralFullName",
      (referralFullName, schema) => {
        return referralFullName
          ? schema
              .required("Referral mobile number is required")
              .test(
                "valid-phone",
                "Must be a valid phone number for the selected country",
                function (value) {
                  const { countryOfResidence } = this.parent;
                  if (!countryOfResidence || !value) return false;
                  const isoCode = countryCodeMap[countryOfResidence];
                  if (!isoCode) return false;
                  return isValidPhoneNumber(value, isoCode);
                },
              )
          : schema.nullable();
      },
    ),
    // referralEmail: Yup.string().email('Invalid email address').nullable(),
    // referralDate: Yup.date().when('referralFullName', (referralFullName, schema) => {
    //   return referralFullName ? schema
    //     .required('Referral date is required')
    //     .nullable()
    //     .typeError('Invalid date format, use DD-MM-YYYY') : schema.nullable();
    // }),
  });

  if (!formData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8 w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-6 md:mb-8 border-b border-gray-200 pb-4 md:pb-6">
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
              className="w-8 h-8 md:w-12 md:h-12"
              alt="Pineleaf Estate Logo"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Edit Client
            </h1>
          </div>
        </div>

        {/* Form */}
        <Formik
          initialValues={formData}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const toastId = toast.loading("Updating client details...");
            try {
              const token = localStorage.getItem("token");
              if (!token) {
                toast.error("Please log in to submit the application.", {
                  id: toastId,
                });
                navigate("/login");
                return;
              }

              // Construct client_name / declaration_name depending on purchase_type
              const isIndividual =
                (values.purchase_type || "individual") === "individual";
              const clientNameParts = isIndividual
                ? [values.firstName, values.middleName, values.lastName]
                    .filter((part) => part)
                    .join(" ")
                    .trim()
                : values.clubName || "";

              const formDataToSend = new FormData();
              formDataToSend.append(
                "purchase_type",
                values.purchase_type || "individual",
              );
              formDataToSend.append("client_name", clientNameParts);

              if (isIndividual) {
                formDataToSend.append("first_name", values.firstName || "");
                formDataToSend.append("middle_name", values.middleName || "");
                formDataToSend.append("last_name", values.lastName || "");
                formDataToSend.append(
                  "marital_status",
                  values.maritalStatus || "",
                );
                formDataToSend.append("gender", values.gender || "");
                formDataToSend.append(
                  "should_spouse_name_show",
                  values.shouldSpouseNameShow ? "1" : "0",
                );
                if (
                  values.maritalStatus === "Married" &&
                  values.shouldSpouseNameShow
                ) {
                  formDataToSend.append(
                    "title_of_spouse",
                    values.spouseTitle || "",
                  );
                  formDataToSend.append(
                    "first_name_of_spouse",
                    values.spouseFirstName || "",
                  );
                  formDataToSend.append(
                    "middle_name_of_spouse",
                    values.spouseMiddleName || "",
                  );
                  formDataToSend.append(
                    "last_name_of_spouse",
                    values.spouseLastName || "",
                  );
                } else {
                  formDataToSend.append("title_of_spouse", "");
                  formDataToSend.append("first_name_of_spouse", "");
                  formDataToSend.append("middle_name_of_spouse", "");
                  formDataToSend.append("last_name_of_spouse", "");
                }
                formDataToSend.append("email", values.email || "");
                formDataToSend.append(
                  "mobile_number",
                  values.mobileNumber || "",
                );
              } else {
                formDataToSend.append("club_name", values.clubName || "");
                formDataToSend.append("club_contact", values.clubContact || "");

                // Append club members index-based
                (values.clubMembers || []).forEach((member, index) => {
                  formDataToSend.append(
                    `club_members[${index}][title]`,
                    member.title,
                  );
                  formDataToSend.append(
                    `club_members[${index}][first_name]`,
                    member.firstName,
                  );
                  formDataToSend.append(
                    `club_members[${index}][middle_name]`,
                    member.middleName || "",
                  );
                  formDataToSend.append(
                    `club_members[${index}][last_name]`,
                    member.lastName,
                  );
                });

                // Clear/nullify individual fields
                formDataToSend.append("first_name", "");
                formDataToSend.append("middle_name", "");
                formDataToSend.append("last_name", "");
                formDataToSend.append("marital_status", "");
                formDataToSend.append("gender", "");
                formDataToSend.append("title_of_spouse", "");
                formDataToSend.append("first_name_of_spouse", "");
                formDataToSend.append("middle_name_of_spouse", "");
                formDataToSend.append("last_name_of_spouse", "");
                formDataToSend.append("email", "");
                formDataToSend.append("mobile_number", "");
              }

              formDataToSend.append("address", values.address || "");
              formDataToSend.append("country", values.countryOfResidence || "");
              formDataToSend.append(
                "state_of_origin",
                values.stateOfOrigin || "",
              );
              formDataToSend.append("lga", values.lga || "");

              const finalRelationship =
                values.nextOfKinRelationship === "others"
                  ? values.nextOfKinRelationshipOther
                  : values.nextOfKinRelationship;
              formDataToSend.append(
                "next_of_kin_full_name",
                values.nextOfKinFullName || "",
              );
              formDataToSend.append(
                "next_of_kin_relationship",
                finalRelationship || "",
              );
              formDataToSend.append(
                "next_of_kin_mobile_number",
                values.nextOfKinMobileNumber || "",
              );
              formDataToSend.append(
                "next_of_kin_email",
                values.nextOfKinEmail || "",
              );

              formDataToSend.append(
                "land_price",
                values.clientDeclarationLandPrice || "",
              );
              formDataToSend.append(
                "number_of_plot",
                values.clientDeclarationNumberOfPlots || "",
              );
              formDataToSend.append(
                "site_location",
                values.clientDeclarationSiteLocation || "",
              );
              formDataToSend.append(
                "plot_number",
                values.clientDeclarationPlotNumber || "",
              );
              formDataToSend.append("branches", values.branches || "");
              formDataToSend.append(
                "declaration_date",
                values.clientDeclarationDate
                  ? format(new Date(values.clientDeclarationDate), "yyyy-MM-dd")
                  : "",
              );
              formDataToSend.append(
                "declaration_name",
                isIndividual
                  ? clientNameParts || ""
                  : values.nextOfKinFullName || "",
              );
              formDataToSend.append(
                "referral_name",
                values.referralFullName || "",
              );
              formDataToSend.append(
                "referral_number",
                values.referralMobileNumber || "",
              );

              console.log(
                "FormData being sent to POST /api/update_applications:",
                id,
              );
              for (let [key, value] of formDataToSend.entries()) {
                console.log(
                  `${key}:`,
                  value instanceof File ? value.name : value,
                );
              }

              const response = await api.post(
                `${API_URL}/api/update_applications/${id}`,
                formDataToSend,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              console.log(
                "API Response from POST /api/update_applications:",
                response.data,
              );

              if (response.status === 200 || response.status === 201) {
                toast.success("Client details updated successfully!", {
                  id: toastId,
                });
                navigate("/dashboard/overview");
              }
            } catch (err) {
              console.error("Error updating client:", err);
              if (axios.isAxiosError(err)) {
                if (err.code === "ERR_NETWORK") {
                  toast.error(
                    "Network error: Unable to connect to the server.",
                    { id: toastId },
                  );
                } else if (err.response?.status === 400) {
                  toast.error(
                    err.response.data.message || "Invalid data provided.",
                    { id: toastId },
                  );
                } else if (err.response?.status === 401) {
                  toast.error("Unauthorized. Please log in again.", {
                    id: toastId,
                  });
                  localStorage.removeItem("token");
                  navigate("/login");
                } else if (err.response?.status === 422) {
                  const errors = err.response.data.errors || {};
                  const errorMessages = Object.values(errors).flat().join("; ");
                  toast.error(errorMessages || "Validation error.", {
                    id: toastId,
                  });
                } else {
                  toast.error(
                    err.response?.data?.message || "Unexpected error occurred.",
                    { id: toastId },
                  );
                }
              } else {
                toast.error("Unexpected error occurred. Please try again.", {
                  id: toastId,
                });
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form className="space-y-6 md:space-y-10">
              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}

              {/* Personal Info / Club Info dynamic rendering */}
              {values.purchase_type === "individual" ? (
                <div className="border-b border-gray-200 pb-4 md:pb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        First Name
                      </label>
                      <div className={parentClass}>
                        <FaUser className="text-primary" />
                        <Field
                          type="text"
                          name="firstName"
                          className={`${inputClass} ${errors.firstName && touched.firstName ? "border-red-500" : ""}`}
                        />
                        <ErrorMessage
                          name="firstName"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        Middle Name
                      </label>
                      <div className={parentClass}>
                        <FaUser className="text-primary" />
                        <Field
                          type="text"
                          name="middleName"
                          className={`${inputClass} ${errors.middleName && touched.middleName ? "border-red-500" : ""}`}
                        />
                        <ErrorMessage
                          name="middleName"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        Last Name
                      </label>
                      <div className={parentClass}>
                        <FaUser className="text-primary" />
                        <Field
                          type="text"
                          name="lastName"
                          className={`${inputClass} ${errors.lastName && touched.lastName ? "border-red-500" : ""}`}
                        />
                        <ErrorMessage
                          name="lastName"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        Gender
                      </label>
                      <div className={parentClass}>
                        <FaVenusMars className="text-primary" />
                        <Field
                          as="select"
                          name="gender"
                          className={`${inputClass} ${errors.gender && touched.gender ? "border-red-500" : ""}`}
                        >
                          {[
                            {
                              value: "",
                              label: "Select Gender",
                              disabled: true,
                              key: "gender-placeholder",
                            },
                            {
                              value: "Male",
                              label: "Male",
                              key: "gender-male",
                            },
                            {
                              value: "Female",
                              label: "Female",
                              key: "gender-female",
                            },
                            {
                              value: "Other",
                              label: "Other",
                              key: "gender-other",
                            },
                          ].map(({ key, value, label, disabled }) => (
                            <option key={key} value={value} disabled={disabled}>
                              {label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="gender"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        Marital Status
                      </label>
                      <div className={parentClass}>
                        <FaVenusMars className="text-primary" />
                        <Field
                          as="select"
                          name="maritalStatus"
                          className={`${inputClass} ${errors.maritalStatus && touched.maritalStatus ? "border-red-500" : ""}`}
                        >
                          {[
                            {
                              value: "",
                              label: "Select Marital Status",
                              disabled: true,
                              key: "marital-status-placeholder",
                            },
                            {
                              value: "Single",
                              label: "Single",
                              key: "marital-status-single",
                            },
                            {
                              value: "Married",
                              label: "Married",
                              key: "marital-status-married",
                            },
                            {
                              value: "Divorced",
                              label: "Divorced",
                              key: "marital-status-divorced",
                            },
                            {
                              value: "Widowed",
                              label: "Widowed",
                              key: "marital-status-widowed",
                            },
                          ].map(({ key, value, label, disabled }) => (
                            <option key={key} value={value} disabled={disabled}>
                              {label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="maritalStatus"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-b border-gray-200 pb-4 md:pb-6 space-y-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                    {values.purchase_type === "club"
                      ? "Club Information"
                      : "Association Information"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        {values.purchase_type === "club"
                          ? "Club Name"
                          : "Association Name"}
                      </label>
                      <div className={parentClass}>
                        <BiBriefcase className="text-primary" />
                        <Field
                          type="text"
                          name="clubName"
                          placeholder={`Enter official ${values.purchase_type} name`}
                          className={`${inputClass} ${errors.clubName && touched.clubName ? "border-red-500" : ""}`}
                        />
                        <ErrorMessage
                          name="clubName"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        Official Contact Number
                      </label>
                      <div className={parentClass}>
                        <FaPhoneAlt classNaame="text-primary" />
                        <Field
                          type="text"
                          name="clubContact"
                          placeholder="e.g. +2348033333333"
                          className={`${inputClass} ${errors.clubContact && touched.clubContact ? "border-red-500" : ""}`}
                        />
                        <ErrorMessage
                          name="clubContact"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Members Manager */}
                  <div className="space-y-4">
                    <div className="">
                      <h4 className="font-bold text-primary text-lg">
                        Registered Members
                      </h4>
                      <p className="text-xs text-gray-500">
                        Please add all individual members belonging to this{" "}
                        {values.purchase_type}. (At least 1 is required)
                      </p>
                    </div>

                    <FieldArray name="clubMembers">
                      {({ push, remove }) => (
                        <div className="space-y-4">
                          {/* Add Member form */}
                          <div className="bg-white p-4 rounded-xl border border-primary/10 space-y-3">
                            <div className="flex justify-between md:items-center gap-5">
                              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                Add New Member
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    !newTitle ||
                                    !newFirstName ||
                                    !newLastName
                                  ) {
                                    toast.error(
                                      "Please fill Title, First Name, and Last Name.",
                                    );
                                    return;
                                  }
                                  push({
                                    title: newTitle,
                                    firstName: newFirstName,
                                    middleName: newMiddleName,
                                    lastName: newLastName,
                                  });
                                  setNewTitle("");
                                  setNewFirstName("");
                                  setNewMiddleName("");
                                  setNewLastName("");
                                  toast.success("Member added!");
                                }}
                                className="inline-flex justify-center items-center gap-2 px-4 h-10 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 shadow"
                              >
                                <FaPlus /> <span>Add Member</span>
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <select
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-md h-10 indent-3 focus:outline-none"
                              >
                                <option value="">Title</option>
                                {["Mr", "Mrs", "Miss"].map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                placeholder="First Name *"
                                value={newFirstName}
                                onChange={(e) =>
                                  setNewFirstName(e.target.value)
                                }
                                className="w-full text-sm border border-gray-300 rounded-md h-10 indent-3 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Middle Name (Opt)"
                                value={newMiddleName}
                                onChange={(e) =>
                                  setNewMiddleName(e.target.value)
                                }
                                className="w-full text-sm border border-gray-300 rounded-md h-10 indent-3 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Last Name *"
                                value={newLastName}
                                onChange={(e) => setNewLastName(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-md h-10 indent-3 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Members table */}
                          {values.clubMembers &&
                          values.clubMembers.length > 0 ? (
                            <div className="overflow-x-auto bg-white rounded-xl border border-primary/10">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-700">
                                  <tr>
                                    <th className="py-2.5 px-4">#</th>
                                    <th className="py-2.5 px-4">Title</th>
                                    <th className="py-2.5 px-4">Full Name</th>
                                    <th className="py-2.5 px-4 text-center font-medium">
                                      Remove
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-800">
                                  {values.clubMembers.map((member, index) => (
                                    <tr
                                      key={index}
                                      className="hover:bg-gray-50/50"
                                    >
                                      <td className="py-2.5 px-4 text-gray-500 font-medium">
                                        {index + 1}
                                      </td>
                                      <td className="py-2.5 px-4 font-semibold text-primary">
                                        {member.title}
                                      </td>
                                      <td className="py-2.5 px-4">
                                        {member.firstName}{" "}
                                        {member.middleName
                                          ? member.middleName + " "
                                          : ""}
                                        {member.lastName}
                                      </td>
                                      <td className="py-2.5 px-4 text-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            remove(index);
                                            toast.info("Removed member");
                                          }}
                                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors inline-flex justify-center items-center"
                                        >
                                          <FaTrash className="text-xs" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                              <p className="text-sm text-red-500 font-medium">
                                No members added yet. Please use the form above
                                to add members.
                              </p>
                            </div>
                          )}
                          <ErrorMessage
                            name="clubMembers"
                            component="div"
                            className="text-xs text-red-500 font-semibold"
                          />
                        </div>
                      )}
                    </FieldArray>
                  </div>
                </div>
              )}

              {/* Location & Address Information */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                  Location & Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Country of Residence
                    </label>
                    <div className={parentClass}>
                      <FaMap className="text-primary" />
                      <Field
                        as="select"
                        name="countryOfResidence"
                        className={`${inputClass} ${errors.countryOfResidence && touched.countryOfResidence ? "border-red-500" : ""}`}
                        onChange={(e) => {
                          setFieldValue("countryOfResidence", e.target.value);
                          setFieldValue("stateOfOrigin", "");
                          setFieldValue("lga", "");
                          setFieldValue("mobileNumber", "");
                          setFieldValue("nextOfKinMobileNumber", "");
                          setFieldValue("referralMobileNumber", "");
                          setFormData((prev) => ({
                            ...prev,
                            countryOfResidence: e.target.value,
                            stateOfOrigin: "",
                            lga: "",
                            mobileNumber: "",
                            nextOfKinMobileNumber: "",
                            referralMobileNumber: "",
                          }));
                        }}
                      >
                        {[
                          {
                            value: "",
                            label: loading.countries
                              ? "Loading countries..."
                              : "Select Country",
                            disabled: true,
                            key: "country-placeholder",
                          },
                          ...countries.map((country) => ({
                            value: country,
                            label: country,
                            key: country,
                          })),
                        ].map(({ key, value, label, disabled }) => (
                          <option key={key} value={value} disabled={disabled}>
                            {label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="countryOfResidence"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      State of Origin
                    </label>
                    <div className={parentClass}>
                      <FaMapMarkerAlt claame="-3 text-primary" />
                      <Field
                        as="select"
                        name="stateOfOrigin"
                        className={`${inputClass} ${errors.stateOfOrigin && touched.stateOfOrigin ? "border-red-500" : ""}`}
                        onChange={(e) => {
                          setFieldValue("stateOfOrigin", e.target.value);
                          setFieldValue("lga", "");
                          setFormData((prev) => ({
                            ...prev,
                            stateOfOrigin: e.target.value,
                            lga: "",
                          }));
                        }}
                        disabled={!values.countryOfResidence || loading.states}
                      >
                        {[
                          {
                            value: "",
                            label: loading.states
                              ? "Loading states..."
                              : !values.countryOfResidence
                                ? "Select country first"
                                : states.length === 0
                                  ? "No states available"
                                  : "Select State",
                            disabled: true,
                            key: "state-placeholder",
                          },
                          ...states.map((state) => ({
                            value: state,
                            label: state,
                            key: state,
                          })),
                        ].map(({ key, value, label, disabled }) => (
                          <option key={key} value={value} disabled={disabled}>
                            {label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="stateOfOrigin"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 relative">
                    <label className="block text-base font-medium text-gray-700">
                      Local Government (LGA)
                    </label>
                    <div className={parentClass}>
                      <FaMapMarkerAlt claame="-3 text-primary" />
                      <Field
                        type="text"
                        name="lga"
                        className={`${inputClass} ${errors.lga && touched.lga ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="lga"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 relative">
                    <label className="block text-base font-medium text-gray-700">
                      Address
                    </label>
                    <div className={parentClass + " items-start! h-48! p-2!"}>
                      <FaAddressCard clasame="text-primary" />
                      <Field
                        as="textarea"
                        name="address"
                        className={`${inputClass + " resize-none"} ${errors.address && touched.address ? "border-red-500" : ""}`}
                        placeholder={
                          values.purchase_type === "individual"
                            ? "Enter your residential address"
                            : "Enter club/association registered address"
                        }
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Spouse Information */}
              {values.purchase_type === "individual" &&
                values.maritalStatus === "Married" && (
                  <div className="border-b border-gray-200 pb-4 md:pb-6 space-y-4">
                    <div className="flex items-center">
                      <Field
                        type="checkbox"
                        name="shouldSpouseNameShow"
                        id="shouldSpouseNameShow"
                        className="form-checkbox h-4 w-4 text-primary"
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFieldValue("shouldSpouseNameShow", checked);
                          if (!checked) {
                            setFieldValue("spouseTitle", "");
                            setFieldValue("spouseFirstName", "");
                            setFieldValue("spouseMiddleName", "");
                            setFieldValue("spouseLastName", "");
                          }
                        }}
                      />
                      <label
                        htmlFor="shouldSpouseNameShow"
                        className="ml-2 text-sm font-medium text-black/70"
                      >
                        Should spouse name be captured on the form?
                      </label>
                    </div>

                    {values.shouldSpouseNameShow && (
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                          Spouse Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                          <div className="relative">
                            <label className="block text-base font-medium text-gray-700">
                              Title
                            </label>
                            <div className={parentClass}>
                              <FaUser className="text-primary" />
                              <Field
                                as="select"
                                name="spouseTitle"
                                className={`${inputClass} ${errors.spouseTitle && touched.spouseTitle ? "border-red-500" : ""}`}
                              >
                                {[
                                  {
                                    value: "",
                                    label: "Select Title",
                                    disabled: true,
                                    key: "spouse-title-placeholder",
                                  },
                                  {
                                    value: "Mr",
                                    label: "Mr",
                                    key: "spouse-title-mr",
                                  },
                                  {
                                    value: "Mrs",
                                    label: "Mrs",
                                    key: "spouse-title-mrs",
                                  },
                                  {
                                    value: "Miss",
                                    label: "Miss",
                                    key: "spouse-title-miss",
                                  },
                                ].map(({ key, value, label, disabled }) => (
                                  <option
                                    key={key}
                                    value={value}
                                    disabled={disabled}
                                  >
                                    {label}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name="spouseTitle"
                                component="div"
                                className="text-xs text-red-500 mt-1"
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="block text-base font-medium text-gray-700">
                              First Name
                            </label>
                            <div className={parentClass}>
                              <FaUser className="text-primary" />
                              <Field
                                type="text"
                                name="spouseFirstName"
                                className={`${inputClass} ${errors.spouseFirstName && touched.spouseFirstName ? "border-red-500" : ""}`}
                              />
                              <ErrorMessage
                                name="spouseFirstName"
                                component="div"
                                className="text-xs text-red-500 mt-1"
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="block text-base font-medium text-gray-700">
                              Middle Name
                            </label>
                            <div className={parentClass}>
                              <FaUser className="text-primary" />
                              <Field
                                type="text"
                                name="spouseMiddleName"
                                className={`${inputClass} ${errors.spouseMiddleName && touched.spouseMiddleName ? "border-red-500" : ""}`}
                              />
                              <ErrorMessage
                                name="spouseMiddleName"
                                component="div"
                                className="text-xs text-red-500 mt-1"
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="block text-base font-medium text-gray-700">
                              Last Name
                            </label>
                            <div className={parentClass}>
                              <FaUser className="text-primary" />
                              <Field
                                type="text"
                                name="spouseLastName"
                                className={`${inputClass} ${errors.spouseLastName && touched.spouseLastName ? "border-red-500" : ""}`}
                              />
                              <ErrorMessage
                                name="spouseLastName"
                                component="div"
                                className="text-xs text-red-500 mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Contact Information */}
              {values.purchase_type === "individual" && (
                <div className="border-b border-gray-200 pb-4 md:pb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        Email
                      </label>
                      <div className={parentClass}>
                        <FaEnvelope classNaame="ext-primary" />
                        <Field
                          type="email"
                          name="email"
                          className={`${inputClass} ${errors.email && touched.email ? "border-red-500" : ""}`}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        Mobile Number
                      </label>
                      <div className={parentClass}>
                        <FaPhoneAlt classNaame="ext-primary" />
                        <Field
                          type="tel"
                          name="mobileNumber"
                          className={`${inputClass} ${errors.mobileNumber && touched.mobileNumber ? "border-red-500" : ""}`}
                          placeholder={getMobilePlaceholder()}
                        />
                        <ErrorMessage
                          name="mobileNumber"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Next of Kin / Representative Details */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                  {values.purchase_type === "individual"
                    ? "Next of Kin"
                    : "Representative/Trustee Details"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      {values.purchase_type === "individual"
                        ? "Full Name"
                        : "Representative / Trustee Full Name"}
                    </label>
                    <div className={parentClass}>
                      <FaUser className="text-primary" />
                      <Field
                        type="text"
                        name="nextOfKinFullName"
                        placeholder={
                          values.purchase_type === "individual"
                            ? "Enter Full Name"
                            : "e.g. Michael Smith"
                        }
                        className={`${inputClass} ${errors.nextOfKinFullName && touched.nextOfKinFullName ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="nextOfKinFullName"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      {values.purchase_type === "individual"
                        ? "Relationship"
                        : "Role / Designation"}
                    </label>
                    <div className={parentClass}>
                      <FaUser className="text-primary" />
                      <Field
                        as="select"
                        name="nextOfKinRelationship"
                        className={`${inputClass} ${errors.nextOfKinRelationship && touched.nextOfKinRelationship ? "border-red-500" : ""}`}
                      >
                        <option value="" disabled>
                          {values.purchase_type === "individual"
                            ? "Select Relationship"
                            : "Select Role / Designation"}
                        </option>
                        {values.purchase_type === "individual" ? (
                          <>
                            <option value="brother">Brother</option>
                            <option value="sister">Sister</option>
                            <option value="father">Father</option>
                            <option value="mother">Mother</option>
                            <option value="hussband">Husband</option>
                            <option value="wife">Wife</option>
                            <option value="son">Son</option>
                            <option value="daughter">Daughter</option>
                          </>
                        ) : (
                          <>
                            <option value="Board Member / Trustee">
                              Board Member / Trustee
                            </option>
                            <option value="President / Chairman">
                              President / Chairman
                            </option>
                            <option value="General Secretary">
                              General Secretary
                            </option>
                            <option value="Representative">
                              Representative
                            </option>
                          </>
                        )}
                        <option value="others">Others</option>
                      </Field>
                      <ErrorMessage
                        name="nextOfKinRelationship"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>

                  {values.nextOfKinRelationship === "others" ? (
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">
                        {values.purchase_type === "individual"
                          ? "Specify Relationship"
                          : "Specify Role / Designation"}
                      </label>
                      <div className={parentClass}>
                        <FaUser className="text-primary" />
                        <Field
                          type="text"
                          name="nextOfKinRelationshipOther"
                          placeholder={
                            values.purchase_type === "individual"
                              ? "Enter relationship"
                              : "Enter designation"
                          }
                          className={`${inputClass} ${errors.nextOfKinRelationshipOther && touched.nextOfKinRelationshipOther ? "border-red-500" : ""}`}
                        />
                        <ErrorMessage
                          name="nextOfKinRelationshipOther"
                          component="div"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block"></div>
                  )}

                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      {values.purchase_type === "individual"
                        ? "Phone"
                        : "Representative Contact Mobile"}
                    </label>
                    <div className={parentClass}>
                      <FaPhoneAlt classNaame="ext-primary" />
                      <Field
                        type="tel"
                        name="nextOfKinMobileNumber"
                        className={`${inputClass} ${errors.nextOfKinMobileNumber && touched.nextOfKinMobileNumber ? "border-red-500" : ""}`}
                        placeholder={getMobilePlaceholder()}
                      />
                      <ErrorMessage
                        name="nextOfKinMobileNumber"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      {values.purchase_type === "individual"
                        ? "Email"
                        : "Representative Contact Email"}
                    </label>
                    <div className={parentClass}>
                      <FaEnvelope classNaame="ext-primary" />
                      <Field
                        type="email"
                        name="nextOfKinEmail"
                        placeholder="e.g. representative@email.com"
                        className={`${inputClass} ${errors.nextOfKinEmail && touched.nextOfKinEmail ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="nextOfKinEmail"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Declaration */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                  Client Declaration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Land Price
                    </label>
                    <div className={parentClass}>
                      <FaUser className="text-primary" />
                      <Field
                        type="text"
                        name="clientDeclarationLandPrice"
                        className={`${inputClass} ${errors.clientDeclarationLandPrice && touched.clientDeclarationLandPrice ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="clientDeclarationLandPrice"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Number of Plots
                    </label>
                    <div className={parentClass}>
                      <FaUser className="text-primary" />
                      <Field
                        type="text"
                        name="clientDeclarationNumberOfPlots"
                        className={`${inputClass} ${errors.clientDeclarationNumberOfPlots && touched.clientDeclarationNumberOfPlots ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="clientDeclarationNumberOfPlots"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Site Location
                    </label>
                    <div className={parentClass}>
                      <FaMapMarkerAlt claame="-3 text-primary" />
                      <Field
                        type="text"
                        name="clientDeclarationSiteLocation"
                        className={`${inputClass} ${errors.clientDeclarationSiteLocation && touched.clientDeclarationSiteLocation ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="clientDeclarationSiteLocation"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Plot Number
                    </label>
                    <div className={parentClass}>
                      <FaMapMarkerAlt claame="-3 text-primary" />
                      <Field
                        type="text"
                        name="clientDeclarationPlotNumber"
                        className={`${inputClass} ${errors.clientDeclarationPlotNumber && touched.clientDeclarationPlotNumber ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="clientDeclarationPlotNumber"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Branch
                    </label>
                    <div className={parentClass}>
                      <FaMapMarkerAlt claame="-3 text-primary" />
                      <Field
                        type="text"
                        name="branches"
                        className={`${inputClass} ${errors.branches && touched.branches ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="branches"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Declaration Date
                    </label>
                    <div className={parentClass}>
                      <FaCalendarAlt clasame="3 text-primary z-10" />
                      <DatePicker
                        selected={values.clientDeclarationDate}
                        onChange={(date) =>
                          setFieldValue("clientDeclarationDate", date)
                        }
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className={`${inputClass} ${errors.clientDeclarationDate && touched.clientDeclarationDate ? "border-red-500" : ""}`}
                        showYearDropdown
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                      />
                      <ErrorMessage
                        name="clientDeclarationDate"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                  Referral Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className={parentClass}>
                      <FaUser className="text-primary" />
                      <Field
                        type="text"
                        name="referralFullName"
                        className={`${inputClass} ${errors.referralFullName && touched.referralFullName ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="referralFullName"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">
                      Phone
                    </label>
                    <div className={parentClass}>
                      <FaPhoneAlt classNaame="ext-primary" />
                      <Field
                        type="tel"
                        name="referralMobileNumber"
                        className={`${inputClass} ${errors.referralMobileNumber && touched.referralMobileNumber ? "border-red-500" : ""}`}
                        placeholder={getMobilePlaceholder()}
                      />
                      <ErrorMessage
                        name="referralMobileNumber"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-3 rounded-md hover:bg-secClrHover transition-colors duration-200"
                  disabled={loading.countries || loading.states}
                >
                  Update Client
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditClient;
