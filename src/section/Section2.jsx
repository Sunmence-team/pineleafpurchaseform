import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { BiEnvelope } from "react-icons/bi";
import { FaUser, FaAddressCard, FaPhoneAlt } from "react-icons/fa";

const Section2 = ({ formData, setFormData, prevSection, nextSection }) => {
  // const inputClass = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 pl-10 bg-white";
  const parentClass =
    "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[50px] px-2 flex items-center bg-white";
  const inputClass = "w-full focus:outline-0 text-sm h-full indent-2";

  const isIndividual = formData.purchase_type === "individual";

  const standardRelationships = isIndividual
    ? ["brother", "sister", "father", "mother", "husband", "hussband", "wife", "son", "daughter"]
    : ["board member / trustee", "board member", "trustee", "president / chairman", "president", "chairman", "general secretary", "representative"];

  const isStandard = formData.nextOfKinRelationship
    ? standardRelationships.includes(
        formData.nextOfKinRelationship.toLowerCase(),
      )
    : true;

  const initialRelationship = formData.nextOfKinRelationship
    ? isStandard
      ? formData.nextOfKinRelationship
      : "others"
    : "";
  const initialRelationshipOther =
    formData.nextOfKinRelationship && !isStandard
      ? formData.nextOfKinRelationship
      : "";

  const validationSchema = Yup.object({
    nextOfKinFullName: Yup.string().required("Full name is required"),
    nextOfKinRelationship: Yup.string().required("This field is required"),
    nextOfKinRelationshipOther: Yup.string().when(
      ["nextOfKinRelationship"],
      ([nextOfKinRelationship], schema) => {
        return nextOfKinRelationship === "others"
          ? schema.required("Please specify role/relationship")
          : schema.nullable();
      },
    ),
    nextOfKinMobileNumber: Yup.string().required("Mobile number is required"),
    nextOfKinEmail: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  return (
    <Formik
      initialValues={{
        nextOfKinFullName: formData.nextOfKinFullName || "",
        nextOfKinRelationship: initialRelationship,
        nextOfKinRelationshipOther: initialRelationshipOther,
        nextOfKinMobileNumber: formData.nextOfKinMobileNumber || "",
        nextOfKinEmail: formData.nextOfKinEmail || "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        const finalRelationship =
          values.nextOfKinRelationship === "others"
            ? values.nextOfKinRelationshipOther
            : values.nextOfKinRelationship;
        setFormData({
          ...formData,
          ...values,
          nextOfKinRelationship: finalRelationship,
        });
        nextSection();
      }}
    >
      {({ values }) => (
        <Form className="space-y-6">
          <p className="font-semibold text-xl md:text-2xl text-center">
            {isIndividual ? "Section 2: Next of Kin Details" : "Section 2: Representative / Trustee Details"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative w-full">
              <label
                htmlFor="nextOfKinFullName"
                className="block text-sm font-medium text-black/70 font-semibold"
              >
                {isIndividual ? "Full Name" : "Representative / Trustee Full Name"}
              </label>
              <div className={parentClass}>
                <FaUser className="text-secClr" />
                <Field
                  type="text"
                  name="nextOfKinFullName"
                  id="nextOfKinFullName"
                  placeholder={isIndividual ? "Enter Full Name" : "e.g. Michael Smith"}
                  className={inputClass}
                />
              </div>
              <ErrorMessage
                name="nextOfKinFullName"
                component="div"
                className="text-xs text-red-500 mt-1"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="nextOfKinMobileNumber"
                className="block text-sm font-medium text-black/70 font-semibold"
              >
                {isIndividual ? "Mobile Number" : "Representative Contact Mobile"}
              </label>
              <div className={parentClass}>
                <FaPhoneAlt className="text-secClr" />
                <Field
                  type="tel"
                  name="nextOfKinMobileNumber"
                  id="nextOfKinMobileNumber"
                  placeholder="e.g. +234XXXXXXXXXX"
                  className={inputClass}
                />
              </div>
              <ErrorMessage
                name="nextOfKinMobileNumber"
                component="div"
                className="text-xs text-red-500 mt-1"
              />
            </div>
            <div className="relative md:col-span-2">
              <label
                htmlFor="nextOfKinEmail"
                className="block text-sm font-medium text-black/70 font-semibold"
              >
                {isIndividual ? "Email Address" : "Representative Contact Email"}
              </label>
              <div className={parentClass}>
                <BiEnvelope className="text-secClr" />
                <Field
                  type="email"
                  name="nextOfKinEmail"
                  id="nextOfKinEmail"
                  placeholder="e.g. representative@email.com"
                  className={inputClass}
                />
              </div>
              <ErrorMessage
                name="nextOfKinEmail"
                component="div"
                className="text-xs text-red-500 mt-1"
              />
            </div>
            <div className="relative w-full md:col-span-2">
              <label
                htmlFor="nextOfKinRelationship"
                className="block text-sm font-medium text-black/70 font-semibold"
              >
                {isIndividual ? "Relationship" : "Role / Designation"}
              </label>
              <div className={parentClass}>
                <FaUser className="text-secClr" />
                <Field
                  as="select"
                  name="nextOfKinRelationship"
                  id="nextOfKinRelationship"
                  className={inputClass}
                >
                  <option value="" disabled>
                    {isIndividual ? "Select Relationship" : "Select Role / Designation"}
                  </option>
                  {isIndividual ? (
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
                      <option value="Board Member / Trustee">Board Member / Trustee</option>
                      <option value="President / Chairman">President / Chairman</option>
                      <option value="General Secretary">General Secretary</option>
                      <option value="Representative">Representative</option>
                    </>
                  )}
                  <option value="others">Others</option>
                </Field>
              </div>
              <ErrorMessage
                name="nextOfKinRelationship"
                component="div"
                className="text-xs text-red-500 mt-1"
              />
            </div>
            {values.nextOfKinRelationship === "others" && (
              <div className="relative w-full md:col-span-2">
                <label
                  htmlFor="nextOfKinRelationshipOther"
                  className="block text-sm font-medium text-black/70 font-semibold"
                >
                  {isIndividual ? "Specify Relationship" : "Specify Role / Designation"}
                </label>
                <div className={parentClass}>
                  <FaUser className="text-secClr" />
                  <Field
                    type="text"
                    name="nextOfKinRelationshipOther"
                    id="nextOfKinRelationshipOther"
                    placeholder={isIndividual ? "Enter relationship" : "Enter designation"}
                    className={inputClass}
                  />
                </div>
                <ErrorMessage
                  name="nextOfKinRelationshipOther"
                  component="div"
                  className="text-xs text-red-500 mt-1"
                />
              </div>
            )}
          </div>

          <div className="w-full flex justify-between mt-6">
            <button
              type="button"
              onClick={prevSection}
              className="px-4 py-2 bg-gray-200 text-black/80 rounded-md hover:bg-gray-300 font-semibold"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-secClr text-white rounded-md hover:bg-secClr/80 font-semibold"
            >
              Next
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Section2;
