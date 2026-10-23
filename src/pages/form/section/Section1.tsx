import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";
import { BiBriefcase, BiEnvelope, BiGlobe } from "react-icons/bi";
import {
  FaUser,
  FaAddressCard,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { MdTitle } from "react-icons/md";
import { toast } from "sonner";
import type { ClubMember, SectionProps } from "./types";

const COUNTRY_URL = import.meta.env.VITE_COUNTRY_BASE_URL;

const Section1: React.FC<SectionProps> = ({
  formData,
  setFormData,
  nextSection,
  prevSection,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    formData.image
      ? typeof formData.image === "string"
        ? formData.image
        : URL.createObjectURL(formData.image)
      : null,
  );
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [countryCodeMap, setCountryCodeMap] = useState<Record<string, any>>({});
  const [countryIdMap, setCountryIdMap] = useState<Record<string, any>>({});

  // Local state for adding club members dynamically
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
        const response = await fetch(`${COUNTRY_URL}/countries`);
        const result = await response.json();
        if (!result || result.length === 0)
          throw new Error("No countries found");

        const countryList = result
          .map((c: any) => ({ name: c.name, id: c.id, iso2: c.iso2 }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        const codeMap: Record<string, any> = {};
        const idMap: Record<string, any> = {};
        result.forEach((c: any) => {
          codeMap[c.name] = c.iso2;
          idMap[c.name] = c.id;
        });

        setCountries(countryList.map((c: any) => c.name));
        setCountryCodeMap(codeMap);
        setCountryIdMap(idMap);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("Failed to load countries.");
        toast.error("Failed to load countries.");
      } finally {
        setLoading((prev) => ({ ...prev, countries: false }));
      }
    };
    fetchCountries();
  }, []);

  // Fetch states when countryOfResidence changes
  useEffect(() => {
    if (
      formData.countryOfResidence &&
      countryIdMap[formData.countryOfResidence]
    ) {
      const fetchStates = async () => {
        setLoading((prev) => ({ ...prev, states: true }));
        const countryId = countryIdMap[formData.countryOfResidence];
        try {
          const response = await fetch(
            `${COUNTRY_URL}/countries/${countryId}/states`,
          );
          const result = await response.json();
          const stateList = result?.map((s: any) => s.name) || [];
          setStates(stateList.sort());
        } catch (err) {
          console.error("Error fetching states:", err);
          setStates([]);
        } finally {
          setLoading((prev) => ({ ...prev, states: false }));
        }
      };
      fetchStates();
    } else {
      setStates([]);
    }
  }, [formData.countryOfResidence, countryIdMap]);

  const getMobilePlaceholder = (countryName?: string) => {
    if (!countryName || !countryCodeMap[countryName])
      return "Enter phone number";
    try {
      const countryCode = getCountryCallingCode(countryCodeMap[countryName]);
      return `+${countryCode} XXXXXXXXXX`;
    } catch {
      return "Enter phone number";
    }
  };

  const validationSchema = Yup.object({
    purchase_type: Yup.string().required(),
    image: Yup.mixed().when("purchase_type", {
      is: "individual",
      then: (schema) =>
        schema
          .test("fileSize", "File size is too large, max 10MB", (value: any) => {
            return !value || (value && value.size <= 10 * 1024 * 1024);
          })
          .test(
            "fileType",
            "Unsupported file format, use PNG, JPG, or GIF",
            (value: any) => {
              return (
                !value ||
                (value &&
                  ["image/png", "image/jpeg", "image/gif"].includes(value.type))
              );
            },
          ),
      otherwise: (schema) => schema.nullable(),
    }),
    title: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) => schema.required("Title is required"),
      otherwise: (schema) => schema.nullable(),
    }),
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
    gender: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) => schema.required("Gender is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    maritalStatus: Yup.string().when("purchase_type", {
      is: "individual",
      then: (schema) => schema.required("Marital status is required"),
      otherwise: (schema) => schema.nullable(),
    }),

    shouldSpouseNameShow: Yup.boolean(),
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
          ? schema.nullable()
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

    address: Yup.string().required("Address is required"),
    stateOfOrigin: Yup.string().required("State of origin is required"),
    lga: Yup.string()
      .required("Town, Village, and Local Government (LGA) are required")
      .test(
        "has-three-non-empty-entries",
        "Please enter three distinct, non-empty values (Town, Village, LGA) separated by commas.",
        (value) => {
          if (!value) return false;
          const entries = value.split(",");
          if (entries.length !== 3) return false;
          return entries.every((entry) => entry.trim().length > 0);
        },
      ),
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
      then: (schema) => schema.required("Contact info is required"),
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
  });

  const formik = useFormik({
    initialValues: formData,
    validationSchema,
    onSubmit: (values) => {
      setFormData({ ...formData, ...values });
      if (nextSection) {
        nextSection();
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
    setFieldValue,
  } = formik;

  const handleAddMember = () => {
    if (!newTitle || !newFirstName || !newLastName) {
      toast.error("Please fill Title, First Name, and Last Name.");
      return;
    }
    const newMember: ClubMember = {
      title: newTitle,
      firstName: newFirstName,
      middleName: newMiddleName,
      lastName: newLastName,
    };
    setFieldValue("clubMembers", [...(values.clubMembers || []), newMember]);
    setNewTitle("");
    setNewFirstName("");
    setNewMiddleName("");
    setNewLastName("");
    toast.success("Member added!");
  };

  const handleRemoveMember = (index: number) => {
    setFieldValue(
      "clubMembers",
      (values.clubMembers || []).filter((_, i) => i !== index),
    );
    toast.info("Removed member");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <p className="font-semibold text-xl md:text-2xl text-center">
        {values.purchase_type === "individual"
          ? "Section 1: Client's Details (Individual)"
          : `Section 1: ${values.purchase_type === "club" ? "Club" : "Association"} Details`}
      </p>

      {/* INDIVIDUAL CLIENT LAYOUT */}
      {values.purchase_type === "individual" && (
        <>
          <div className="w-full">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-black/70"
            >
              Upload Image
            </label>
            <div className="mt-2 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-primary/50 border-dashed rounded-md relative">
              {imagePreview ? (
                <div className="flex flex-col items-center space-y-3">
                  <img
                    src={imagePreview}
                    alt="Uploaded Preview"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300 shadow-sm"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/80"
                  >
                    Re-upload
                    <input
                      id="image"
                      name="image"
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setFieldValue("image", file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      accept="image/png,image/jpeg,image/gif"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-1 text-center flex flex-col items-center">
                  <svg
                    className="mx-auto h-12 w-12 text-primary"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary flex"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setFieldValue("image", file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          } else {
                            setImagePreview(null);
                          }
                        }}
                        accept="image/png,image/jpeg,image/gif"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  {touched.image && errors.image && (
                    <div className="text-xs text-red-500 mt-1">
                      {errors.image as string}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-black/70"
              >
                Title
              </label>
              <div className={parentClass}>
                <MdTitle className="text-primary" />
                <select
                  id="title"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                >
                  <option value="">Select Title</option>
                  {["Mr", "Mrs", "Miss"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {touched.title && errors.title && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.title}
                </div>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-black/70"
              >
                First Name
              </label>
              <div className={parentClass}>
                <FaUser className="text-primary" />
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                />
              </div>
              {touched.firstName && errors.firstName && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.firstName}
                </div>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="middleName"
                className="block text-sm font-medium text-black/70"
              >
                Middle Name
              </label>
              <div className={parentClass}>
                <FaUser className="text-primary" />
                <input
                  type="text"
                  name="middleName"
                  id="middleName"
                  value={values.middleName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-black/70"
              >
                Last Name
              </label>
              <div className={parentClass}>
                <FaUser className="text-primary" />
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                />
              </div>
              {touched.lastName && errors.lastName && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-black/70">
                Gender
              </label>
              <div className="mt-2 flex gap-4">
                {["Male", "Female", "Other"].map((gen) => (
                  <label key={gen} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gen}
                      checked={values.gender === gen}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-radio h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-sm text-black/70">{gen}</span>
                  </label>
                ))}
              </div>
              {touched.gender && errors.gender && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.gender}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black/70">
                Marital Status
              </label>
              <div className="mt-2 flex flex-wrap gap-4">
                {["Single", "Married", "Divorced", "Widowed"].map((status) => (
                  <label key={status} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="maritalStatus"
                      value={status}
                      checked={values.maritalStatus === status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-radio h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-sm text-black/70">{status}</span>
                  </label>
                ))}
              </div>
              {touched.maritalStatus && errors.maritalStatus && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.maritalStatus}
                </div>
              )}
            </div>

            {values.maritalStatus === "Married" && (
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="shouldSpouseNameShow"
                  id="shouldSpouseNameShow"
                  checked={!!values.shouldSpouseNameShow}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-checkbox h-5 w-5 text-primary rounded border-gray-300"
                />
                <label
                  htmlFor="shouldSpouseNameShow"
                  className="ml-2 block text-sm font-medium text-black/70"
                >
                  Should spouse details be entered?
                </label>
              </div>
            )}
          </div>

          {values.maritalStatus === "Married" &&
            values.shouldSpouseNameShow && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <label
                    htmlFor="spouseTitle"
                    className="block text-sm font-medium text-black/70"
                  >
                    Spouse Title
                  </label>
                  <div className={parentClass}>
                    <MdTitle className="text-primary" />
                    <select
                      id="spouseTitle"
                      name="spouseTitle"
                      value={values.spouseTitle}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      {["Mr", "Mrs", "Miss"].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  {touched.spouseTitle && errors.spouseTitle && (
                    <div className="text-xs text-red-500 mt-1">
                      {errors.spouseTitle}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label
                    htmlFor="spouseFirstName"
                    className="block text-sm font-medium text-black/70"
                  >
                    First Name
                  </label>
                  <div className={parentClass}>
                    <FaUser className="text-primary" />
                    <input
                      type="text"
                      name="spouseFirstName"
                      id="spouseFirstName"
                      value={values.spouseFirstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />
                  </div>
                  {touched.spouseFirstName && errors.spouseFirstName && (
                    <div className="text-xs text-red-500 mt-1">
                      {errors.spouseFirstName}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label
                    htmlFor="spouseMiddleName"
                    className="block text-sm font-medium text-black/70"
                  >
                    Middle Name
                  </label>
                  <div className={parentClass}>
                    <FaUser className="text-primary" />
                    <input
                      type="text"
                      name="spouseMiddleName"
                      id="spouseMiddleName"
                      value={values.spouseMiddleName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />
                  </div>
                  {touched.spouseMiddleName && errors.spouseMiddleName && (
                    <div className="text-xs text-red-500 mt-1">
                      {errors.spouseMiddleName}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label
                    htmlFor="spouseLastName"
                    className="block text-sm font-medium text-black/70"
                  >
                    Last Name
                  </label>
                  <div className={parentClass}>
                    <FaUser className="text-primary" />
                    <input
                      type="text"
                      name="spouseLastName"
                      id="spouseLastName"
                      value={values.spouseLastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                    />
                  </div>
                  {touched.spouseLastName && errors.spouseLastName && (
                    <div className="text-xs text-red-500 mt-1">
                      {errors.spouseLastName}
                    </div>
                  )}
                </div>
              </div>
            )}
        </>
      )}

      {/* CLUB & ASSOCIATION LAYOUT */}
      {(values.purchase_type === "club" ||
        values.purchase_type === "association") && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label
                htmlFor="clubName"
                className="block text-sm text-black/70 font-semibold"
              >
                {values.purchase_type === "club"
                  ? "Club Name"
                  : "Association Name"}
              </label>
              <div className={parentClass}>
                <BiBriefcase className="text-primary text-lg" />
                <input
                  type="text"
                  name="clubName"
                  id="clubName"
                  placeholder={`Enter official ${values.purchase_type} name`}
                  value={values.clubName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                />
              </div>
              {touched.clubName && errors.clubName && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.clubName}
                </div>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="clubContact"
                className="block text-sm text-black/70 font-semibold"
              >
                Official Contact Number
              </label>
              <div className={parentClass}>
                <FaPhoneAlt className="text-primary" />
                <input
                  type="text"
                  name="clubContact"
                  id="clubContact"
                  placeholder="e.g. +2348033333333"
                  value={values.clubContact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                />
              </div>
              {touched.clubContact && errors.clubContact && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.clubContact}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Please add all individual members belonging to this{" "}
            {values.purchase_type}. (At least 1 is required)
          </p>
          <div className="space-y-4">
            {/* Add Member form */}
            <div className="bg-white p-4 rounded-xl border border-primary/10 space-y-3">
              <div className="flex md:flex-row flex-col md:items-center justify-between mb-5 gap-4">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Add New Member
                </p>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 shadow"
                >
                  <FaPlus /> <span>Add Member</span>
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-3">
                <select
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm indent-3 border border-gray-300 rounded-md h-11 focus:outline-none"
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
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full text-sm indent-3 border border-gray-300 rounded-md h-11 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Middle Name (Opt)"
                  value={newMiddleName}
                  onChange={(e) => setNewMiddleName(e.target.value)}
                  className="w-full text-sm indent-3 border border-gray-300 rounded-md h-11 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full text-sm indent-3 border border-gray-300 rounded-md h-11 focus:outline-none"
                />
              </div>
            </div>

            {/* Members table */}
            {values.clubMembers && values.clubMembers.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-xl border border-primary/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-2.5 px-4">S/N</th>
                      <th className="py-2.5 px-4">Title</th>
                      <th className="py-2.5 px-4">Full Name</th>
                      <th className="py-2.5 px-4 text-center font-medium">
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {values.clubMembers.map((member, index) => (
                      <tr key={index} className="hover:bg-gray-50/50">
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
                            onClick={() => handleRemoveMember(index)}
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
                <p className="text-sm text-primary font-medium">
                  No members added yet. Please use the form above to add
                  members.
                </p>
              </div>
            )}
            {touched.clubMembers && errors.clubMembers && (
              <div className="text-xs text-red-500 font-semibold">
                {errors.clubMembers as string}
              </div>
            )}
          </div>
        </>
      )}

      {/* COMMON FIELDS: ADDRESS, COUNTRY, STATE, LGA */}
      <div className="relative">
        <label
          htmlFor="address"
          className="block text-sm text-black/70 font-semibold"
        >
          Address
        </label>
        <div className={parentClass}>
          <FaAddressCard className="text-primary" />
          <input
            type="text"
            name="address"
            id="address"
            placeholder={
              values.purchase_type === "individual"
                ? "Enter your residential address"
                : "Enter club/association registered address"
            }
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
          />
        </div>
        {touched.address && errors.address && (
          <div className="text-xs text-red-500 mt-1">
            {errors.address}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label
            htmlFor="countryOfResidence"
            className="block text-sm text-black/70 font-semibold"
          >
            Country of Residence
          </label>
          <div className={parentClass}>
            <BiGlobe className="text-primary" />
            <select
              name="countryOfResidence"
              id="countryOfResidence"
              className={inputClass}
              value={values.countryOfResidence}
              onChange={(e) => {
                const selectedCountry = e.target.value;
                setFieldValue("countryOfResidence", selectedCountry);
                setFieldValue("stateOfOrigin", "");
                setFieldValue("lga", "");
                setFieldValue("mobileNumber", "");
                setFormData((prev) => ({
                  ...prev,
                  countryOfResidence: selectedCountry,
                  stateOfOrigin: "",
                  lga: "",
                  mobileNumber: "",
                }));
              }}
              onBlur={handleBlur}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          {touched.countryOfResidence && errors.countryOfResidence && (
            <div className="text-xs text-red-500 mt-1">
              {errors.countryOfResidence}
            </div>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="stateOfOrigin"
            className="block text-sm text-black/70 font-semibold"
          >
            State {values.purchase_type === "individual" && " of Origin"}
          </label>
          <div className={parentClass}>
            <FaMapMarkerAlt className="text-primary" />
            <select
              name="stateOfOrigin"
              id="stateOfOrigin"
              className={inputClass}
              disabled={!values.countryOfResidence || loading.states}
              value={values.stateOfOrigin}
              onChange={(e) => {
                const selectedState = e.target.value;
                setFieldValue("stateOfOrigin", selectedState);
                setFieldValue("lga", "");
                setFormData((prev) => ({
                  ...prev,
                  stateOfOrigin: selectedState,
                  lga: "",
                }));
              }}
              onBlur={handleBlur}
            >
              <option value="">
                {loading.states
                  ? "Loading..."
                  : !values.countryOfResidence
                    ? "Select country first"
                    : "Select State"}
              </option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          {touched.stateOfOrigin && errors.stateOfOrigin && (
            <div className="text-xs text-red-500 mt-1">
              {errors.stateOfOrigin}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="lga"
          className="block text-sm text-black/70 font-semibold"
        >
          Town, Village, Local Government (LGA)
        </label>
        <div className={parentClass}>
          <FaMapMarkerAlt className="text-primary" />
          <input
            type="text"
            name="lga"
            id="lga"
            placeholder="Town, Village, LGA (separate with commas)"
            value={values.lga}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
          />
        </div>
        {touched.lga && errors.lga && (
          <div className="text-xs text-red-500 mt-1">{errors.lga}</div>
        )}
      </div>

      {/* INDIVIDUAL CONTACT DETAILS */}
      {values.purchase_type === "individual" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black/70"
            >
              Email Address
            </label>
            <div className={parentClass}>
              <BiEnvelope className="text-primary" />
              <input
                type="email"
                name="email"
                id="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass}
              />
            </div>
            {touched.email && errors.email && (
              <div className="text-xs text-red-500 mt-1">
                {errors.email}
              </div>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-medium text-black/70"
            >
              Mobile Number
            </label>
            <div className={parentClass}>
              <FaPhoneAlt className="text-primary" />
              <input
                type="tel"
                name="mobileNumber"
                id="mobileNumber"
                value={values.mobileNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder={getMobilePlaceholder(values.countryOfResidence)}
              />
            </div>
            {touched.mobileNumber && errors.mobileNumber && (
              <div className="text-xs text-red-500 mt-1">
                {errors.mobileNumber}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full flex justify-between mt-6">
        {prevSection && (
          <button
            type="button"
            onClick={prevSection}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
          >
            Back to Selection
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/80 ml-auto font-semibold"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Section1;
