import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUser, FaPhoneAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { api } from "../../../helpers/api";
import type { SectionProps } from "./types";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Section4: React.FC<SectionProps> = ({
  formData,
  setFormData,
  prevSection,
  onSubmit,
}) => {
  console.log("formData", formData);
  const navigate = useNavigate();
  const parentClass =
    "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[50px] px-2 flex items-center bg-white";
  const inputClass = "w-full focus:outline-0 text-sm h-full indent-2";

  const base64ToFile = (base64: string, filename: string): File | string => {
    try {
      if (!base64 || !base64.includes("base64,")) {
        console.warn(`Invalid base64 string for ${filename}`);
        return "";
      }
      const arr = base64.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (err) {
      console.error(`Error converting base64 to file for ${filename}:`, err);
      return "";
    }
  };

  const validationSchema = Yup.object({
    referralFullName: Yup.string().required("Full name is required"),
    referralMobileNumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Enter a valid mobile number")
      .required("Mobile number is required"),
  });

  const formik = useFormik({
    initialValues: {
      referralFullName: formData.referralFullName || "",
      referralMobileNumber: formData.referralMobileNumber || "",
      referralDate: formData.referralDate
        ? new Date(formData.referralDate)
        : null,
      referralEmail: formData.referralEmail || "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("Submitting application...");
      try {
        const isIndividual = formData.purchase_type === "individual";

        const requiredFields = isIndividual
          ? [
              "personal_picture",
              "first_name",
              "last_name",
              "address",
              "marital_status",
              "gender",
              "email",
              "mobile_number",
              "next_of_kin_full_name",
              "next_of_kin_relationship",
              "next_of_kin_mobile_number",
              "land_price",
              "number_of_plot",
              "site_location",
              "plot_number",
              "branches",
              "signature",
              "declaration_date",
              "declaration_name",
              "client_name",
              "referral_name",
              "referral_number",
            ]
          : [
              "club_name",
              "club_contact",
              "club_members",
              "address",
              "country",
              "state_of_origin",
              "lga",
              "next_of_kin_full_name",
              "next_of_kin_relationship",
              "next_of_kin_mobile_number",
              "land_price",
              "number_of_plot",
              "site_location",
              "plot_number",
              "branches",
              "signature",
              "declaration_date",
              "declaration_name",
              "client_name",
              "referral_name",
              "referral_number",
            ];

        const missingFields = requiredFields.filter((field) => {
          const value =
            field === "personal_picture"
              ? formData.image
              : field === "first_name"
                ? formData.firstName
                : field === "last_name"
                  ? formData.lastName
                  : field === "address"
                    ? formData.address
                    : field === "marital_status"
                      ? formData.maritalStatus
                      : field === "gender"
                        ? formData.gender
                        : field === "email"
                          ? formData.email
                          : field === "mobile_number"
                            ? formData.mobileNumber
                            : field === "club_name"
                              ? formData.clubName
                              : field === "club_contact"
                                ? formData.clubContact
                                : field === "club_members"
                                  ? formData.clubMembers &&
                                    formData.clubMembers.length > 0
                                    ? "filled"
                                    : ""
                                  : field === "country"
                                    ? formData.countryOfResidence
                                    : field === "state_of_origin"
                                      ? formData.stateOfOrigin
                                      : field === "lga"
                                        ? formData.lga
                                        : field === "next_of_kin_full_name"
                                          ? formData.nextOfKinFullName
                                          : field === "next_of_kin_relationship"
                                            ? formData.nextOfKinRelationship
                                            : field ===
                                                "next_of_kin_mobile_number"
                                              ? formData.nextOfKinMobileNumber
                                              : field === "next_of_kin_email"
                                                ? formData.nextOfKinEmail
                                                : field === "land_price"
                                                  ? formData.clientDeclarationLandPrice
                                                  : field === "number_of_plot"
                                                    ? formData.clientDeclarationNumberOfPlots
                                                    : field === "site_location"
                                                      ? formData.clientDeclarationSiteLocation
                                                      : field === "plot_number"
                                                        ? formData.clientDeclarationPlotNumber
                                                        : field === "branches"
                                                          ? formData.branches
                                                          : field ===
                                                              "signature"
                                                            ? formData.clientDeclarationSignature
                                                              ? base64ToFile(
                                                                  formData.clientDeclarationSignature,
                                                                  "signature.png",
                                                                )
                                                              : ""
                                                            : field ===
                                                                "declaration_date"
                                                              ? formData.clientDeclarationDate
                                                                ? format(
                                                                    new Date(
                                                                      formData.clientDeclarationDate,
                                                                    ),
                                                                    "yyyy-MM-dd",
                                                                  )
                                                                : ""
                                                              : field ===
                                                                  "declaration_name"
                                                                ? isIndividual
                                                                  ? formData.clientDeclarationClientName
                                                                  : formData.nextOfKinFullName
                                                                : field ===
                                                                    "client_name"
                                                                  ? isIndividual
                                                                    ? formData.clientDeclarationClientName
                                                                    : formData.clubName
                                                                  : field ===
                                                                      "referral_name"
                                                                    ? values.referralFullName
                                                                    : field ===
                                                                        "referral_number"
                                                                      ? values.referralMobileNumber
                                                                      : "";
          return (
            !value ||
            (typeof value === "string" && value.trim() === "") ||
            value === "null"
          );
        });

        if (missingFields.length > 0) {
          toast.error(
            `Please fill all required fields: ${missingFields.join(", ")}`,
            { id: toastId },
          );
          setSubmitting(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("purchase_type", formData.purchase_type);

        if (isIndividual) {
          formDataToSend.append("personal_picture", formData.image || "");
          formDataToSend.append("title", formData.title || "");
          formDataToSend.append("first_name", formData.firstName || "");
          formDataToSend.append("middle_name", formData.middleName || "");
          formDataToSend.append("last_name", formData.lastName || "");
          formDataToSend.append("marital_status", formData.maritalStatus || "");
          formDataToSend.append("gender", formData.gender || "");
          formDataToSend.append(
            "should_spouse_name_show",
            formData.shouldSpouseNameShow ? "1" : "0",
          );
          if (
            formData.maritalStatus === "Married" &&
            formData.shouldSpouseNameShow
          ) {
            formDataToSend.append(
              "title_of_spouse",
              formData.spouseTitle || "",
            );
            formDataToSend.append(
              "first_name_of_spouse",
              formData.spouseFirstName || "",
            );
            formDataToSend.append(
              "middle_name_of_spouse",
              formData.spouseMiddleName || "",
            );
            formDataToSend.append(
              "last_name_of_spouse",
              formData.spouseLastName || "",
            );
          }
          formDataToSend.append("email", formData.email || "");
          formDataToSend.append("mobile_number", formData.mobileNumber || "");
        } else {
          formDataToSend.append("club_name", formData.clubName || "");
          formDataToSend.append("club_contact", formData.clubContact || "");

          // Append club members index-based
          (formData.clubMembers || []).forEach((member, index) => {
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

          // Set empty strings for individual properties to avoid backend validation failure
          formDataToSend.append("personal_picture", "");
          formDataToSend.append("title", "");
          formDataToSend.append("first_name", "");
          formDataToSend.append("middle_name", "");
          formDataToSend.append("last_name", "");
          formDataToSend.append("marital_status", "");
          formDataToSend.append("gender", "");
          formDataToSend.append("email", "");
          formDataToSend.append("mobile_number", "");
        }

        formDataToSend.append("address", formData.address || "");
        formDataToSend.append("country", formData.countryOfResidence || "");
        formDataToSend.append("state_of_origin", formData.stateOfOrigin || "");
        formDataToSend.append("lga", formData.lga || "");

        formDataToSend.append(
          "next_of_kin_full_name",
          formData.nextOfKinFullName || "",
        );
        formDataToSend.append(
          "next_of_kin_relationship",
          formData.nextOfKinRelationship || "",
        );
        formDataToSend.append(
          "next_of_kin_mobile_number",
          formData.nextOfKinMobileNumber || "",
        );
        formDataToSend.append(
          "next_of_kin_email",
          formData.nextOfKinEmail || "",
        );

        formDataToSend.append(
          "land_price",
          formData.clientDeclarationLandPrice !== undefined &&
            formData.clientDeclarationLandPrice !== null
            ? String(formData.clientDeclarationLandPrice)
            : "",
        );
        formDataToSend.append(
          "number_of_plot",
          formData.clientDeclarationNumberOfPlots !== undefined &&
            formData.clientDeclarationNumberOfPlots !== null
            ? String(formData.clientDeclarationNumberOfPlots)
            : "",
        );
        formDataToSend.append(
          "site_location",
          formData.clientDeclarationSiteLocation || "",
        );
        formDataToSend.append(
          "plot_number",
          formData.clientDeclarationPlotNumber !== undefined &&
            formData.clientDeclarationPlotNumber !== null
            ? String(formData.clientDeclarationPlotNumber)
            : "",
        );
        formDataToSend.append("branches", formData.branches || "");

        const signatureFile = formData.clientDeclarationSignature
          ? base64ToFile(formData.clientDeclarationSignature, "signature.png")
          : "";
        if (signatureFile) {
          formDataToSend.append("signature", signatureFile);
        } else {
          formDataToSend.append("signature", "");
        }

        formDataToSend.append(
          "declaration_date",
          formData.clientDeclarationDate
            ? format(new Date(formData.clientDeclarationDate), "yyyy-MM-dd")
            : "",
        );
        formDataToSend.append(
          "declaration_name",
          isIndividual
            ? formData.clientDeclarationClientName || ""
            : formData.nextOfKinFullName || "",
        );
        formDataToSend.append(
          "client_name",
          isIndividual
            ? formData.clientDeclarationClientName || ""
            : formData.clubName || "",
        );
        formDataToSend.append("referral_name", values.referralFullName || "");
        formDataToSend.append(
          "referral_number",
          values.referralMobileNumber || "",
        );

        console.log("FormData being sent to POST /clients:");
        for (let [key, value] of formDataToSend.entries()) {
          console.log(`${key}:`, value instanceof File ? value.name : value);
        }

        const response = await api.post(`${API_URL}/clients`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("API Response from POST /clients:", response.data);

        if (response.status === 200 || response.status === 201) {
          toast.success("Application submitted successfully!", {
            id: toastId,
          });

          // Reset formData
          setFormData({
            image: "",
            title: "",
            firstName: "",
            middleName: "",
            lastName: "",
            address: "",
            dateOfBirth: null,
            nationality: "",
            maritalStatus: "",
            gender: "",
            spouseTitle: "",
            spouseFirstName: "",
            spouseMiddleName: "",
            lastNameOfSpouse: "",
            stateOfOrigin: "",
            lga: "",
            occupation: "",
            countryOfResidence: "",
            language: "",
            email: "",
            mobileNumber: "",
            telephoneNumber: "",
            nextOfKinFullName: "",
            nextOfKinAddress: "",
            nextOfKinMobileNumber: "",
            nextOfKinEmail: "",
            clientDeclarationLandPrice: "",
            clientDeclarationNumberOfPlots: "",
            clientDeclarationSiteLocation: "",
            clientDeclarationPlotNumber: "",
            branches: "",
            clientDeclarationClientName: "",
            clientDeclarationSignature: "",
            clientDeclarationDate: null,
            referralFullName: "",
            referralMobileNumber: "",
            referralDate: null,
            referralEmail: "",
          });

          console.log("Navigating to /success");
          navigate("/success");

          if (onSubmit) {
            setTimeout(() => {
              console.log("Calling onSubmit prop");
              onSubmit();
            }, 100);
          }
        }
      } catch (err) {
        console.error("Error submitting form:", err);
        if (axios.isAxiosError(err)) {
          if (err.code === "ERR_NETWORK") {
            toast.error("Network error: Unable to connect to the server.", {
              id: toastId,
            });
          } else if (err.response?.status === 400) {
            toast.error(err.response.data.message || "Invalid data provided.", {
              id: toastId,
            });
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

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = formik;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="font-semibold text-xl md:text-2xl text-center">
        Section 4: Referral Details
      </p>

      <div className="relative w-full">
        <label
          htmlFor="referralFullName"
          className="block text-sm font-medium text-black/70"
        >
          Referral Full Name
        </label>
        <div className={parentClass}>
          <FaUser className="text-primary" />
          <input
            type="text"
            name="referralFullName"
            id="referralFullName"
            className={inputClass}
            value={values.referralFullName}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
          />
        </div>
        {touched.referralFullName && errors.referralFullName && (
          <div className="text-xs text-red-500 mt-1">
            {errors.referralFullName}
          </div>
        )}
      </div>

      <div className="relative w-full">
        <label
          htmlFor="referralMobileNumber"
          className="block text-sm font-medium text-black/70"
        >
          Mobile Number
        </label>
        <div className={parentClass}>
          <FaPhoneAlt className="text-primary" />
          <input
            type="tel"
            name="referralMobileNumber"
            id="referralMobileNumber"
            className={inputClass}
            value={values.referralMobileNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
          />
        </div>
        {touched.referralMobileNumber && errors.referralMobileNumber && (
          <div className="text-xs text-red-500 mt-1">
            {errors.referralMobileNumber}
          </div>
        )}
      </div>

      <div className="w-full flex justify-between mt-6">
        <button
          type="button"
          onClick={prevSection}
          className="px-4 py-2 bg-gray-300 text-black/80 rounded-md hover:bg-gray-400 disabled:opacity-50"
          disabled={isSubmitting}
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Section4;
