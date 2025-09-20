import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BiEnvelope } from 'react-icons/bi';
import { FaUser, FaCalendarAlt, FaPhoneAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Section4 = ({ formData, setFormData, prevSection, onSubmit }) => {
  const navigate = useNavigate();
  const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 pl-10 bg-white';

  const base64ToFile = (base64, filename) => {
    try {
      if (!base64 || !base64.includes('base64,')) {
        console.warn(`Invalid base64 string for ${filename}`);
        return '';
      }
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (err) {
      console.error(`Error converting base64 to file for ${filename}:`, err);
      return '';
    }
  };

  const validationSchema = Yup.object({
    referralFullName: Yup.string().required('Full name is required'),
    referralMobileNumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, 'Enter a valid mobile number')
      .required('Mobile number is required'),
    referralDate: Yup.date().required('Date is required').nullable(),
    referralEmail: Yup.string().email('Invalid email address').required('Email is required'),
  });

  return (
    <Formik
      initialValues={{
        referralFullName: formData.referralFullName || '',
        referralMobileNumber: formData.referralMobileNumber || '',
        referralDate: formData.referralDate ? new Date(formData.referralDate) : null,
        referralEmail: formData.referralEmail || '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const toastId = toast.loading('Submitting application...');
        try {
          const requiredFields = [
            'personal_picture',
            'first_name',
            'last_name',
            'address',
            'dob',
            'nationality',
            'marital_status',
            'gender',
            'email',
            'mobile_number',
            'next_of_kin_full_name',
            'next_of_kin_address',
            'next_of_kin_mobile_number',
            'next_of_kin_email',
            'land_price',
            'number_of_plot',
            'site_location',
            'plot_number',
            'branches',
            'signature',
            'declaration_date',
            'declaration_name',
            'client_name',
            'referral_name',
            'referral_number',
            'referral_date',
            'referral_email',
          ];

          const missingFields = requiredFields.filter((field) => {
            const value =
              field === 'personal_picture' ? formData.image :
              field === 'first_name' ? formData.firstName :
              field === 'last_name' ? formData.lastName :
              field === 'address' ? formData.address :
              field === 'dob' ? (formData.dateOfBirth ? format(new Date(formData.dateOfBirth), 'yyyy-MM-dd') : '') :
              field === 'nationality' ? formData.nationality :
              field === 'marital_status' ? formData.maritalStatus :
              field === 'gender' ? formData.gender :
              field === 'email' ? formData.email :
              field === 'mobile_number' ? formData.mobileNumber :
              field === 'next_of_kin_full_name' ? formData.nextOfKinFullName :
              field === 'next_of_kin_address' ? formData.nextOfKinAddress :
              field === 'next_of_kin_mobile_number' ? formData.nextOfKinMobileNumber :
              field === 'next_of_kin_email' ? formData.nextOfKinEmail :
              field === 'land_price' ? formData.clientDeclarationLandPrice :
              field === 'number_of_plot' ? formData.clientDeclarationNumberOfPlots :
              field === 'site_location' ? formData.clientDeclarationSiteLocation :
              field === 'plot_number' ? formData.clientDeclarationPlotNumber :
              field === 'branches' ? formData.branches :
              field === 'signature' ? (formData.clientDeclarationSignature ? base64ToFile(formData.clientDeclarationSignature, 'signature.png') : '') :
              field === 'declaration_date' ? (formData.clientDeclarationDate ? format(new Date(formData.clientDeclarationDate), 'yyyy-MM-dd') : '') :
              field === 'declaration_name' ? formData.clientDeclarationClientName :
              field === 'client_name' ? formData.clientDeclarationClientName :
              field === 'referral_name' ? values.referralFullName :
              field === 'referral_number' ? values.referralMobileNumber :
              field === 'referral_date' ? (values.referralDate ? format(new Date(values.referralDate), 'yyyy-MM-dd') : '') :
              field === 'referral_email' ? values.referralEmail : '';
            return !value || (typeof value === 'string' && value.trim() === '') || value === 'null';
          });

          if (missingFields.length > 0) {
            toast.error(`Please fill all required fields: ${missingFields.join(', ')}`, { id: toastId });
            setSubmitting(false);
            return;
          }

          const formDataToSend = new FormData();

          formDataToSend.append('personal_picture', formData.image || '');
          formDataToSend.append('title', formData.title || '');
          formDataToSend.append('first_name', formData.firstName || '');
          formDataToSend.append('middle_name', formData.middleName || '');
          formDataToSend.append('last_name', formData.lastName || '');
          formDataToSend.append('address', formData.address || '');
          formDataToSend.append(
            'dob',
            formData.dateOfBirth ? format(new Date(formData.dateOfBirth), 'yyyy-MM-dd') : ''
          );
          formDataToSend.append('nationality', formData.nationality || '');
          formDataToSend.append('marital_status', formData.maritalStatus || '');
          formDataToSend.append('gender', formData.gender || '');
          formDataToSend.append('title_of_spouse', formData.spouseTitle || '');
          formDataToSend.append('first_name_of_spouse', formData.spouseFirstName || '');
          formDataToSend.append('middle_name_of_spouse', formData.spouseMiddleName || '');
          formDataToSend.append('last_name_of_spouse', formData.spouseLastName || '');
          formDataToSend.append('state_of_origin', formData.stateOfOrigin || '');
          formDataToSend.append('lga', formData.lga || '');
          formDataToSend.append('occupation', formData.occupation || '');
          formDataToSend.append('country', formData.countryOfResidence || '');
          formDataToSend.append('language', formData.language || '');
          formDataToSend.append('email', formData.email || '');
          formDataToSend.append('mobile_number', formData.mobileNumber || '');
          formDataToSend.append('telephone_number', formData.telephoneNumber || '');
          formDataToSend.append('next_of_kin_full_name', formData.nextOfKinFullName || '');
          formDataToSend.append('next_of_kin_address', formData.nextOfKinAddress || '');
          formDataToSend.append('next_of_kin_mobile_number', formData.nextOfKinMobileNumber || '');
          formDataToSend.append('next_of_kin_email', formData.nextOfKinEmail || '');
          formDataToSend.append('land_price', formData.clientDeclarationLandPrice || '');
          formDataToSend.append('number_of_plot', formData.clientDeclarationNumberOfPlots || '');
          formDataToSend.append('site_location', formData.clientDeclarationSiteLocation || '');
          formDataToSend.append('plot_number', formData.clientDeclarationPlotNumber || '');
          formDataToSend.append('branches', formData.branches || '');
          const signatureFile = formData.clientDeclarationSignature
            ? base64ToFile(formData.clientDeclarationSignature, 'signature.png')
            : '';
          if (signatureFile) {
            formDataToSend.append('signature', signatureFile);
          } else {
            formDataToSend.append('signature', '');
          }
          formDataToSend.append(
            'declaration_date',
            formData.clientDeclarationDate
              ? format(new Date(formData.clientDeclarationDate), 'yyyy-MM-dd')
              : ''
          );
          formDataToSend.append('declaration_name', formData.clientDeclarationClientName || '');
          formDataToSend.append('client_name', formData.clientDeclarationClientName || '');
          formDataToSend.append('referral_name', values.referralFullName || '');
          formDataToSend.append('referral_number', values.referralMobileNumber || '');
          formDataToSend.append(
            'referral_date',
            values.referralDate ? format(new Date(values.referralDate), 'yyyy-MM-dd') : ''
          );
          formDataToSend.append('referral_email', values.referralEmail || '');

          console.log('FormData being sent to POST /api/clients:');
          for (let [key, value] of formDataToSend.entries()) {
            console.log(`${key}:`, value instanceof File ? value.name : value);
          }

          const response = await axios.post(`${API_URL}/api/clients`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log('API Response from POST /api/clients:', response.data);

          if (response.status === 200 || response.status === 201) {
            toast.success('Application submitted successfully!', { id: toastId });

            // Reset formData
            setFormData({
              image: '',
              title: '',
              firstName: '',
              middleName: '',
              lastName: '',
              address: '',
              dateOfBirth: null,
              nationality: '',
              maritalStatus: '',
              gender: '',
              spouseTitle: '',
              spouseFirstName: '',
              spouseMiddleName: '',
              lastNameOfSpouse: '',
              stateOfOrigin: '',
              lga: '',
              occupation: '',
              countryOfResidence: '',
              language: '',
              email: '',
              mobileNumber: '',
              telephoneNumber: '',
              nextOfKinFullName: '',
              nextOfKinAddress: '',
              nextOfKinMobileNumber: '',
              nextOfKinEmail: '',
              clientDeclarationLandPrice: '',
              clientDeclarationNumberOfPlots: '',
              clientDeclarationSiteLocation: '',
              clientDeclarationPlotNumber: '',
              branches: '',
              clientDeclarationClientName: '',
              clientDeclarationSignature: '',
              clientDeclarationDate: null,
              referralFullName: '',
              referralMobileNumber: '',
              referralDate: null,
              referralEmail: '',
            });

            console.log('Navigating to /success');
            navigate('/success'); // Navigate to Success page

            // Delay onSubmit to ensure navigation completes
            if (onSubmit) {
              setTimeout(() => {
                console.log('Calling onSubmit prop');
                onSubmit();
              }, 100);
            }
          }
        } catch (err) {
          console.error('Error submitting form:', err);
          if (axios.isAxiosError(err)) {
            if (err.code === 'ERR_NETWORK') {
              toast.error('Network error: Unable to connect to the server.', { id: toastId });
            } else if (err.response?.status === 400) {
              toast.error(err.response.data.message || 'Invalid data provided.', { id: toastId });
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
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="space-y-6">
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
            <div className="relative">
              <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
              <Field
                type="text"
                name="referralFullName"
                id="referralFullName"
                className={inputClass}
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="referralFullName"
                component="div"
                className="text-xs text-red-500 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label
                htmlFor="referralMobileNumber"
                className="block text-sm font-medium text-black/70"
              >
                Mobile Number
              </label>
              <div className="relative">
                <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                <Field
                  type="tel"
                  name="referralMobileNumber"
                  id="referralMobileNumber"
                  className={inputClass}
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="referralMobileNumber"
                  component="div"
                  className="text-xs text-red-500 mt-1"
                />
              </div>
            </div>

            <div className="relative w-full">
              <label
                htmlFor="referralDate"
                className="block text-sm font-medium text-black/70"
              >
                Date
              </label>
              <div className="relative w-full">
                <FaCalendarAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr z-10" />
                <DatePicker
                  selected={values.referralDate}
                  onChange={(date) => setFieldValue('referralDate', date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="DD-MM-YYYY"
                  className={`${inputClass} w-full`}
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="referralDate"
                  component="div"
                  className="text-xs text-red-500 mt-1"
                />
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <label
              htmlFor="referralEmail"
              className="block text-sm font-medium text-black/70"
            >
              Email Address
            </label>
            <div className="relative">
              <BiEnvelope className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
              <Field
                type="email"
                name="referralEmail"
                id="referralEmail"
                className={inputClass}
                disabled={isSubmitting}
              />
              <ErrorMessage
                name="referralEmail"
                component="div"
                className="text-xs text-red-500 mt-1"
              />
            </div>
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
              className="px-4 py-2 bg-secClr text-white rounded-md hover:bg-secClr/80 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Section4;