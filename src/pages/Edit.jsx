import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import assets from '../assets/assests';
import { FaArrowLeft } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating client details...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to submit the application.', { id: toastId });
        navigate('/login');
        return;
      }

      // Validate only provided fields
      const errors = [];

      // Validate email fields if provided
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('Invalid email format.');
      }
      if (formData.nextOfKinEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.nextOfKinEmail)) {
        errors.push('Invalid next of kin email format.');
      }
      if (formData.referralEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.referralEmail)) {
        errors.push('Invalid referral email format.');
      }

      // Validate phone number fields if provided
      if (formData.mobileNumber && !/^[0-9]{10,15}$/.test(formData.mobileNumber)) {
        errors.push('Invalid mobile number format.');
      }
      if (formData.nextOfKinMobileNumber && !/^[0-9]{10,15}$/.test(formData.nextOfKinMobileNumber)) {
        errors.push('Invalid next of kin mobile number format.');
      }
      if (formData.referralMobileNumber && !/^[0-9]{10,15}$/.test(formData.referralMobileNumber)) {
        errors.push('Invalid referral mobile number format.');
      }

      // Validate spouse fields only if maritalStatus is "Married"
      if (formData.maritalStatus === 'Married') {
        if (!formData.spouseFirstName || formData.spouseFirstName.trim() === '') {
          errors.push('Spouse first name is required.');
        }
        if (!formData.spouseLastName || formData.spouseLastName.trim() === '') {
          errors.push('Spouse last name is required.');
        }
      }

      if (errors.length > 0) {
        toast.error(errors.join(' '), { id: toastId });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('client_name', formData.clientDeclarationClientName || '');
      formDataToSend.append('first_name', formData.firstName || '');
      formDataToSend.append('middle_name', formData.middleName || '');
      formDataToSend.append('last_name', formData.lastName || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('dob', formData.dateOfBirth ? format(new Date(formData.dateOfBirth), 'yyyy-MM-dd') : '');
      formDataToSend.append('nationality', formData.nationality || '');
      formDataToSend.append('marital_status', formData.maritalStatus || '');
      formDataToSend.append('gender', formData.gender || '');
      if (formData.maritalStatus === 'Married') {
        formDataToSend.append('first_name_of_spouse', formData.spouseFirstName || '');
        formDataToSend.append('middle_name_of_spouse', formData.spouseMiddleName || '');
        formDataToSend.append('last_name_of_spouse', formData.spouseLastName || '');
      }
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
      formDataToSend.append('declaration_date', formData.clientDeclarationDate ? format(new Date(formData.clientDeclarationDate), 'yyyy-MM-dd') : '');
      formDataToSend.append('declaration_name', formData.clientDeclarationClientName || '');
      formDataToSend.append('referral_name', formData.referralFullName || '');
      formDataToSend.append('referral_number', formData.referralMobileNumber || '');
      formDataToSend.append('referral_date', formData.referralDate ? format(new Date(formData.referralDate), 'yyyy-MM-dd') : '');
      formDataToSend.append('referral_email', formData.referralEmail || '');

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
    }
  };

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
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
          {/* Profile */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Profile</h3>
            <div className="space-y-4 w-full">
              <div>
                <label className="block text-base font-medium text-gray-700">Client Name</label>
                <input
                  type="text"
                  name="clientDeclarationClientName"
                  value={formData.clientDeclarationClientName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-base font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth ? format(new Date(formData.dateOfBirth), 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange('dateOfBirth', e.target.value ? new Date(e.target.value) : null)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">State of Origin</label>
                <input
                  type="text"
                  name="stateOfOrigin"
                  value={formData.stateOfOrigin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">LGA</label>
                <input
                  type="text"
                  name="lga"
                  value={formData.lga}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Language</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Spouse Information */}
          {formData.maritalStatus === 'Married' && (
            <div className="border-b border-gray-200 pb-4 md:pb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Spouse Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="spouseFirstName"
                    value={formData.spouseFirstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    name="spouseMiddleName"
                    value={formData.spouseMiddleName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="spouseLastName"
                    value={formData.spouseLastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-base font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Telephone Number</label>
                <input
                  type="text"
                  name="telephoneNumber"
                  value={formData.telephoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Next of Kin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-base font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="nextOfKinFullName"
                  value={formData.nextOfKinFullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Address</label>
                <textarea
                  name="nextOfKinAddress"
                  value={formData.nextOfKinAddress}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  name="nextOfKinMobileNumber"
                  value={formData.nextOfKinMobileNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="nextOfKinEmail"
                  value={formData.nextOfKinEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
            </div>
          </div>

          {/* Land Details */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Land Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-base font-medium text-gray-700">Price</label>
                <input
                  type="text"
                  name="clientDeclarationLandPrice"
                  value={formData.clientDeclarationLandPrice}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Number of Plots</label>
                <input
                  type="text"
                  name="clientDeclarationNumberOfPlots"
                  value={formData.clientDeclarationNumberOfPlots}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Site Location</label>
                <input
                  type="text"
                  name="clientDeclarationSiteLocation"
                  value={formData.clientDeclarationSiteLocation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Plot Number</label>
                <input
                  type="text"
                  name="clientDeclarationPlotNumber"
                  value={formData.clientDeclarationPlotNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Branch</label>
                <input
                  type="text"
                  name="branches"
                  value={formData.branches}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Declaration</h3>
            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
              <div className="space-y-4 w-full md:w-1/2">
                <div>
                  <label className="block text-base font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="clientDeclarationClientName"
                    value={formData.clientDeclarationClientName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="clientDeclarationDate"
                    value={formData.clientDeclarationDate ? format(new Date(formData.clientDeclarationDate), 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleDateChange('clientDeclarationDate', e.target.value ? new Date(e.target.value) : null)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Referral */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Referral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-base font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="referralFullName"
                  value={formData.referralFullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  name="referralMobileNumber"
                  value={formData.referralMobileNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="referralEmail"
                  value={formData.referralEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="referralDate"
                  value={formData.referralDate ? format(new Date(formData.referralDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange('referralDate', e.target.value ? new Date(e.target.value) : null)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-secClr focus:ring-secClr text-base p-2"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 pt-4 md:pt-6 flex flex-col md:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 md:px-5 md:py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 w-full md:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 md:px-5 md:py-3 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr/80 transition-colors duration-200 w-full md:w-auto"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClient;