import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { BiEnvelope } from 'react-icons/bi';
import { FaUser, FaAddressCard, FaPhoneAlt } from 'react-icons/fa';

const Section2 = ({ formData, setFormData, prevSection, nextSection }) => {
    const inputClass = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 pl-10 bg-white";

    const validationSchema = Yup.object({
        nextOfKinFullName: Yup.string().required('Full name is required'),
        nextOfKinAddress: Yup.string().required('Address is required'),
        nextOfKinMobileNumber: Yup.string().required('Mobile number is required'),
        nextOfKinEmail: Yup.string().email('Invalid email address').required('Email is required'),
    });

    return (
        <Formik
            initialValues={{
                nextOfKinFullName: formData.nextOfKinFullName || '',
                nextOfKinAddress: formData.nextOfKinAddress || '',
                nextOfKinMobileNumber: formData.nextOfKinMobileNumber || '',
                nextOfKinEmail: formData.nextOfKinEmail || '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                setFormData({ ...formData, ...values });
                nextSection();
            }}
        >
            <Form className="space-y-6">
                <p className="font-semibold text-xl md:text-2xl text-center">Section 2: Next of Kin Details</p>

                <div className="relative w-full">
                    <label htmlFor="nextOfKinFullName" className="block text-sm font-medium text-black/70">Full Name</label>
                    <div className="relative">
                        <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                        <Field
                            type="text"
                            name="nextOfKinFullName"
                            id="nextOfKinFullName"
                            className={inputClass}
                        />
                        <ErrorMessage name="nextOfKinFullName" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                </div>

                <div className="relative w-full">
                    <label htmlFor="nextOfKinAddress" className="block text-sm font-medium text-black/70">Address</label>
                    <div className="relative">
                        <FaAddressCard className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                        <Field
                            type="text"
                            name="nextOfKinAddress"
                            id="nextOfKinAddress"
                            className={inputClass}
                        />
                        <ErrorMessage name="nextOfKinAddress" component="div" className="text-xs text-red-500 mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <label htmlFor="nextOfKinMobileNumber" className="block text-sm font-medium text-black/70">Mobile Number</label>
                        <div className="relative">
                            <FaPhoneAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                            <Field
                                type="tel"
                                name="nextOfKinMobileNumber"
                                id="nextOfKinMobileNumber"
                                className={inputClass}
                            />
                            <ErrorMessage name="nextOfKinMobileNumber" component="div" className="text-xs text-red-500 mt-1" />
                        </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="nextOfKinEmail" className="block text-sm font-medium text-black/70">Email Address</label>
                        <div className="relative">
                            <BiEnvelope className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                            <Field
                                type="email"
                                name="nextOfKinEmail"
                                id="nextOfKinEmail"
                                className={inputClass}
                            />
                            <ErrorMessage name="nextOfKinEmail" component="div" className="text-xs text-red-500 mt-1" />
                        </div>
                    </div>
                </div>

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
                        Next
                    </button>
                </div>
            </Form>
        </Formik>
    );
};

export default Section2;