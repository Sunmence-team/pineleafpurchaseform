import React, { useRef, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BiMoney, BiMap } from 'react-icons/bi';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { MdOutlineSignLanguage } from 'react-icons/md';
import { formatNumberWithCommas, unformatNumber } from '../utilities/formatterUtility';
import axios from 'axios';

const Section3 = ({ formData, setFormData, prevSection, nextSection }) => {
  const canvasRef = useRef(null);
  const dropdownRef = useRef(null);
  const isDrawing = useRef(false);
  const lastTouch = useRef({ x: 0, y: 0 });
  const [siteLocations, setSiteLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState(formData.clientDeclarationSiteLocation || '');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchSiteLocations = async () => {
      try {
        // Removed ?name=og so it fetches all properties
        const response = await axios.get(`${import.meta.env.VITE_PROPERTY_BASE_URL}/api/properties/search`);
        
        if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
          setSiteLocations(response.data.data.data);
        }
      } catch (error) {
        console.error('Error fetching site locations:', error);
      }
    };

    fetchSiteLocations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = siteLocations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentClass = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[50px] px-2 flex items-center bg-white";
  const inputClass = "w-full focus:outline-0 text-sm h-full indent-2";

  // Standardized branch options
  const branchOptions = [
    'HQ - Onitsha',
    'Mgbuka',
    'Awka',
    'Asaba',
    'Owerri',
    'Port Harcourt',
    'Lagos Ajah',
    'Lagos Apapa',
    'Enugwu-Ukwu',
    'Abuja',
    'Abia',
    'Nnewi',
    'Enugu',
    'Amuwo odofin Lagos',
  ];

  const validationSchema = Yup.object({
    clientDeclarationLandPrice: Yup.string()
      .required('Land price is required')
      .transform((value) => unformatNumber(value))
      .test('is-numeric', 'Land price must be a valid number', (value) => {
        return !isNaN(Number(value)) && Number(value) >= 0;
      })
      .typeError('Land price must be a number'),
    clientDeclarationNumberOfPlots: Yup.number()
      .required('Number of plots is required')
      .min(1, 'Number of plots must be at least 1'),
    clientDeclarationSiteLocation: Yup.string().required('Site location is required'),
    clientDeclarationPlotNumber: Yup.string()
      .trim()
      .required('Plot number is required')
      .matches(
        /^[a-zA-Z0-9, ]*$/,
        'Plot number can only contain letters, numbers, and commas.'
      ),
    branches: Yup.string().required('Branch is required'),
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

  const fullName = `${formData.title ? formData.title + ' ' : ''}${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}`.trim();

  const clearSignature = (setFieldValue) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFieldValue('clientDeclarationSignature', '');
  };

  const getCanvasCoordinates = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let x, y;

    if (event.type.startsWith('touch')) {
      const touch = event.touches[0] || event.changedTouches[0];
      x = (touch.clientX - rect.left) * scaleX;
      y = (touch.clientY - rect.top) * scaleY;
    } else {
      x = (event.clientX - rect.left) * scaleX;
      y = (event.clientY - rect.top) * scaleY;
    }

    return { x, y };
  };

  return (
    <Formik
      initialValues={{
        clientDeclarationLandPrice: formData.clientDeclarationLandPrice ? formatNumberWithCommas(formData.clientDeclarationLandPrice) : '',
        clientDeclarationNumberOfPlots: formData.clientDeclarationNumberOfPlots || '',
        clientDeclarationSiteLocation: formData.clientDeclarationSiteLocation || '',
        clientDeclarationPlotNumber: formData.clientDeclarationPlotNumber || '',
        branches: formData.branches || '',
        clientDeclarationSignature: formData.clientDeclarationSignature || '',
        clientDeclarationDate: formData.clientDeclarationDate || null,
        clientDeclarationClientName: formData.clientDeclarationClientName || fullName,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        const unformattedLandPrice = unformatNumber(values.clientDeclarationLandPrice);
        setFormData({ ...formData, ...values, clientDeclarationLandPrice: unformattedLandPrice });
        nextSection();
      }}
    >
      {({ setFieldValue, values }) => (
        <Form className="space-y-6 sm:space-y-8">
          <p className="font-semibold text-lg sm:text-xl md:text-2xl text-center text-gray-900">
            Section 3: Client's Declaration
          </p>

          <div className="w-full">
            <p className="text-sm sm:text-base text-center text-gray-700">
              I <span className="font-semibold">{fullName || 'Your Name'}</span> hereby
              affirm that all information provided as requirement for LAND PURCHASE are
              correct, PINELEAF ESTATE shall not be held responsible for any inaccurate
              information provided by the client.
            </p>
          </div>

          <div className="relative w-full">
            <label
              htmlFor="clientDeclarationClientName"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Client Name
            </label>
            <div className={parentClass}>
              <FaUser className="text-secClr" />
              <Field
                type="text"
                name="clientDeclarationClientName"
                id="clientDeclarationClientName"
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                value={fullName || ''}
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative">
              <label
                htmlFor="clientDeclarationLandPrice"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Land Price
              </label>
              <div className={parentClass}>
                <BiMoney className="text-secClr" />
                <Field
                  type="text"
                  name="clientDeclarationLandPrice"
                  id="clientDeclarationLandPrice"
                  className={inputClass}
                  value={values.clientDeclarationLandPrice}
                  onChange={(e) => {
                    const { value } = e.target;
                    const unformattedValue = unformatNumber(value);
                    setFieldValue('clientDeclarationLandPrice', formatNumberWithCommas(unformattedValue));
                  }}
                />
              </div>
              <ErrorMessage
                name="clientDeclarationLandPrice"
                component="div"
                className="text-xs sm:text-sm text-red-500 mt-1"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="clientDeclarationNumberOfPlots"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Number of Plots
              </label>
              <div className={parentClass}>
                <BiMap className="text-secClr" />
                <Field
                  type="number"
                  name="clientDeclarationNumberOfPlots"
                  id="clientDeclarationNumberOfPlots"
                  className={inputClass}
                />
              </div>
              <ErrorMessage
                name="clientDeclarationNumberOfPlots"
                component="div"
                className="text-xs sm:text-sm text-red-500 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative" ref={dropdownRef}>
              <label
                htmlFor="clientDeclarationSiteLocation"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Site Location
              </label>
              <div className={parentClass}>
                <BiMap className="text-secClr" />
                <input
                  type="text"
                  id="clientDeclarationSiteLocation"
                  placeholder="Search Site Location..."
                  className={inputClass}
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    setFieldValue('clientDeclarationSiteLocation', value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  autoComplete="off"
                />
              </div>
              {showDropdown && searchTerm && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location) => (
                      <div
                        key={location.id}
                        className="px-4 py-2 hover:bg-secClr hover:text-white cursor-pointer transition-colors duration-200 text-sm"
                        onClick={() => {
                          setFieldValue('clientDeclarationSiteLocation', location.name);
                          setSearchTerm(location.name);
                          setShowDropdown(false);
                        }}
                      >
                        {location.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">No results found</div>
                  )}
                </div>
              )}
              <ErrorMessage
                name="clientDeclarationSiteLocation"
                component="div"
                className="text-xs sm:text-sm text-red-500 mt-1"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="clientDeclarationPlotNumber"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Plot Number
              </label>
              <div className={parentClass}>
                <BiMap className="text-secClr" />
                <Field
                  type="text"
                  name="clientDeclarationPlotNumber"
                  id="clientDeclarationPlotNumber"
                  className={inputClass}
                />
              </div>
              <ErrorMessage
                name="clientDeclarationPlotNumber"
                component="div"
                className="text-xs sm:text-sm text-red-500 mt-1"
              />
            </div>
          </div>

          <div className="relative w-full">
            <label
              htmlFor="branches"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Branch
            </label>
            <div className={parentClass}>
              <BiMap className="text-secClr" />
              <Field
                as="select"
                name="branches"
                id="branches"
                className={inputClass}
              >
                <option value="">Select Branch</option>
                {branchOptions.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </Field>
            </div>
            <ErrorMessage
              name="branches"
              component="div"
              className="text-xs sm:text-sm text-red-500 mt-1"
            />
          </div>

          <div className="relative w-full">
            <label
              htmlFor="clientDeclarationSignature"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Signature
            </label>
            <div className="relative mt-1">
              <MdOutlineSignLanguage className="absolute top-8 transform -translate-y-1/2 left-3 text-secClr text-sm sm:text-base" />
              <canvas
                ref={canvasRef}
                id="clientDeclarationSignature"
                width="600"
                height="150"
                className="block w-full h-32 sm:h-40 rounded-md border border-gray-300 shadow-sm bg-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  isDrawing.current = true;
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  ctx.lineWidth = 2;
                  ctx.lineCap = 'round';
                  ctx.strokeStyle = '#000000';
                  const { x, y } = getCanvasCoordinates(e, canvas);
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  lastTouch.current = { x, y };
                }}
                onMouseMove={(e) => {
                  if (!isDrawing.current) return;
                  e.preventDefault();
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  const { x, y } = getCanvasCoordinates(e, canvas);
                  ctx.lineTo(x, y);
                  ctx.stroke();
                  lastTouch.current = { x, y };
                }}
                onMouseUp={() => {
                  isDrawing.current = false;
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  ctx.closePath();
                  setFieldValue('clientDeclarationSignature', canvas.toDataURL());
                }}
                onMouseOut={() => {
                  isDrawing.current = false;
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  ctx.closePath();
                  setFieldValue('clientDeclarationSignature', canvas.toDataURL());
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isDrawing.current = true;
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  ctx.lineWidth = 2;
                  ctx.lineCap = 'round';
                  ctx.strokeStyle = '#000000';
                  const { x, y } = getCanvasCoordinates(e, canvas);
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  lastTouch.current = { x, y };
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDrawing.current) return;
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  const { x, y } = getCanvasCoordinates(e, canvas);
                  ctx.lineTo(x, y);
                  ctx.stroke();
                  lastTouch.current = { x, y };
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isDrawing.current = false;
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  ctx.closePath();
                  setFieldValue('clientDeclarationSignature', canvas.toDataURL());
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isDrawing.current = false;
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  ctx.closePath();
                  setFieldValue('clientDeclarationSignature', canvas.toDataURL());
                }}
                style={{ touchAction: 'none' }}
              ></canvas>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => clearSignature(setFieldValue)}
                  className="px-4 py-2 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr transition duration-300"
                >
                  Clear Signature
                </button>
              </div>
              <ErrorMessage
                name="clientDeclarationSignature"
                component="div"
                className="text-xs sm:text-sm text-red-500 mt-1"
              />
            </div>
          </div>

          <div className="relative w-full">
            <label
              htmlFor="clientDeclarationDate"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Date
            </label>
            <div className={parentClass}>
              <FaCalendarAlt className="text-secClr z-10" />
              <DatePicker
                selected={values.clientDeclarationDate}
                onChange={(date) => setFieldValue('clientDeclarationDate', date)}
                dateFormat="dd-MM-YYYY"
                placeholderText="DD-MM-YYYY"
                className={`${inputClass} w-full`}
                wrapperClassName="w-full"
                popperClassName="z-50"
                showYearDropdown
                yearDropdownItemNumber={100}
                scrollableYearDropdown
              />
            </div>
            <ErrorMessage
              name="clientDeclarationDate"
              component="div"
              className="text-xs sm:text-sm text-red-500 mt-1"
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="button"
              onClick={prevSection}
              className="px-4 py-2 sm:px-5 sm:py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 w-full sm:w-auto"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-4 py-2 sm:px-5 sm:py-3 bg-secClr text-white font-semibold rounded-lg hover:bg-secClr transition duration-300 w-full sm:w-auto"
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