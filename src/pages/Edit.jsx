import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getCountryCallingCode, isValidPhoneNumber } from 'libphonenumber-js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import assets from '../assets/assests';
import { FaArrowLeft, FaUser, FaAddressCard, FaCalendarAlt, FaFlag, FaVenusMars, FaMapMarkerAlt, FaLanguage, FaPhoneAlt, FaEnvelope, FaMap } from 'react-icons/fa';
import { BiBriefcase } from 'react-icons/bi';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    lgas: false,
  });
  const [error, setError] = useState(null);
  const [countryCodeMap, setCountryCodeMap] = useState({});
  const [formData, setFormData] = useState(null);

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-3 px-4 pl-10 bg-white";

  // Fetch countries and ISO codes on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading((prev) => ({ ...prev, countries: true }));
      setError(null);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
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
        // toast.success('Countries loaded successfully!');
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again later.');
        toast.error('Failed to load countries.');
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
          const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: formData.countryOfResidence }),
          });
          const result = await response.json();
          if (result.error) throw new Error(result.msg);

          const stateList = result.data?.states?.map((s) => s.name) || [];
          setStates(stateList.sort());
          setLgas([]);
        } catch (err) {
          console.error('Error fetching states:', err);
          setError('Failed to load states for selected country.');
          toast.error('Failed to load states. Please select a valid country.');
          setStates([]);
          setLgas([]);
        } finally {
          setLoading((prev) => ({ ...prev, states: false }));
        }
      };
      fetchStates();
    } else {
      setStates([]);
      setLgas([]);
    }
  }, [formData?.countryOfResidence, formData]);

  // Fetch LGAs when formData, countryOfResidence, and stateOfOrigin are available
  useEffect(() => {
    if (formData && formData.countryOfResidence && formData.stateOfOrigin) {
      const fetchLgas = async () => {
        setLoading((prev) => ({ ...prev, lgas: true }));
        setError(null);
        try {
          const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              country: formData.countryOfResidence,
              state: formData.stateOfOrigin,
            }),
          });
          const result = await response.json();
          if (result.error) throw new Error(result.msg);

          setLgas(result.data.sort());
        } catch (err) {
          console.error('Error fetching LGAs:', err);
          setError('Failed to load local governments for selected state.');
          toast.error('Failed to load local governments. Please select a valid state.');
          setLgas([]);
        } finally {
          setLoading((prev) => ({ ...prev, lgas: false }));
        }
      };
      fetchLgas();
    } else {
      setLgas([]);
    }
  }, [formData?.stateOfOrigin, formData?.countryOfResidence, formData]);

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to edit client details.');
          navigate('/login');
          return;
        }

        const response = await axios.post(
          `${API_URL}/api/applications/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const application = response.data.data;
        if (!application) {
          throw new Error('No client data found in response');
        }

        setFormData({
          client_name: application.client_name || '',
          firstName: application.first_name || '',
          middleName: application.middle_name || '',
          lastName: application.last_name || '',
          address: application.address || '',
          dateOfBirth: application.dob ? new Date(application.dob) : null,
          nationality: application.nationality || '',
          maritalStatus: application.marital_status || '',
          gender: application.gender || '',
          spouseFirstName: application.first_name_of_spouse || '',
          spouseMiddleName: application.middle_name_of_spouse || '',
          spouseLastName: application.last_name_of_spouse || '',
          stateOfOrigin: application.state_of_origin || '',
          lga: application.lga || '',
          occupation: application.occupation || '',
          countryOfResidence: application.country || '',
          language: application.language || '',
          email: application.email || '',
          mobileNumber: application.mobile_number || '',
          telephoneNumber: application.telephone_number || '',
          nextOfKinFullName: application.next_of_kin_full_name || '',
          nextOfKinAddress: application.next_of_kin_address || '',
          nextOfKinMobileNumber: application.next_of_kin_mobile_number || '',
          nextOfKinEmail: application.next_of_kin_email || '',
          clientDeclarationLandPrice: application.land_price || '',
          clientDeclarationNumberOfPlots: application.number_of_plot || '',
          clientDeclarationSiteLocation: application.site_location || '',
          clientDeclarationPlotNumber: application.plot_number || '',
          branches: application.branches || '',
          clientDeclarationDate: application.declaration_date ? new Date(application.declaration_date) : null,
          clientDeclarationClientName: application.declaration_name || '',
          referralFullName: application.referral_name || '',
          referralMobileNumber: application.referral_number || '',
          referralDate: application.referral_date ? new Date(application.referral_date) : null,
          referralEmail: application.referral_email || '',
        });

        toast.success('Client data loaded for editing!');
      } catch (err) {
        console.error('Error fetching client:', err);
        toast.error('Failed to load client data: ' + (err.message || 'Unknown error'));
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchClient();
  }, [id, navigate]);

  // Get dynamic placeholder for phone numbers
  const getMobilePlaceholder = () => {
    const country = formData?.countryOfResidence;
    if (!country || !countryCodeMap[country]) return 'Enter phone number';
    const countryCode = getCountryCallingCode(countryCodeMap[country]);
    return `+${countryCode} XXXXXXXXXX`;
  };

  const validationSchema = Yup.object({
    client_name: Yup.string().required('Client name is required'),
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
    spouseFirstName: Yup.string().when('maritalStatus', (maritalStatus, schema) => {
      return maritalStatus === 'Married' ? schema.required('Spouse first name is required') : schema.nullable();
    }),
    spouseMiddleName: Yup.string().nullable(),
    spouseLastName: Yup.string().when('maritalStatus', (maritalStatus, schema) => {
      return maritalStatus === 'Married' ? schema.required('Spouse last name is required') : schema.nullable();
    }),
    stateOfOrigin: Yup.string().required('State of origin is required'),
    lga: Yup.string().required('Local government (LGA) is required'),
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
    nextOfKinFullName: Yup.string().required('Next of kin full name is required'),
    nextOfKinAddress: Yup.string().required('Next of kin address is required'),
    nextOfKinMobileNumber: Yup.string()
      .required('Next of kin mobile number is required')
      .test('valid-phone', 'Must be a valid phone number for the selected country', function (value) {
        const { countryOfResidence } = this.parent;
        if (!countryOfResidence || !value) return false;
        const isoCode = countryCodeMap[countryOfResidence];
        if (!isoCode) return false;
        return isValidPhoneNumber(value, isoCode);
      }),
    nextOfKinEmail: Yup.string().email('Invalid email address').nullable(),
    clientDeclarationLandPrice: Yup.string().required('Land price is required'),
    clientDeclarationNumberOfPlots: Yup.string().required('Number of plots is required'),
    clientDeclarationSiteLocation: Yup.string().required('Site location is required'),
    clientDeclarationPlotNumber: Yup.string().required('Plot number is required'),
    branches: Yup.string().required('Branch is required'),
    clientDeclarationDate: Yup.date()
      .required('Declaration date is required')
      .nullable()
      .typeError('Invalid date format, use DD-MM-YYYY'),
    clientDeclarationClientName: Yup.string().required('Declaration client name is required'),
    referralFullName: Yup.string().nullable(),
    referralMobileNumber: Yup.string().when('referralFullName', (referralFullName, schema) => {
      return referralFullName ? schema
        .required('Referral mobile number is required')
        .test('valid-phone', 'Must be a valid phone number for the selected country', function (value) {
          const { countryOfResidence } = this.parent;
          if (!countryOfResidence || !value) return false;
          const isoCode = countryCodeMap[countryOfResidence];
          if (!isoCode) return false;
          return isValidPhoneNumber(value, isoCode);
        }) : schema.nullable();
    }),
    referralEmail: Yup.string().email('Invalid email address').nullable(),
    referralDate: Yup.date().when('referralFullName', (referralFullName, schema) => {
      return referralFullName ? schema
        .required('Referral date is required')
        .nullable()
        .typeError('Invalid date format, use DD-MM-YYYY') : schema.nullable();
    }),
  });

  if (!formData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secClr"></div>
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
              onClick={() => navigate("/dashboard")}
              className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Back to Dashboard"
            >
              <FaArrowLeft className="text-gray-700 text-base md:text-lg" />
            </button>
            <img src={assets.logo} className="w-8 h-8 md:w-12 md:h-12" alt="Pineleaf Estate Logo" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Client</h1>
          </div>
        </div>

        {/* Form */}
        <Formik
          initialValues={formData}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const toastId = toast.loading('Updating client details...');
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                toast.error('Please log in to submit the application.', { id: toastId });
                navigate('/login');
                return;
              }

              const formDataToSend = new FormData();
              formDataToSend.append('client_name', values.client_name || '');
              formDataToSend.append('first_name', values.firstName || '');
              formDataToSend.append('middle_name', values.middleName || '');
              formDataToSend.append('last_name', values.lastName || '');
              formDataToSend.append('address', values.address || '');
              formDataToSend.append('dob', values.dateOfBirth ? format(new Date(values.dateOfBirth), 'yyyy-MM-dd') : '');
              formDataToSend.append('nationality', values.nationality || '');
              formDataToSend.append('marital_status', values.maritalStatus || '');
              formDataToSend.append('gender', values.gender || '');
              if (values.maritalStatus === 'Married') {
                formDataToSend.append('first_name_of_spouse', values.spouseFirstName || '');
                formDataToSend.append('middle_name_of_spouse', values.spouseMiddleName || '');
                formDataToSend.append('last_name_of_spouse', values.spouseLastName || '');
              }
              formDataToSend.append('state_of_origin', values.stateOfOrigin || '');
              formDataToSend.append('lga', values.lga || '');
              formDataToSend.append('occupation', values.occupation || '');
              formDataToSend.append('country', values.countryOfResidence || '');
              formDataToSend.append('language', values.language || '');
              formDataToSend.append('email', values.email || '');
              formDataToSend.append('mobile_number', values.mobileNumber || '');
              formDataToSend.append('telephone_number', values.telephoneNumber || '');
              formDataToSend.append('next_of_kin_full_name', values.nextOfKinFullName || '');
              formDataToSend.append('next_of_kin_address', values.nextOfKinAddress || '');
              formDataToSend.append('next_of_kin_mobile_number', values.nextOfKinMobileNumber || '');
              formDataToSend.append('next_of_kin_email', values.nextOfKinEmail || '');
              formDataToSend.append('land_price', values.clientDeclarationLandPrice || '');
              formDataToSend.append('number_of_plot', values.clientDeclarationNumberOfPlots || '');
              formDataToSend.append('site_location', values.clientDeclarationSiteLocation || '');
              formDataToSend.append('plot_number', values.clientDeclarationPlotNumber || '');
              formDataToSend.append('branches', values.branches || '');
              formDataToSend.append('declaration_date', values.clientDeclarationDate ? format(new Date(values.clientDeclarationDate), 'yyyy-MM-dd') : '');
              formDataToSend.append('declaration_name', values.clientDeclarationClientName || '');
              formDataToSend.append('referral_name', values.referralFullName || '');
              formDataToSend.append('referral_number', values.referralMobileNumber || '');
              formDataToSend.append('referral_date', values.referralDate ? format(new Date(values.referralDate), 'yyyy-MM-dd') : '');
              formDataToSend.append('referral_email', values.referralEmail || '');

              console.log('FormData being sent to POST /api/update_applications:', id);
              for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}:`, value instanceof File ? value.name : value);
              }

              const response = await axios.post(`${API_URL}/api/update_applications/${id}`, formDataToSend, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token}`,
                },
              });

              console.log('API Response from POST /api/update_applications:', response.data);

              if (response.status === 200 || response.status === 201) {
                toast.success('Client details updated successfully!', { id: toastId });
                navigate('/dashboard');
              }
            } catch (err) {
              console.error('Error updating client:', err);
              if (axios.isAxiosError(err)) {
                if (err.code === 'ERR_NETWORK') {
                  toast.error('Network error: Unable to connect to the server.', { id: toastId });
                } else if (err.response?.status === 400) {
                  toast.error(err.response.data.message || 'Invalid data provided.', { id: toastId });
                } else if (err.response?.status === 401) {
                  toast.error('Unauthorized. Please log in again.', { id: toastId });
                  localStorage.removeItem('token');
                  navigate('/login');
                } else if (err.response?.status === 422) {
                  const errors = err.response.data.errors || {};
                  const errorMessages = Object.values(errors).flat().join('; ');
                  toast.error(errorMessages || 'Validation error.', { id: toastId });
                } else {
                  toast.error(err.response?.data?.message || 'Unexpected error occurred.', { id: toastId });
                }
              } else {
                toast.error('Unexpected error occurred. Please try again.', { id: toastId });
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form className="space-y-6 md:space-y-10">
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

              {/* Profile */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Profile</h3>
                <div className="space-y-4 w-full">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Client Name</label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="clientDeclarationClientName"
                        className={`${inputClass} ${errors.clientDeclarationClientName && touched.clientDeclarationClientName ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="clientDeclarationClientName" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="email"
                        name="email"
                        className={`${inputClass} ${errors.email && touched.email ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="email" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Mobile Number</label>
                    <div className="relative">
                      <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="tel"
                        name="mobileNumber"
                        className={`${inputClass} ${errors.mobileNumber && touched.mobileNumber ? 'border-red-500' : ''}`}
                        placeholder={getMobilePlaceholder()}
                      />
                      <ErrorMessage name="mobileNumber" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Nationality</label>
                    <div className="relative">
                      <FaFlag className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="nationality"
                        className={`${inputClass} ${errors.nationality && touched.nationality ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="nationality" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">First Name</label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="firstName"
                        className={`${inputClass} ${errors.firstName && touched.firstName ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="firstName" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Middle Name</label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="middleName"
                        className={`${inputClass} ${errors.middleName && touched.middleName ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="middleName" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Last Name</label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="lastName"
                        className={`${inputClass} ${errors.lastName && touched.lastName ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="lastName" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Gender</label>
                    <div className="relative">
                      <FaVenusMars className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        as="select"
                        name="gender"
                        className={`${inputClass} ${errors.gender && touched.gender ? 'border-red-500' : ''}`}
                      >
                        {[
                          { value: '', label: 'Select Gender', disabled: true, key: 'gender-placeholder' },
                          { value: 'Male', label: 'Male', key: 'gender-male' },
                          { value: 'Female', label: 'Female', key: 'gender-female' },
                          { value: 'Other', label: 'Other', key: 'gender-other' },
                        ].map(({ key, value, label, disabled }) => (
                          <option key={key} value={value} disabled={disabled}>
                            {label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="gender" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Date of Birth</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr z-10" />
                      <DatePicker
                        selected={values.dateOfBirth}
                        onChange={(date) => setFieldValue('dateOfBirth', date)}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className={`${inputClass} ${errors.dateOfBirth && touched.dateOfBirth ? 'border-red-500' : ''}`}
                        showYearDropdown
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                      />
                      <ErrorMessage name="dateOfBirth" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Marital Status</label>
                    <div className="relative">
                      <FaVenusMars className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        as="select"
                        name="maritalStatus"
                        className={`${inputClass} ${errors.maritalStatus && touched.maritalStatus ? 'border-red-500' : ''}`}
                      >
                        {[
                          { value: '', label: 'Select Marital Status', disabled: true, key: 'marital-status-placeholder' },
                          { value: 'Single', label: 'Single', key: 'marital-status-single' },
                          { value: 'Married', label: 'Married', key: 'marital-status-married' },
                          { value: 'Divorced', label: 'Divorced', key: 'marital-status-divorced' },
                          { value: 'Widowed', label: 'Widowed', key: 'marital-status-widowed' },
                        ].map(({ key, value, label, disabled }) => (
                          <option key={key} value={value} disabled={disabled}>
                            {label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="maritalStatus" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Country of Residence</label>
                    <div className="relative">
                      <FaMap className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        as="select"
                        name="countryOfResidence"
                        className={`${inputClass} ${errors.countryOfResidence && touched.countryOfResidence ? 'border-red-500' : ''}`}
                        onChange={(e) => {
                          setFieldValue('countryOfResidence', e.target.value);
                          setFieldValue('stateOfOrigin', '');
                          setFieldValue('lga', '');
                          setFieldValue('mobileNumber', '');
                          setFieldValue('nextOfKinMobileNumber', '');
                          setFieldValue('referralMobileNumber', '');
                          setFormData((prev) => ({
                            ...prev,
                            countryOfResidence: e.target.value,
                            stateOfOrigin: '',
                            lga: '',
                            mobileNumber: '',
                            nextOfKinMobileNumber: '',
                            referralMobileNumber: '',
                          }));
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
                      <ErrorMessage name="countryOfResidence" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">State of Origin</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        as="select"
                        name="stateOfOrigin"
                        className={`${inputClass} ${errors.stateOfOrigin && touched.stateOfOrigin ? 'border-red-500' : ''}`}
                        onChange={(e) => {
                          setFieldValue('stateOfOrigin', e.target.value);
                          setFieldValue('lga', '');
                          setFormData((prev) => ({
                            ...prev,
                            stateOfOrigin: e.target.value,
                            lga: '',
                          }));
                        }}
                        disabled={!values.countryOfResidence || loading.states}
                      >
                        {[
                          {
                            value: '',
                            label: loading.states
                              ? 'Loading states...'
                              : !values.countryOfResidence
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
                      <ErrorMessage name="stateOfOrigin" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Local Government (LGA)</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        as="select"
                        name="lga"
                        className={`${inputClass} ${errors.lga && touched.lga ? 'border-red-500' : ''}`}
                        disabled={!values.stateOfOrigin || loading.lgas}
                      >
                        {[
                          {
                            value: '',
                            label: loading.lgas
                              ? 'Loading LGAs...'
                              : !values.stateOfOrigin
                              ? 'Select state first'
                              : lgas.length === 0
                              ? 'No LGAs available'
                              : 'Select LGA',
                            disabled: true,
                            key: 'lga-placeholder',
                          },
                          ...lgas.map((lga) => ({ value: lga, label: lga, key: lga })),
                        ].map(({ key, value, label, disabled }) => (
                          <option key={key} value={value} disabled={disabled}>
                            {label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="lga" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Occupation</label>
                    <div className="relative">
                      <BiBriefcase className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="occupation"
                        className={`${inputClass} ${errors.occupation && touched.occupation ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="occupation" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Language</label>
                    <div className="relative">
                      <FaLanguage className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="language"
                        className={`${inputClass} ${errors.language && touched.language ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="language" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="md:col-span-2 relative">
                    <label className="block text-base font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <FaAddressCard className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        as="textarea"
                        name="address"
                        className={`${inputClass} ${errors.address && touched.address ? 'border-red-500' : ''}`}
                        rows="3"
                      />
                      <ErrorMessage name="address" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Spouse Information */}
              {values.maritalStatus === 'Married' && (
                <div className="border-b border-gray-200 pb-4 md:pb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Spouse Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">First Name</label>
                      <div className="relative">
                        <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                        <Field
                          type="text"
                          name="spouseFirstName"
                          className={`${inputClass} ${errors.spouseFirstName && touched.spouseFirstName ? 'border-red-500' : ''}`}
                        />
                        <ErrorMessage name="spouseFirstName" component="div" className="text-xs text-red-500 mt-1" />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">Middle Name</label>
                      <div className="relative">
                        <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                        <Field
                          type="text"
                          name="spouseMiddleName"
                          className={`${inputClass} ${errors.spouseMiddleName && touched.spouseMiddleName ? 'border-red-500' : ''}`}
                        />
                        <ErrorMessage name="spouseMiddleName" component="div" className="text-xs text-red-500 mt-1" />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700">Last Name</label>
                      <div className="relative">
                        <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                        <Field
                          type="text"
                          name="spouseLastName"
                          className={`${inputClass} ${errors.spouseLastName && touched.spouseLastName ? 'border-red-500' : ''}`}
                        />
                        <ErrorMessage name="spouseLastName" component="div" className="text-xs text-red-500 mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="email"
                        name="email"
                        className={`${inputClass} ${errors.email && touched.email ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="email" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Mobile Number</label>
                    <div className="relative">
                      <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="tel"
                        name="mobileNumber"
                        className={`${inputClass} ${errors.mobileNumber && touched.mobileNumber ? 'border-red-500' : ''}`}
                        placeholder={getMobilePlaceholder()}
                      />
                      <ErrorMessage name="mobileNumber" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Telephone Number</label>
                    <div className="relative">
                      <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="tel"
                        name="telephoneNumber"
                        className={`${inputClass} ${errors.telephoneNumber && touched.telephoneNumber ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="telephoneNumber" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Next of Kin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="nextOfKinFullName"
                        className={`${inputClass} ${errors.nextOfKinFullName && touched.nextOfKinFullName ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="nextOfKinFullName" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <FaAddressCard className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        as="textarea"
                        name="nextOfKinAddress"
                        className={`${inputClass} ${errors.nextOfKinAddress && touched.nextOfKinAddress ? 'border-red-500' : ''}`}
                        rows="3"
                      />
                      <ErrorMessage name="nextOfKinAddress" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Phone</label>
                    <div className="relative">
                      <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="tel"
                        name="nextOfKinMobileNumber"
                        className={`${inputClass} ${errors.nextOfKinMobileNumber && touched.nextOfKinMobileNumber ? 'border-red-500' : ''}`}
                        placeholder={getMobilePlaceholder()}
                      />
                      <ErrorMessage name="nextOfKinMobileNumber" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="email"
                        name="nextOfKinEmail"
                        className={`${inputClass} ${errors.nextOfKinEmail && touched.nextOfKinEmail ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="nextOfKinEmail" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Declaration */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Client Declaration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Land Price</label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="clientDeclarationLandPrice"
                        className={`${inputClass} ${errors.clientDeclarationLandPrice && touched.clientDeclarationLandPrice ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="clientDeclarationLandPrice" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Number of Plots</label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="clientDeclarationNumberOfPlots"
                        className={`${inputClass} ${errors.clientDeclarationNumberOfPlots && touched.clientDeclarationNumberOfPlots ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="clientDeclarationNumberOfPlots" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Site Location</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="clientDeclarationSiteLocation"
                        className={`${inputClass} ${errors.clientDeclarationSiteLocation && touched.clientDeclarationSiteLocation ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="clientDeclarationSiteLocation" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Plot Number</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="clientDeclarationPlotNumber"
                        className={`${inputClass} ${errors.clientDeclarationPlotNumber && touched.clientDeclarationPlotNumber ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="clientDeclarationPlotNumber" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Branch</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="branches"
                        className={`${inputClass} ${errors.branches && touched.branches ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="branches" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Declaration Date</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr z-10" />
                      <DatePicker
                        selected={values.clientDeclarationDate}
                        onChange={(date) => setFieldValue('clientDeclarationDate', date)}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className={`${inputClass} ${errors.clientDeclarationDate && touched.clientDeclarationDate ? 'border-red-500' : ''}`}
                        showYearDropdown
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                      />
                      <ErrorMessage name="clientDeclarationDate" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Referral Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="text"
                        name="referralFullName"
                        className={`${inputClass} ${errors.referralFullName && touched.referralFullName ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="referralFullName" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Phone</label>
                    <div className="relative">
                      <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="tel"
                        name="referralMobileNumber"
                        className={`${inputClass} ${errors.referralMobileNumber && touched.referralMobileNumber ? 'border-red-500' : ''}`}
                        placeholder={getMobilePlaceholder()}
                      />
                      <ErrorMessage name="referralMobileNumber" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                      <Field
                        type="email"
                        name="referralEmail"
                        className={`${inputClass} ${errors.referralEmail && touched.referralEmail ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="referralEmail" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700">Referral Date</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr z-10" />
                      <DatePicker
                        selected={values.referralDate}
                        onChange={(date) => setFieldValue('referralDate', date)}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className={`${inputClass} ${errors.referralDate && touched.referralDate ? 'border-red-500' : ''}`}
                        showYearDropdown
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                      />
                      <ErrorMessage name="referralDate" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-secClr text-white px-6 py-3 rounded-md hover:bg-secClrHover transition-colors duration-200"
                  disabled={loading.countries || loading.states || loading.lgas}
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