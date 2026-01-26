import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getCountryCallingCode, isValidPhoneNumber } from 'libphonenumber-js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BiBriefcase, BiEnvelope, BiGlobe } from 'react-icons/bi';
import { FaUser, FaAddressCard, FaCalendarAlt, FaFlag, FaVenusMars, FaMapMarkerAlt, FaLanguage, FaPhoneAlt } from 'react-icons/fa';
import { MdTitle } from 'react-icons/md';
import { toast } from 'sonner';

const COUNTRY_URL = import.meta.env.VITE_COUNTRY_BASE_URL;

const Section1 = ({ formData, setFormData, nextSection }) => {
  const [imagePreview, setImagePreview] = useState(formData.image ? URL.createObjectURL(formData.image) : null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
  });
  const [error, setError] = useState(null);
  const [countryCodeMap, setCountryCodeMap] = useState({});
  const [countryIdMap, setCountryIdMap] = useState({});

  const parentClass = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[50px] px-2 flex items-center bg-white";
  const inputClass = "w-full focus:outline-0 text-sm h-full indent-2";

  // Fetch countries and ISO codes on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(prev => ({ ...prev, countries: true }));
      setError(null);

      try {
         const response = await fetch(`${COUNTRY_URL}/api/countries`);
        const result = await response.json();

        if (!result || result.length === 0) {
          throw new Error('No countries found');
        }

        const countryList = result
          .map(c => ({ name: c.name, id: c.id, iso2: c.iso2 }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const codeMap = {};
        const idMap = {};

        result.forEach(c => {
          codeMap[c.name] = c.iso2;   // ISO code for phone validation
          idMap[c.name] = c.id;       // ID for states API
        });

        setCountries(countryList.map(c => c.name));
        setCountryCodeMap(codeMap);
        setCountryIdMap(idMap);

      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again later.');
        toast.error('Failed to load countries.');
      } finally {
        setLoading(prev => ({ ...prev, countries: false }));
      }
    };

    fetchCountries();
  }, []);

  // Fetch states when countryOfResidence changes
  useEffect(() => {
    if (formData.countryOfResidence) {
      const fetchStates = async () => {
        setLoading((prev) => ({ ...prev, states: true }));
        setError(null);
        const countryId = countryIdMap[formData.countryOfResidence];
        try {
          const response = await fetch(`${COUNTRY_URL}/api/countries/${countryId}/states`);
          const result = await response.json();
          if (result.error) throw new Error(result.msg);

          const stateList = result?.map((s) => s.name) || [];
          setStates(stateList.sort());
        } catch (err) {
          console.error('Error fetching states:', err);
          setError('Failed to load states for selected country.');
          toast.error('Failed to load states. Please select a valid country.');
          setStates([]);
        } finally {
          setLoading((prev) => ({ ...prev, states: false }));
        }
      };
      fetchStates();
    } else {
      setStates([]);
    }
  }, [formData.countryOfResidence]);

  // Get dynamic placeholder for mobile number
  const getMobilePlaceholder = () => {
    const country = formData.countryOfResidence;
    if (!country || !countryCodeMap[country]) return 'Enter phone number';
    const countryCode = getCountryCallingCode(countryCodeMap[country]);
    return `+${countryCode} XXXXXXXXXX`;
  };

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
    stateOfOrigin: Yup.string().required('State of origin is required'),
    // lga: Yup.string().required('Local government (LGA) is required'),
    lga: Yup.string()
    .required('Town, Village, and Local Government (LGA) are required')
    .test(
        'has-three-non-empty-entries',
        'Please enter three distinct, non-empty values (Town, Village, LGA) separated by commas.',
        (value) => {
            if (!value) {
                return false;
            }

            const entries = value.split(',');

            if (entries.length !== 3) {
                return false;
            }

            const allValid = entries.every(entry => entry.trim().length > 0);

            return allValid;
        }
    ),
    occupation: Yup.string().nullable(),
    countryOfResidence: Yup.string().required('Country of residence is required'),
    language: Yup.string().nullable(),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    mobileNumber: Yup.string()
      .required('Mobile number is required')
      .test('valid-phone', 'Must be a valid phone number for the selected country', function (value) {
        const { countryOfResidence } = this.parent;
        if (!countryOfResidence || !value) return false;
        const isoCode = countryCodeMap[countryOfResidence];
        if (!isoCode) return false;
        return isValidPhoneNumber(value, isoCode);
      }),
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
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
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
                      accept="image/png,image/jpeg,image/gif"
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
                            reader.readAsDataURL(file);
                          } else {
                            setImagePreview(null);
                          }
                        }}
                        accept="image/png,image/jpeg,image/gif"
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
              <div className={parentClass}>
                <MdTitle className={`text-secClr`} />
                <Field 
                  as="select"
                  id="title"
                  name="title"
                  className={inputClass}
                >
                  {[
                    { value: '', label: 'Select', disabled: true, key: 'title-placeholder' },
                    { value: 'Mr', label: 'Mr', key: 'title-mr' },
                    { value: 'Mrs', label: 'Mrs', key: 'title-mrs' },
                    { value: 'Miss', label: 'Miss', key: 'title-miss' },
                  ].map(({ key, value, label, disabled }) => (
                    <option key={key} value={value} disabled={disabled}>
                      {label}
                    </option>
                  ))}
                </Field>
              </div>
              <ErrorMessage name="title" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <label htmlFor="firstName" className="block text-sm font-medium text-black/70">First Name</label>
              <div className={parentClass}>
                <FaUser className={`text-secClr`} />
                <Field
                  type="text"
                  name="firstName"
                  id="firstName"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="firstName" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <label htmlFor="middleName" className="block text-sm font-medium text-black/70">Middle Name</label>
              <div className={parentClass}>
                <FaUser className={`text-secClr`} />
                <Field
                  type="text"
                  name="middleName"
                  id="middleName"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="middleName" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <label htmlFor="lastName" className="block text-sm font-medium text-black/70">Last Name</label>
              <div className={parentClass}>
                <FaUser className={`text-secClr`} />
                <Field
                  type="text"
                  name="lastName"
                  id="lastName"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="lastName" component="div" className="text-xs text-red-500 mt-1" />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="address" className="block text-sm font-medium text-black/70">Address</label>
            <div className={parentClass}>
              <FaAddressCard className={`text-secClr`} />
              <Field
                type="text"
                name="address"
                id="address"
                className={inputClass}
              />
            </div>
            <ErrorMessage name="address" component="div" className="text-xs text-red-500 mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-black/70">Date of Birth</label>
              <div className={parentClass}>
                <FaCalendarAlt className={`text-secClr`} />
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
              </div>
              <ErrorMessage name="dateOfBirth" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <label htmlFor="nationality" className="block text-sm font-medium text-black/70">Nationality</label>
              <div className={parentClass}>
                <FaFlag className={`text-secClr`} />
                <Field
                  type="text"
                  name="nationality"
                  id="nationality"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="nationality" component="div" className="text-xs text-red-500 mt-1" />
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
                  <div className={parentClass}>
                    <MdTitle className={`text-secClr`} />
                    <Field
                      as="select"
                      id="spouseTitle"
                      name="spouseTitle"
                      className={inputClass}
                    >
                      {[
                        { value: '', label: 'Select', disabled: true, key: 'spouse-title-placeholder' },
                        { value: 'Mr', label: 'Mr', key: 'spouse-title-mr' },
                        { value: 'Mrs', label: 'Mrs', key: 'spouse-title-mrs' },
                        { value: 'Miss', label: 'Miss', key: 'spouse-title-miss' },
                      ].map(({ key, value, label, disabled }) => (
                        <option key={key} value={value} disabled={disabled}>
                          {label}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <ErrorMessage name="spouseTitle" component="div" className="text-xs text-red-500 mt-1" />
                </div>
                <div className="relative">
                  <label htmlFor="spouseFirstName" className="block text-sm font-medium text-black/70">First Name</label>
                  <div className={parentClass}>
                    <FaUser className={`text-secClr`} />
                    <Field
                      type="text"
                      name="spouseFirstName"
                      id="spouseFirstName"
                      className={inputClass}
                    />
                  </div>
                  <ErrorMessage name="spouseFirstName" component="div" className="text-xs text-red-500 mt-1" />
                </div>
                <div className="relative">
                  <label htmlFor="spouseMiddleName" className="block text-sm font-medium text-black/70">Middle Name</label>
                  <div className={parentClass}>
                    <FaUser className={`text-secClr`} />
                    <Field
                      type="text"
                      name="spouseMiddleName"
                      id="spouseMiddleName"
                      className={inputClass}
                    />
                  </div>
                  <ErrorMessage name="spouseMiddleName" component="div" className="text-xs text-red-500 mt-1" />
                </div>
                <div className="relative">
                  <label htmlFor="spouseLastName" className="block text-sm font-medium text-black/70">Last Name</label>
                  <div className={parentClass}>
                    <FaUser className={`text-secClr`} />
                    <Field
                      type="text"
                      name="spouseLastName"
                      id="spouseLastName"
                      className={inputClass}
                    />
                  </div>
                  <ErrorMessage name="spouseLastName" component="div" className="text-xs text-red-500 mt-1" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="countryOfResidence" className="block text-sm font-medium text-black/70">Country of Residence</label>
              <div className={parentClass}>
                <BiGlobe className={`text-secClr`} />
                <Field
                  as="select"
                  name="countryOfResidence"
                  id="countryOfResidence"
                  className={inputClass}
                  onChange={(e) => {
                    const selectedCountry = e.target.value;
                    setFieldValue('countryOfResidence', selectedCountry);
                    setFieldValue('stateOfOrigin', '');
                    setFieldValue('lga', '');
                    setFieldValue('mobileNumber', '');

                    setFormData({
                      ...formData,
                      countryOfResidence: selectedCountry,
                      stateOfOrigin: '',
                      lga: '',
                      mobileNumber: ''
                    });
                  }}
                >
                  {[
                    { value: '', label: loading.countries ? 'Loading countries...' : 'Select Country', disabled: true, key: 'country-placeholder' },
                    ...countries.map((country) => ({ value: country, label: country, key: country })),
                  ].map(({ key, value, label, disabled }) => (
                    <option key={key} value={value} disabled={disabled}>
                      {label}
                    </option>
                  ))}
                </Field>
              </div>
              <ErrorMessage name="countryOfResidence" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <label htmlFor="stateOfOrigin" className="block text-sm font-medium text-black/70">State of Origin</label>
              <div className={parentClass}>
                <FaMapMarkerAlt className={`text-secClr`} />
                <Field
                  as="select"
                  name="stateOfOrigin"
                  id="stateOfOrigin"
                  className={inputClass}
                  onChange={(e) => {
                    setFieldValue('stateOfOrigin', e.target.value);
                    setFieldValue('lga', '');
                    setFormData({ ...formData, stateOfOrigin: e.target.value, lga: '' });
                  }}
                  disabled={!formData.countryOfResidence || loading.states}
                >
                  {[
                    {
                      value: '',
                      label: loading.states
                        ? 'Loading states...'
                        : !formData.countryOfResidence
                        ? 'Select country first'
                        : states.length === 0
                        ? 'No states available'
                        : 'Select State',
                      disabled: true,
                      key: 'state-placeholder',
                    },
                    ...states.map((state) => ({ value: state, label: state, key: state })),
                  ].map(({ key, value, label, disabled }) => (
                    <option key={key} value={value} disabled={disabled}>
                      {label}
                    </option>
                  ))}
                </Field>
              </div>
              <ErrorMessage name="stateOfOrigin" component="div" className="text-xs text-red-500 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="lga" className="block text-sm font-medium text-black/70">Town, Village, Local Government (LGA)</label>
              <div className={parentClass}>
                <FaMapMarkerAlt className={`text-secClr`} />
                <Field
                  type="text"
                  name="lga"
                  id="lga"
                  placeholder="Seperate the 3 entries with commas"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="lga" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <label htmlFor="occupation" className="block text-sm font-medium text-black/70">Occupation</label>
              <div className={parentClass}>
                <BiBriefcase className={`text-secClr`} />
                <Field
                  type="text"
                  name="occupation"
                  id="occupation"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="occupation" component="div" className="text-xs text-red-500 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="language" className="block text-sm font-medium text-black/70">Language</label>
              <div className={parentClass}>
                <FaLanguage className={`text-secClr`} />
                <Field
                  type="text"
                  name="language"
                  id="language"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="language" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-black/70">Email Address</label>
              <div className={parentClass}>
                <BiEnvelope className={`text-secClr`} />
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="email" component="div" className="text-xs text-red-500 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-black/70">Mobile Number</label>
              <div className={parentClass}>
                <FaPhoneAlt className={`3 text-secClr`} />
                <Field
                  type="tel"
                  name="mobileNumber"
                  id="mobileNumber"
                  className={inputClass}
                  placeholder={getMobilePlaceholder()}
                />
              </div>
              <ErrorMessage name="mobileNumber" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <label htmlFor="telephoneNumber" className="block text-sm font-medium text-black/70">Telephone Number</label>
              <div className={parentClass}>
                <FaPhoneAlt className={`text-secClr`} />
                <Field
                  type="tel"
                  name="telephoneNumber"
                  id="telephoneNumber"
                  className={inputClass}
                />
              </div>
              <ErrorMessage name="telephoneNumber" component="div" className="text-xs text-red-500 mt-1" />
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