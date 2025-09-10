import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BiEnvelope } from 'react-icons/bi';
import { FaUser, FaCalendarAlt, FaPhoneAlt } from 'react-icons/fa';

const Section4 = ({ formData, setFormData, prevSection, onSubmit }) => {
    const inputClass =
        'mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 pl-10 bg-white';

    // Validation Schema
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
            onSubmit={(values) => {
                setFormData({
                    ...formData,
                    ...values,
                    referralDate: values.referralDate
                        ? values.referralDate.toISOString().split('T')[0]
                        : '',
                });
                onSubmit();
            }}
        >
            {({ values, setFieldValue }) => (
                <Form className="space-y-6">
                    <p className="font-semibold text-xl md:text-2xl text-center">
                        Section 4: Referral Details
                    </p>

                    {/* Full Name */}
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
                            />
                            <ErrorMessage
                                name="referralFullName"
                                component="div"
                                className="text-xs text-red-500 mt-1"
                            />
                        </div>
                    </div>

                    {/* Mobile Number & Date */}
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
                                />
                                <ErrorMessage
                                    name="referralMobileNumber"
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                />
                            </div>
                        </div>

                        {/* Date Picker */}
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
                                    className={`${inputClass} w-full`}   // ✅ ensure full width
                                wrapperClassName="w-full"            // ✅ forces wrapper div to full width
                                popperClassName="z-50"               // ✅ ensures popup shows above everything
                                />
                                <ErrorMessage
                                    name="referralDate"
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
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
                            />
                            <ErrorMessage
                                name="referralEmail"
                                component="div"
                                className="text-xs text-red-500 mt-1"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="w-full flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={prevSection}
                            className="px-4 py-2 bg-gray-300 text-black/80 rounded-md hover:bg-gray-400"
                        >
                            Previous
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-secClr text-white rounded-md hover:bg-secClr/80"
                        >
                            Submit
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default Section4;