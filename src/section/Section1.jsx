import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BiBriefcase, BiEnvelope, BiGlobe } from 'react-icons/bi';
import { FaUser, FaAddressCard, FaCalendarAlt, FaFlag, FaVenusMars, FaMapMarkerAlt, FaLanguage, FaPhoneAlt } from 'react-icons/fa';
import { MdTitle } from 'react-icons/md';

const Section1 = ({ formData, setFormData, nextSection }) => {
  const [imagePreview, setImagePreview] = useState(formData.image || null);

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-3 px-4 pl-10 bg-white";

  const validationSchema = Yup.object({
    image: Yup.mixed()
      .test('fileSize', 'File size is too large, max 10MB', (value) => {
        return !value || (value && value.size <= 10 * 1024 * 1024);
      })
      .test('fileType', 'Unsupported file format, use PNG, JPG, or GIF', (value) => {
        return !value || (value && ['image/png', 'image/jpeg', 'image/gif'].includes(value.type));
      }),
    title: Yup.string().nullable(),
    firstName: Yup.string().required('First name is required'),
    middleName: Yup.string().nullable(),
    lastName: Yup.string().required('Last name is required'),
    address: Yup.string().required('Address is required'),
    dateOfBirth: Yup.date()
      .required('Date of birth is required')
      .nullable()
      .typeError('Invalid date format, use DD-MM-YYYY'),
    nationality: Yup.string().required('Nationality is required'),
    maritalStatus: Yup.string().required('Marital status is required'),
    gender: Yup.string().required('Gender is required'),
    spouseTitle: Yup.string().when('maritalStatus', (maritalStatus, schema) => {
      return maritalStatus === 'Married' ? schema.required('Spouse title is required') : schema.nullable();
    }),
    spouseFirstName: Yup.string().when('maritalStatus', (maritalStatus, schema) => {
      return maritalStatus === 'Married' ? schema.required('Spouse first name is required') : schema.nullable();
    }),
    spouseMiddleName: Yup.string().when('maritalStatus', (maritalStatus, schema) => {
      return maritalStatus === 'Married' ? schema.nullable() : schema.nullable();
    }),
    spouseLastName: Yup.string().when('maritalStatus', (maritalStatus, schema) => {
      return maritalStatus === 'Married' ? schema.required('Spouse last name is required') : schema.nullable();
    }),
    stateOfOrigin: Yup.string().nullable(),
    lga: Yup.string().nullable(),
    occupation: Yup.string().nullable(),
    countryOfResidence: Yup.string().nullable(),
    language: Yup.string().nullable(),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    mobileNumber: Yup.string().required('Mobile number is required'),
    telephoneNumber: Yup.string().nullable(),
  });

  return (
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        setFormData({ ...formData, ...values });
        nextSection();
      }}
    >
      {({ setFieldValue, values }) => (
        <Form className="space-y-6">
          <p className="font-semibold text-xl md:text-2xl text-center">Section 1: Client's Details</p>
          <div className="w-full">
            <label htmlFor="image" className="block text-sm font-medium text-black/70">Upload Image</label>
            <div className="mt-2 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-secClr/50 border-dashed rounded-md relative">
              {imagePreview ? (
                <div className="flex flex-col items-center space-y-3">
                  <img
                    src={imagePreview}
                    alt="Uploaded Preview"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300 shadow-sm"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer px-3 py-1 bg-secClr text-white text-sm rounded-md hover:bg-secClr/80"
                  >
                    Re-upload
                    <input
                      id="image"
                      name="image"
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFieldValue('image', file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      accept="image/*"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-1 text-center flex flex-col items-center">
                  <svg
                    className="mx-auto h-12 w-12 text-secClr"
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
                      className="relative cursor-pointer bg-white rounded-md font-medium text-secClr hover:text-secClr flex"
                    >
                      <span className="text-center">Upload a file</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFieldValue('image', file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result);
                            };
                            readAsDataURL(file);
                          } else {
                            setImagePreview(null);
                          }
                        }}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  <ErrorMessage
                    name="image"
                    component="div"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label htmlFor="title" className="block text-sm font-medium text-black/70">Title</label>
              <div className="relative">
                <MdTitle className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  as="select"
                  id="title"
                  name="title"
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                </Field>
                <ErrorMessage name="title" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="firstName" className="block text-sm font-medium text-black/70">First Name</label>
              <div className="relative">
                <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="firstName"
                  id="firstName"
                  className={inputClass}
                />
                <ErrorMessage name="firstName" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="middleName" className="block text-sm font-medium text-black/70">Middle Name</label>
              <div className="relative">
                <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="middleName"
                  id="middleName"
                  className={inputClass}
                />
                <ErrorMessage name="middleName" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="lastName" className="block text-sm font-medium text-black/70">Last Name</label>
              <div className="relative">
                <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="lastName"
                  id="lastName"
                  className={inputClass}
                />
                <ErrorMessage name="lastName" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="address" className="block text-sm font-medium text-black/70">Address</label>
            <div className="relative">
              <FaAddressCard className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
              <Field
                type="text"
                name="address"
                id="address"
                className={inputClass}
              />
              <ErrorMessage name="address" component="div" className="text-xs text-red-500 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-black/70">Date of Birth</label>
              <div className="relative">
                <FaCalendarAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr z-10" />
                <DatePicker
                  selected={values.dateOfBirth}
                  onChange={(date) => setFieldValue('dateOfBirth', date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="DD-MM-YYYY"
                  className={inputClass}
                  showYearDropdown
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                />
                <ErrorMessage name="dateOfBirth" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="nationality" className="block text-sm font-medium text-black/70">Nationality</label>
              <div className="relative">
                <FaFlag className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="nationality"
                  id="nationality"
                  className={inputClass}
                />
                <ErrorMessage name="nationality" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black/70">Marital Status</label>
              <div className="mt-2 flex gap-4">
                {['Single', 'Married', 'Divorced'].map((status) => (
                  <label key={status} className="inline-flex items-center">
                    <Field
                      type="radio"
                      name="maritalStatus"
                      value={status}
                      className="form-radio h-4 w-4 text-secClr"
                    />
                    <span className="ml-2 text-sm text-black/70">{status}</span>
                  </label>
                ))}
              </div>
              <ErrorMessage name="maritalStatus" component="div" className="text-xs text-red-500 mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black/70">Gender</label>
              <div className="mt-2 flex gap-4">
                {['Male', 'Female'].map((gender) => (
                  <label key={gender} className="inline-flex items-center">
                    <Field
                      type="radio"
                      name="gender"
                      value={gender}
                      className="form-radio h-4 w-4 text-secClr"
                    />
                    <span className="ml-2 text-sm text-black/70">{gender}</span>
                  </label>
                ))}
              </div>
              <ErrorMessage name="gender" component="div" className="text-xs text-red-500 mt-1" />
            </div>
          </div>

          {values.maritalStatus === 'Married' && (
            <div>
              <label className="block text-sm font-medium text-black/70">Spouse Details</label>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-2">
                <div className="relative">
                  <label htmlFor="spouseTitle" className="block text-sm font-medium text-black/70">Title</label>
                  <div className="relative">
                    <MdTitle className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                    <Field
                      as="select"
                      id="spouseTitle"
                      name="spouseTitle"
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Miss">Miss</option>
                    </Field>
                    <ErrorMessage name="spouseTitle" component="div" className="text-xs text-red-500 mt-1" />
                  </div>
                </div>
                <div className="relative">
                  <label htmlFor="spouseFirstName" className="block text-sm font-medium text-black/70">First Name</label>
                  <div className="relative">
                    <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                    <Field
                      type="text"
                      name="spouseFirstName"
                      id="spouseFirstName"
                      className={inputClass}
                    />
                    <ErrorMessage name="spouseFirstName" component="div" className="text-xs text-red-500 mt-1" />
                  </div>
                </div>
                <div className="relative">
                  <label htmlFor="spouseMiddleName" className="block text-sm font-medium text-black/70">Middle Name</label>
                  <div className="relative">
                    <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                    <Field
                      type="text"
                      name="spouseMiddleName"
                      id="spouseMiddleName"
                      className={inputClass}
                    />
                    <ErrorMessage name="spouseMiddleName" component="div" className="text-xs text-red-500 mt-1" />
                  </div>
                </div>
                <div className="relative">
                  <label htmlFor="spouseLastName" className="block text-sm font-medium text-black/70">Last Name</label>
                  <div className="relative">
                    <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                    <Field
                      type="text"
                      name="spouseLastName"
                      id="spouseLastName"
                      className={inputClass}
                    />
                    <ErrorMessage name="spouseLastName" component="div" className="text-xs text-red-500 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="stateOfOrigin" className="block text-sm font-medium text-black/70">State of Origin</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="stateOfOrigin"
                  id="stateOfOrigin"
                  className={inputClass}
                />
                <ErrorMessage name="stateOfOrigin" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="lga" className="block text-sm font-medium text-black/70">Local Government (LGA)</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="lga"
                  id="lga"
                  className={inputClass}
                />
                <ErrorMessage name="lga" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="occupation" className="block text-sm font-medium text-black/70">Occupation</label>
              <div className="relative">
                <BiBriefcase className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="occupation"
                  id="occupation"
                  className={inputClass}
                />
                <ErrorMessage name="occupation" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="countryOfResidence" className="block text-sm font-medium text-black/70">Country of Residence</label>
              <div className="relative">
                <BiGlobe className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="countryOfResidence"
                  id="countryOfResidence"
                  className={inputClass}
                />
                <ErrorMessage name="countryOfResidence" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="language" className="block text-sm font-medium text-black/70">Language</label>
              <div className="relative">
                <FaLanguage className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="text"
                  name="language"
                  id="language"
                  className={inputClass}
                />
                <ErrorMessage name="language" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-black/70">Email Address</label>
              <div className="relative">
                <BiEnvelope className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={inputClass}
                />
                <ErrorMessage name="email" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-black/70">Mobile Number</label>
              <div className="relative">
                <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="tel"
                  name="mobileNumber"
                  id="mobileNumber"
                  className={inputClass}
                />
                <ErrorMessage name="mobileNumber" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="telephoneNumber" className="block text-sm font-medium text-black/70">Telephone Number</label>
              <div className="relative">
                <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="tel"
                  name="telephoneNumber"
                  id="telephoneNumber"
                  className={inputClass}
                />
                <ErrorMessage name="telephoneNumber" component="div" className="text-xs text-red-500 mt-1" />
              </div>
            </div>
          </div>

          <div className="w-full flex justify-end mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-secClr text-white rounded-md hover:bg-secClr/80"
            >
              Next
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Section1;