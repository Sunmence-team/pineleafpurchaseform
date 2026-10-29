import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { isValidPhoneNumber } from "libphonenumber-js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { api } from "../../helpers/api";
import assets from "../../assets/assets";
import SearchableInput from "../../components/ui/SearchableInput";
import { useCountryStates } from "../../hooks/useCountryStates";
import { useEntryDetails } from "../../hooks/useClientEntries";
import {
  FaArrowLeft,
  FaUser,
  FaAddressCard,
  FaCalendarAlt,
  FaVenusMars,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMap,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { BiBriefcase } from "react-icons/bi";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface ClubMemberForm {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

interface FormValues {
  purchase_type: string;
  clubName: string;
  clubContact: string;
  clubMembers: ClubMemberForm[];
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  maritalStatus: string;
  gender: string;
  spouseTitle: string;
  spouseFirstName: string;
  spouseMiddleName: string;
  spouseLastName: string;
  shouldSpouseNameShow: boolean;
  stateOfOrigin: string;
  lga: string;
  countryOfResidence: string;
  email: string;
  mobileNumber: string;
  nextOfKinFullName: string;
  nextOfKinRelationship: string;
  nextOfKinRelationshipOther: string;
  nextOfKinMobileNumber: string;
  nextOfKinEmail: string;
  clientDeclarationLandPrice: string;
  clientDeclarationNumberOfPlots: string;
  clientDeclarationSiteLocation: string;
  clientDeclarationPlotNumber: string;
  branches: string;
  clientDeclarationDate: Date | null;
  referralFullName: string;
  referralMobileNumber: string;
}

const EditClient: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: responseData,
    isLoading: isFetchingEntry,
    error: fetchError,
  } = useEntryDetails(id);
  const application = responseData?.data;

  const [newTitle, setNewTitle] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newMiddleName, setNewMiddleName] = useState("");
  const [newLastName, setNewLastName] = useState("");

  const parentClass =
    "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 h-[50px] px-2 flex items-center bg-white";
  const inputClass = "w-full focus:outline-0 text-sm h-full indent-2";

  const initialValues: FormValues = useMemo(() => {
    if (!application) {
      return {
        purchase_type: "individual",
        clubName: "",
        clubContact: "",
        clubMembers: [],
        firstName: "",
        middleName: "",
        lastName: "",
        address: "",
        maritalStatus: "",
        gender: "",
        spouseTitle: "",
        spouseFirstName: "",
        spouseMiddleName: "",
        spouseLastName: "",
        shouldSpouseNameShow: false,
        stateOfOrigin: "",
        lga: "",
        countryOfResidence: "",
        email: "",
        mobileNumber: "",
        nextOfKinFullName: "",
        nextOfKinRelationship: "",
        nextOfKinRelationshipOther: "",
        nextOfKinMobileNumber: "",
        nextOfKinEmail: "",
        clientDeclarationLandPrice: "",
        clientDeclarationNumberOfPlots: "",
        clientDeclarationSiteLocation: "",
        clientDeclarationPlotNumber: "",
        branches: "",
        clientDeclarationDate: null,
        referralFullName: "",
        referralMobileNumber: "",
      };
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

    return {
      purchase_type: application.purchase_type || "individual",
      clubName: application.club_name || "",
      clubContact: application.club_contact || "",
      clubMembers: application.club_members
        ? application.club_members.map((m: any) => ({
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
      shouldSpouseNameShow: Boolean(
        application.first_name_of_spouse || application.last_name_of_spouse,
      ),
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
      clientDeclarationLandPrice: application.land_price
        ? String(application.land_price)
        : "",
      clientDeclarationNumberOfPlots: application.number_of_plot
        ? String(application.number_of_plot)
        : "",
      clientDeclarationSiteLocation: application.site_location || "",
      clientDeclarationPlotNumber: application.plot_number
        ? String(application.plot_number)
        : "",
      branches:
        application.branches ||
        (typeof application.branch === "object"
          ? application.branch?.name
          : (application.branch as string)) ||
        "",
      clientDeclarationDate: application.declaration_date
        ? new Date(application.declaration_date)
        : null,
      referralFullName: application.referral_name || "",
      referralMobileNumber: application.referral_number || "",
    };
  }, [application]);

  const {
    countries,
    states,
    countryCodeMap,
    loading,
    getMobilePlaceholder: getPlaceholder,
    fetchCountries,
    fetchStates,
  } = useCountryStates(initialValues.countryOfResidence);

  const validationSchema = useMemo(() => {
    return Yup.object({
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
    });
  }, [countryCodeMap]);

  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
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
          formDataToSend.append("marital_status", values.maritalStatus || "");
          formDataToSend.append("gender", values.gender || "");
          formDataToSend.append(
            "should_spouse_name_show",
            values.shouldSpouseNameShow ? "1" : "0",
          );
          if (
            values.maritalStatus === "Married" &&
            values.shouldSpouseNameShow
          ) {
            formDataToSend.append("title_of_spouse", values.spouseTitle || "");
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
          formDataToSend.append("mobile_number", values.mobileNumber || "");
        } else {
          formDataToSend.append("club_name", values.clubName || "");
          formDataToSend.append("club_contact", values.clubContact || "");

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
        formDataToSend.append("state_of_origin", values.stateOfOrigin || "");
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
        formDataToSend.append("next_of_kin_email", values.nextOfKinEmail || "");

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

        const response = await api.post(
          `${API_URL}/update_applications/${id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 200 || response.status === 201) {
          toast.success("Client details updated successfully!", {
            id: toastId,
          });
          navigate("/dashboard/overview");
        }
      } catch (err: any) {
        console.error("Error updating client:", err);
        if (axios.isAxiosError(err)) {
          if (err.code === "ERR_NETWORK") {
            toast.error("Network error: Unable to connect to the server.", {
              id: toastId,
            });
          } else if (err.response?.status === 400) {
            toast.error(err.response.data.message || "Invalid data provided.", {
              id: toastId,
            });
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
    },
  });

  const getMobilePlaceholder = () => {
    return getPlaceholder(formik.values.countryOfResidence);
  };

  if (isFetchingEntry) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (fetchError || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8 items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow text-center max-w-md">
          <p className="text-red-500 font-medium mb-4">
            Failed to load client details:{" "}
            {(fetchError as any)?.message || "No client data found"}
          </p>
          <button
            onClick={() => navigate("/dashboard/overview")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secClrHover"
          >
            Back to Dashboard
          </button>
        </div>
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
        <form onSubmit={formik.handleSubmit} className="space-y-6 md:space-y-10">
          {/* Personal Info / Club Info dynamic rendering */}
          {formik.values.purchase_type === "individual" ? (
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
                    <input
                      type="text"
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`${inputClass} ${
                        formik.errors.firstName && formik.touched.firstName
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.firstName && formik.errors.firstName && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.firstName}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-base font-medium text-gray-700">
                    Middle Name
                  </label>
                  <div className={parentClass}>
                    <FaUser className="text-primary" />
                    <input
                      type="text"
                      name="middleName"
                      value={formik.values.middleName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`${inputClass} ${
                        formik.errors.middleName && formik.touched.middleName
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.middleName && formik.errors.middleName && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.middleName}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-base font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className={parentClass}>
                    <FaUser className="text-primary" />
                    <input
                      type="text"
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`${inputClass} ${
                        formik.errors.lastName && formik.touched.lastName
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.lastName && formik.errors.lastName && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.lastName}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-base font-medium text-gray-700">
                    Gender
                  </label>
                  <div className={parentClass}>
                    <FaVenusMars className="text-primary" />
                    <select
                      name="gender"
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`${inputClass} ${
                        formik.errors.gender && formik.touched.gender
                          ? "border-red-500"
                          : ""
                      }`}
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
                    </select>
                  </div>
                  {formik.touched.gender && formik.errors.gender && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.gender}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-base font-medium text-gray-700">
                    Marital Status
                  </label>
                  <div className={parentClass}>
                    <FaVenusMars className="text-primary" />
                    <select
                      name="maritalStatus"
                      value={formik.values.maritalStatus}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`${inputClass} ${
                        formik.errors.maritalStatus &&
                        formik.touched.maritalStatus
                          ? "border-red-500"
                          : ""
                      }`}
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
                    </select>
                  </div>
                  {formik.touched.maritalStatus && formik.errors.maritalStatus && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.maritalStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b border-gray-200 pb-4 md:pb-6 space-y-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                {formik.values.purchase_type === "club"
                  ? "Club Information"
                  : "Association Information"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="relative">
                  <label className="block text-base font-medium text-gray-700">
                    {formik.values.purchase_type === "club"
                      ? "Club Name"
                      : "Association Name"}
                  </label>
                  <div className={parentClass}>
                    <BiBriefcase className="text-primary" />
                    <input
                      type="text"
                      name="clubName"
                      value={formik.values.clubName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={`Enter official ${formik.values.purchase_type} name`}
                      className={`${inputClass} ${
                        formik.errors.clubName && formik.touched.clubName
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.clubName && formik.errors.clubName && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.clubName}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-base font-medium text-gray-700">
                    Official Contact Number
                  </label>
                  <div className={parentClass}>
                    <FaPhoneAlt className="text-primary" />
                    <input
                      type="text"
                      name="clubContact"
                      value={formik.values.clubContact}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. +2348033333333"
                      className={`${inputClass} ${
                        formik.errors.clubContact && formik.touched.clubContact
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.clubContact && formik.errors.clubContact && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.clubContact}
                    </div>
                  )}
                </div>
              </div>

              {/* Members Manager */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-primary text-lg">
                    Registered Members
                  </h4>
                  <p className="text-xs text-gray-500">
                    Please add all individual members belonging to this{" "}
                    {formik.values.purchase_type}. (At least 1 is required)
                  </p>
                </div>

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
                          formik.setFieldValue("clubMembers", [
                            ...(formik.values.clubMembers || []),
                            {
                              title: newTitle,
                              firstName: newFirstName,
                              middleName: newMiddleName,
                              lastName: newLastName,
                            },
                          ]);
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                  {formik.values.clubMembers &&
                  formik.values.clubMembers.length > 0 ? (
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
                          {formik.values.clubMembers.map((member, index) => (
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
                                    formik.setFieldValue(
                                      "clubMembers",
                                      formik.values.clubMembers.filter(
                                        (_, idx) => idx !== index,
                                      ),
                                    );
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
                  {formik.touched.clubMembers && formik.errors.clubMembers && (
                    <div className="text-xs text-red-500 font-semibold">
                      {typeof formik.errors.clubMembers === "string"
                        ? formik.errors.clubMembers
                        : "At least one member is required"}
                    </div>
                  )}
                </div>
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
                <SearchableInput
                  fetcher={fetchCountries}
                  options={countries}
                  value={formik.values.countryOfResidence}
                  placeholder={
                    loading.countries
                      ? "Loading countries..."
                      : "Select Country"
                  }
                  disabled={loading.countries}
                  isSelector={true}
                  clearable={true}
                  fetchOnEmpty={true}
                  icon={<FaMap className="text-primary text-base" />}
                  inputContClassName={`mt-1 w-full rounded-md border ${
                    formik.errors.countryOfResidence &&
                    formik.touched.countryOfResidence
                      ? "border-red-500"
                      : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                  } h-[50px] shadow-sm bg-white px-2`}
                  onSelect={(item: string) => {
                    const selectedCountry =
                      typeof item === "string" ? item : (item as any)?.name || "";
                    formik.setFieldValue("countryOfResidence", selectedCountry);
                    formik.setFieldValue("stateOfOrigin", "");
                    formik.setFieldValue("lga", "");
                    formik.setFieldValue("mobileNumber", "");
                    formik.setFieldValue("nextOfKinMobileNumber", "");
                    formik.setFieldValue("referralMobileNumber", "");
                    formik.setFieldTouched("countryOfResidence", true);
                  }}
                  onClear={() => {
                    formik.setFieldValue("countryOfResidence", "");
                    formik.setFieldValue("stateOfOrigin", "");
                    formik.setFieldValue("lga", "");
                    formik.setFieldValue("mobileNumber", "");
                    formik.setFieldValue("nextOfKinMobileNumber", "");
                    formik.setFieldValue("referralMobileNumber", "");
                    formik.setFieldTouched("countryOfResidence", true);
                  }}
                  onInputChange={() => {
                    formik.setFieldTouched("countryOfResidence", true);
                  }}
                />
                {formik.touched.countryOfResidence &&
                  formik.errors.countryOfResidence && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.countryOfResidence}
                    </div>
                  )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  State of Origin
                </label>
                <SearchableInput
                  key={formik.values.countryOfResidence || "no-country"}
                  fetcher={fetchStates}
                  options={states}
                  value={formik.values.stateOfOrigin}
                  placeholder={
                    loading.states
                      ? "Loading states..."
                      : !formik.values.countryOfResidence
                        ? "Select country first"
                        : states.length === 0
                          ? "No states available"
                          : "Select State"
                  }
                  disabled={!formik.values.countryOfResidence || loading.states}
                  isSelector={true}
                  clearable={true}
                  fetchOnEmpty={true}
                  icon={<FaMapMarkerAlt className="text-primary text-base" />}
                  inputContClassName={`mt-1 w-full rounded-md border ${
                    formik.errors.stateOfOrigin && formik.touched.stateOfOrigin
                      ? "border-red-500"
                      : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                  } h-[50px] shadow-sm bg-white px-2`}
                  onSelect={(item: string) => {
                    const selectedState =
                      typeof item === "string" ? item : (item as any)?.name || "";
                    formik.setFieldValue("stateOfOrigin", selectedState);
                    formik.setFieldValue("lga", "");
                    formik.setFieldTouched("stateOfOrigin", true);
                  }}
                  onClear={() => {
                    formik.setFieldValue("stateOfOrigin", "");
                    formik.setFieldValue("lga", "");
                    formik.setFieldTouched("stateOfOrigin", true);
                  }}
                  onInputChange={() => {
                    formik.setFieldTouched("stateOfOrigin", true);
                  }}
                />
                {formik.touched.stateOfOrigin && formik.errors.stateOfOrigin && (
                  <div className="text-xs text-red-500 mt-1">
                    {formik.errors.stateOfOrigin}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 relative">
                <label className="block text-base font-medium text-gray-700">
                  Local Government (LGA)
                </label>
                <div className={parentClass}>
                  <FaMapMarkerAlt className="-3 text-primary" />
                  <input
                    type="text"
                    name="lga"
                    value={formik.values.lga}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.lga && formik.touched.lga
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.lga && formik.errors.lga && (
                  <div className="text-xs text-red-500 mt-1">
                    {formik.errors.lga}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 relative">
                <label className="block text-base font-medium text-gray-700">
                  Address
                </label>
                <div className={parentClass + " items-start! h-48! p-2!"}>
                  <FaAddressCard className="text-primary" />
                  <textarea
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass + " resize-none"} ${
                      formik.errors.address && formik.touched.address
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder={
                      formik.values.purchase_type === "individual"
                        ? "Enter your residential address"
                        : "Enter club/association registered address"
                    }
                  />
                </div>
                {formik.touched.address && formik.errors.address && (
                  <div className="text-xs text-red-500 mt-1">
                    {formik.errors.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spouse Information */}
          {formik.values.purchase_type === "individual" &&
            formik.values.maritalStatus === "Married" && (
              <div className="border-b border-gray-200 pb-4 md:pb-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shouldSpouseNameShow"
                    id="shouldSpouseNameShow"
                    checked={formik.values.shouldSpouseNameShow}
                    className="form-checkbox h-4 w-4 text-primary"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      formik.setFieldValue("shouldSpouseNameShow", checked);
                      if (!checked) {
                        formik.setFieldValue("spouseTitle", "");
                        formik.setFieldValue("spouseFirstName", "");
                        formik.setFieldValue("spouseMiddleName", "");
                        formik.setFieldValue("spouseLastName", "");
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

                {formik.values.shouldSpouseNameShow && (
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
                          <select
                            name="spouseTitle"
                            value={formik.values.spouseTitle}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClass} ${
                              formik.errors.spouseTitle &&
                              formik.touched.spouseTitle
                                ? "border-red-500"
                                : ""
                            }`}
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
                          </select>
                        </div>
                        {formik.touched.spouseTitle &&
                          formik.errors.spouseTitle && (
                            <div className="text-xs text-red-500 mt-1">
                              {formik.errors.spouseTitle}
                            </div>
                          )}
                      </div>

                      <div className="relative">
                        <label className="block text-base font-medium text-gray-700">
                          First Name
                        </label>
                        <div className={parentClass}>
                          <FaUser className="text-primary" />
                          <input
                            type="text"
                            name="spouseFirstName"
                            value={formik.values.spouseFirstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClass} ${
                              formik.errors.spouseFirstName &&
                              formik.touched.spouseFirstName
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </div>
                        {formik.touched.spouseFirstName &&
                          formik.errors.spouseFirstName && (
                            <div className="text-xs text-red-500 mt-1">
                              {formik.errors.spouseFirstName}
                            </div>
                          )}
                      </div>

                      <div className="relative">
                        <label className="block text-base font-medium text-gray-700">
                          Middle Name
                        </label>
                        <div className={parentClass}>
                          <FaUser className="text-primary" />
                          <input
                            type="text"
                            name="spouseMiddleName"
                            value={formik.values.spouseMiddleName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClass} ${
                              formik.errors.spouseMiddleName &&
                              formik.touched.spouseMiddleName
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </div>
                        {formik.touched.spouseMiddleName &&
                          formik.errors.spouseMiddleName && (
                            <div className="text-xs text-red-500 mt-1">
                              {formik.errors.spouseMiddleName}
                            </div>
                          )}
                      </div>

                      <div className="relative">
                        <label className="block text-base font-medium text-gray-700">
                          Last Name
                        </label>
                        <div className={parentClass}>
                          <FaUser className="text-primary" />
                          <input
                            type="text"
                            name="spouseLastName"
                            value={formik.values.spouseLastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClass} ${
                              formik.errors.spouseLastName &&
                              formik.touched.spouseLastName
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </div>
                        {formik.touched.spouseLastName &&
                          formik.errors.spouseLastName && (
                            <div className="text-xs text-red-500 mt-1">
                              {formik.errors.spouseLastName}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Contact Information */}
          {formik.values.purchase_type === "individual" && (
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
                    <FaEnvelope className="text-primary" />
                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`${inputClass} ${
                        formik.errors.email && formik.touched.email
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-base font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className={parentClass}>
                    <FaPhoneAlt className="text-primary" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formik.values.mobileNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`${inputClass} ${
                        formik.errors.mobileNumber &&
                        formik.touched.mobileNumber
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder={getMobilePlaceholder()}
                    />
                  </div>
                  {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.mobileNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next of Kin / Representative Details */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
              {formik.values.purchase_type === "individual"
                ? "Next of Kin"
                : "Representative/Trustee Details"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  {formik.values.purchase_type === "individual"
                    ? "Full Name"
                    : "Representative / Trustee Full Name"}
                </label>
                <div className={parentClass}>
                  <FaUser className="text-primary" />
                  <input
                    type="text"
                    name="nextOfKinFullName"
                    value={formik.values.nextOfKinFullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={
                      formik.values.purchase_type === "individual"
                        ? "Enter Full Name"
                        : "e.g. Michael Smith"
                    }
                    className={`${inputClass} ${
                      formik.errors.nextOfKinFullName &&
                      formik.touched.nextOfKinFullName
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.nextOfKinFullName &&
                  formik.errors.nextOfKinFullName && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.nextOfKinFullName}
                    </div>
                  )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  {formik.values.purchase_type === "individual"
                    ? "Relationship"
                    : "Role / Designation"}
                </label>
                <div className={parentClass}>
                  <FaUser className="text-primary" />
                  <select
                    name="nextOfKinRelationship"
                    value={formik.values.nextOfKinRelationship}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.nextOfKinRelationship &&
                      formik.touched.nextOfKinRelationship
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <option value="" disabled>
                      {formik.values.purchase_type === "individual"
                        ? "Select Relationship"
                        : "Select Role / Designation"}
                    </option>
                    {formik.values.purchase_type === "individual" ? (
                      <>
                        <option value="brother">Brother</option>
                        <option value="sister">Sister</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="husband">Husband</option>
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
                  </select>
                </div>
                {formik.touched.nextOfKinRelationship &&
                  formik.errors.nextOfKinRelationship && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.nextOfKinRelationship}
                    </div>
                  )}
              </div>

              {formik.values.nextOfKinRelationship === "others" ? (
                <div className="relative">
                  <label className="block text-base font-medium text-gray-700">
                    {formik.values.purchase_type === "individual"
                      ? "Specify Relationship"
                      : "Specify Role / Designation"}
                  </label>
                  <div className={parentClass}>
                    <FaUser className="text-primary" />
                    <input
                      type="text"
                      name="nextOfKinRelationshipOther"
                      value={formik.values.nextOfKinRelationshipOther}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={
                        formik.values.purchase_type === "individual"
                          ? "Enter relationship"
                          : "Enter designation"
                      }
                      className={`${inputClass} ${
                        formik.errors.nextOfKinRelationshipOther &&
                        formik.touched.nextOfKinRelationshipOther
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.nextOfKinRelationshipOther &&
                    formik.errors.nextOfKinRelationshipOther && (
                      <div className="text-xs text-red-500 mt-1">
                        {formik.errors.nextOfKinRelationshipOther}
                      </div>
                    )}
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  {formik.values.purchase_type === "individual"
                    ? "Phone"
                    : "Representative Contact Mobile"}
                </label>
                <div className={parentClass}>
                  <FaPhoneAlt className="text-primary" />
                  <input
                    type="tel"
                    name="nextOfKinMobileNumber"
                    value={formik.values.nextOfKinMobileNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.nextOfKinMobileNumber &&
                      formik.touched.nextOfKinMobileNumber
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder={getMobilePlaceholder()}
                  />
                </div>
                {formik.touched.nextOfKinMobileNumber &&
                  formik.errors.nextOfKinMobileNumber && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.nextOfKinMobileNumber}
                    </div>
                  )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  {formik.values.purchase_type === "individual"
                    ? "Email"
                    : "Representative Contact Email"}
                </label>
                <div className={parentClass}>
                  <FaEnvelope className="text-primary" />
                  <input
                    type="email"
                    name="nextOfKinEmail"
                    value={formik.values.nextOfKinEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. representative@email.com"
                    className={`${inputClass} ${
                      formik.errors.nextOfKinEmail &&
                      formik.touched.nextOfKinEmail
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.nextOfKinEmail &&
                  formik.errors.nextOfKinEmail && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.nextOfKinEmail}
                    </div>
                  )}
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
                  <input
                    type="text"
                    name="clientDeclarationLandPrice"
                    value={formik.values.clientDeclarationLandPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.clientDeclarationLandPrice &&
                      formik.touched.clientDeclarationLandPrice
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.clientDeclarationLandPrice &&
                  formik.errors.clientDeclarationLandPrice && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.clientDeclarationLandPrice}
                    </div>
                  )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  Number of Plots
                </label>
                <div className={parentClass}>
                  <FaUser className="text-primary" />
                  <input
                    type="text"
                    name="clientDeclarationNumberOfPlots"
                    value={formik.values.clientDeclarationNumberOfPlots}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.clientDeclarationNumberOfPlots &&
                      formik.touched.clientDeclarationNumberOfPlots
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.clientDeclarationNumberOfPlots &&
                  formik.errors.clientDeclarationNumberOfPlots && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.clientDeclarationNumberOfPlots}
                    </div>
                  )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  Site Location
                </label>
                <div className={parentClass}>
                  <FaMapMarkerAlt className="-3 text-primary" />
                  <input
                    type="text"
                    name="clientDeclarationSiteLocation"
                    value={formik.values.clientDeclarationSiteLocation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.clientDeclarationSiteLocation &&
                      formik.touched.clientDeclarationSiteLocation
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.clientDeclarationSiteLocation &&
                  formik.errors.clientDeclarationSiteLocation && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.clientDeclarationSiteLocation}
                    </div>
                  )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  Plot Number
                </label>
                <div className={parentClass}>
                  <FaMapMarkerAlt className="-3 text-primary" />
                  <input
                    type="text"
                    name="clientDeclarationPlotNumber"
                    value={formik.values.clientDeclarationPlotNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.clientDeclarationPlotNumber &&
                      formik.touched.clientDeclarationPlotNumber
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.clientDeclarationPlotNumber &&
                  formik.errors.clientDeclarationPlotNumber && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.clientDeclarationPlotNumber}
                    </div>
                  )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  Branch
                </label>
                <div className={parentClass}>
                  <FaMapMarkerAlt className="-3 text-primary" />
                  <input
                    type="text"
                    name="branches"
                    value={formik.values.branches}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.branches && formik.touched.branches
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.branches && formik.errors.branches && (
                  <div className="text-xs text-red-500 mt-1">
                    {formik.errors.branches}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  Declaration Date
                </label>
                <div className={parentClass}>
                  <FaCalendarAlt className="3 text-primary z-10" />
                  <DatePicker
                    selected={
                      formik.values.clientDeclarationDate
                        ? new Date(formik.values.clientDeclarationDate)
                        : null
                    }
                    onChange={(date: Date | null) =>
                      formik.setFieldValue("clientDeclarationDate", date)
                    }
                    dateFormat="dd-MM-yyyy"
                    placeholderText="DD-MM-YYYY"
                    className={`${inputClass} ${
                      formik.errors.clientDeclarationDate &&
                      formik.touched.clientDeclarationDate
                        ? "border-red-500"
                        : ""
                    }`}
                    showYearDropdown
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                  />
                </div>
                {formik.touched.clientDeclarationDate &&
                  formik.errors.clientDeclarationDate && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.clientDeclarationDate as string}
                    </div>
                  )}
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
                  <input
                    type="text"
                    name="referralFullName"
                    value={formik.values.referralFullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.referralFullName &&
                      formik.touched.referralFullName
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.referralFullName &&
                  formik.errors.referralFullName && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.referralFullName}
                    </div>
                  )}
              </div>

              <div className="relative">
                <label className="block text-base font-medium text-gray-700">
                  Phone
                </label>
                <div className={parentClass}>
                  <FaPhoneAlt className="text-primary" />
                  <input
                    type="tel"
                    name="referralMobileNumber"
                    value={formik.values.referralMobileNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${inputClass} ${
                      formik.errors.referralMobileNumber &&
                      formik.touched.referralMobileNumber
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder={getMobilePlaceholder()}
                  />
                </div>
                {formik.touched.referralMobileNumber &&
                  formik.errors.referralMobileNumber && (
                    <div className="text-xs text-red-500 mt-1">
                      {formik.errors.referralMobileNumber}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-secClrHover transition-colors duration-200 disabled:opacity-60"
              disabled={
                formik.isSubmitting ||
                loading.countries ||
                loading.states
              }
            >
              {formik.isSubmitting ? "Updating..." : "Update Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClient;
