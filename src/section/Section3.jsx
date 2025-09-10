import React, { useRef, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BiMoney, BiMap } from 'react-icons/bi';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { MdOutlineSignLanguage } from 'react-icons/md';

const Section3 = ({ formData, setFormData, prevSection, nextSection }) => {
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);

    const inputClass =
        'mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 pl-10 bg-white';

    const validationSchema = Yup.object({
        clientDeclarationLandPrice: Yup.string().required('Land price is required'),
        clientDeclarationNumberOfPlots: Yup.number()
            .required('Number of plots is required')
            .min(1, 'Number of plots must be at least 1'),
        clientDeclarationSiteLocation: Yup.string().required('Site location is required'),
        clientDeclarationPlotNumber: Yup.string().required('Plot number is required'),
        clientDeclarationClientName: Yup.string().required('Client name is required'),
        clientDeclarationSignature: Yup.string()
            .required('Signature is required')
            .test('is-not-empty', 'Signature is required', (value) => {
                return (
                    value &&
                    value !==
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAAJYCAYAAACado6zAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADPSURBVHhe7dAxAQAwDMCw/f8vfwBkyS8O...'
                );
            }),
        clientDeclarationDate: Yup.date()
            .required('Date is required')
            .nullable()
            .typeError('Invalid date format, use DD-MM-YYYY'),
    });

    const fullName = `${formData.title ? formData.title + ' ' : ''}${formData.firstName || ''} ${formData.middleName || ''
        } ${formData.lastName || ''}`.trim();

    return (
        <Formik
            initialValues={{
                clientDeclarationLandPrice: formData.clientDeclarationLandPrice || '',
                clientDeclarationNumberOfPlots: formData.clientDeclarationNumberOfPlots || '',
                clientDeclarationSiteLocation: formData.clientDeclarationSiteLocation || '',
                clientDeclarationPlotNumber: formData.clientDeclarationPlotNumber || '',
                clientDeclarationClientName: fullName || formData.clientDeclarationClientName || '',
                clientDeclarationSignature: formData.clientDeclarationSignature || '',
                clientDeclarationDate: formData.clientDeclarationDate || null,
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                setFormData({ ...formData, ...values });
                nextSection();
            }}
        >
            {({ setFieldValue, values }) => (
                <Form className="space-y-6">
                    <p className="font-semibold text-xl md:text-2xl text-center">
                        Section 3: Client's Declaration
                    </p>

                    <div className="w-full">
                        <p className="text-sm text-center text-black/70">
                            I <span className="font-semibold">{fullName || 'Your Name'}</span> hereby
                            affirm that all information provided as requirement for LAND PURCHASE are
                            correct, PINELEAF ESTATE shall not be held responsible for any inaccurate
                            information provided by the client.
                        </p>
                    </div>

                    {/* Land Price & Number of Plots */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label
                                htmlFor="clientDeclarationLandPrice"
                                className="block text-sm font-medium text-black/70"
                            >
                                Land Price
                            </label>
                            <div className="relative">
                                <BiMoney className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                                <Field
                                    type="text"
                                    name="clientDeclarationLandPrice"
                                    id="clientDeclarationLandPrice"
                                    className={inputClass}
                                />
                                <ErrorMessage
                                    name="clientDeclarationLandPrice"
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label
                                htmlFor="clientDeclarationNumberOfPlots"
                                className="block text-sm font-medium text-black/70"
                            >
                                Number of Plots
                            </label>
                            <div className="relative">
                                <BiMap className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                                <Field
                                    type="number"
                                    name="clientDeclarationNumberOfPlots"
                                    id="clientDeclarationNumberOfPlots"
                                    className={inputClass}
                                />
                                <ErrorMessage
                                    name="clientDeclarationNumberOfPlots"
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Site Location & Plot Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label
                                htmlFor="clientDeclarationSiteLocation"
                                className="block text-sm font-medium text-black/70"
                            >
                                Site Location
                            </label>
                            <div className="relative">
                                <BiMap className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                                <Field
                                    type="text"
                                    name="clientDeclarationSiteLocation"
                                    id="clientDeclarationSiteLocation"
                                    className={inputClass}
                                />
                                <ErrorMessage
                                    name="clientDeclarationSiteLocation"
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label
                                htmlFor="clientDeclarationPlotNumber"
                                className="block text-sm font-medium text-black/70"
                            >
                                Plot Number
                            </label>
                            <div className="relative">
                                <BiMap className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                                <Field
                                    type="text"
                                    name="clientDeclarationPlotNumber"
                                    id="clientDeclarationPlotNumber"
                                    className={inputClass}
                                />
                                <ErrorMessage
                                    name="clientDeclarationPlotNumber"
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Client Name */}
                    <div className="relative w-full">
                        <label
                            htmlFor="clientDeclarationClientName"
                            className="block text-sm font-medium text-black/70"
                        >
                            Client Name
                        </label>
                        <div className="relative">
                            <FaUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr" />
                            <Field
                                type="text"
                                name="clientDeclarationClientName"
                                id="clientDeclarationClientName"
                                className={inputClass}
                            />
                            <ErrorMessage
                                name="clientDeclarationClientName"
                                component="div"
                                className="text-xs text-red-500 mt-1"
                            />
                        </div>
                    </div>

                    {/* Signature Canvas */}
                    <div className="relative w-full">
                        <label
                            htmlFor="clientDeclarationSignature"
                            className="block text-sm font-medium text-black/70"
                        >
                            Signature
                        </label>
                        <div className="relative mt-1">
                            <MdOutlineSignLanguage className="absolute top-8 transform -translate-y-1/2 left-3 text-secClr" />
                            <canvas
                                ref={canvasRef}
                                id="clientDeclarationSignature"
                                width="600"
                                height="150"
                                className="block w-full rounded-md border border-gray-300 shadow-sm bg-white"
                                onMouseDown={(e) => {
                                    isDrawing.current = true;
                                    const ctx = canvasRef.current.getContext('2d');
                                    ctx.lineWidth = 2;
                                    ctx.lineCap = 'round';
                                    ctx.strokeStyle = '#000000';
                                    const rect = canvasRef.current.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;
                                    ctx.beginPath();
                                    ctx.moveTo(x, y);
                                }}
                                onMouseMove={(e) => {
                                    if (!isDrawing.current) return;
                                    const ctx = canvasRef.current.getContext('2d');
                                    const rect = canvasRef.current.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;
                                    ctx.lineTo(x, y);
                                    ctx.stroke();
                                }}
                                onMouseUp={() => {
                                    isDrawing.current = false;
                                    const ctx = canvasRef.current.getContext('2d');
                                    ctx.closePath();
                                    setFieldValue(
                                        'clientDeclarationSignature',
                                        canvasRef.current.toDataURL()
                                    );
                                }}
                                onMouseOut={() => {
                                    isDrawing.current = false;
                                    const ctx = canvasRef.current.getContext('2d');
                                    ctx.closePath();
                                    setFieldValue(
                                        'clientDeclarationSignature',
                                        canvasRef.current.toDataURL()
                                    );
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    const touch = e.touches[0];
                                    const ctx = canvasRef.current.getContext('2d');
                                    const rect = canvasRef.current.getBoundingClientRect();
                                    const x = touch.clientX - rect.left;
                                    const y = touch.clientY - rect.top;
                                    ctx.beginPath();
                                    ctx.moveTo(x, y);
                                    isDrawing.current = true;
                                }}
                                onTouchMove={(e) => {
                                    e.preventDefault();
                                    if (!isDrawing.current) return;
                                    const touch = e.touches[0];
                                    const ctx = canvasRef.current.getContext('2d');
                                    const rect = canvasRef.current.getBoundingClientRect();
                                    const x = touch.clientX - rect.left;
                                    const y = touch.clientY - rect.top;
                                    ctx.lineTo(x, y);
                                    ctx.stroke();
                                }}
                                onTouchEnd={() => {
                                    isDrawing.current = false;
                                    const ctx = canvasRef.current.getContext('2d');
                                    ctx.closePath();
                                    setFieldValue(
                                        'clientDeclarationSignature',
                                        canvasRef.current.toDataURL()
                                    );
                                }}
                                onTouchCancel={() => {
                                    isDrawing.current = false;
                                    const ctx = canvasRef.current.getContext('2d');
                                    ctx.closePath();
                                    setFieldValue(
                                        'clientDeclarationSignature',
                                        canvasRef.current.toDataURL()
                                    );
                                }}
                            ></canvas>
                            <ErrorMessage
                                name="clientDeclarationSignature"
                                component="div"
                                className="text-xs text-red-500 mt-1"
                            />
                        </div>
                    </div>

                    {/* Date Picker */}
                    {/* Date Picker */}
                    <div className="relative w-full">
                        <label
                            htmlFor="clientDeclarationDate"
                            className="block text-sm font-medium text-black/70"
                        >
                            Date
                        </label>
                        <div className="relative w-full">
                            <FaCalendarAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-secClr z-10" />
                            <DatePicker
                                selected={values.clientDeclarationDate}
                                onChange={(date) => setFieldValue('clientDeclarationDate', date)}
                                dateFormat="dd-MM-yyyy"
                                placeholderText="DD-MM-YYYY"
                                className={`${inputClass} w-full`}   // ✅ ensure full width
                                wrapperClassName="w-full"            // ✅ forces wrapper div to full width
                                popperClassName="z-50"               // ✅ ensures popup shows above everything
                                showYearDropdown
                                yearDropdownItemNumber={100}
                                scrollableYearDropdown
                            />
                            <ErrorMessage
                                name="clientDeclarationDate"
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
                            Next
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default Section3;