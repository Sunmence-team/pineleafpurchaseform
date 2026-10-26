import React, { useRef, useMemo, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BiMoney, BiMap } from "react-icons/bi";
import { FaUser, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineSignLanguage } from "react-icons/md";
import {
  formatNumberWithCommas,
  unformatNumber,
} from "../../../helpers/formatterUtility";
import type { SectionProps } from "./types";
import SearchablePropertyInput from "../../../components/ui/SearchablePropertyInput";
import FormattedNumberInput from "../../../components/FormattedNumberInput";
import SearchableInput from "../../../components/ui/SearchableInput";
import { useBranches } from "../../../hooks/useBranches";
import { fetchBranchesService } from "../../../services/branchService";
import { BranchItem } from "../../../lib/interfaces";

const Section3: React.FC<SectionProps> = ({
  formData,
  setFormData,
  prevSection,
  nextSection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const lastTouch = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);

  const { data: branchesList = [], isLoading: isLoadingBranches } = useBranches();

  const fetchBranches = useCallback(
    async (query: string, signal?: AbortSignal): Promise<BranchItem[]> => {
      return await fetchBranchesService({ search: query, signal });
    },
    [],
  );

  const fullName =
    `${formData.title ? formData.title + " " : ""}${formData.firstName || ""} ${formData.middleName || ""} ${formData.lastName || ""}`.trim();
  const spouseName = formData.shouldSpouseNameShow
    ? ` and ${formData.spouseTitle} ${formData.spouseFirstName || ""} ${formData.spouseMiddleName || ""} ${formData.spouseLastName || ""}`.trim()
    : "";

  const isIndividual = formData.purchase_type === "individual";
  const repName = formData.nextOfKinFullName || "Representative Name";
  const clubName = formData.clubName || "Club Name";

  const initialClientName = isIndividual
    ? `${fullName} ${spouseName?.trim() ? spouseName : ""}`.trim()
    : clubName;

  const parentClass =
    "mt-1 block w-full rounded-md border border-gray-300 shadow-sm h-[50px] px-2 flex items-center bg-white";
  const inputClass = "w-full focus:outline-0 text-sm h-full indent-2";

  const validationSchema = Yup.object({
    clientDeclarationLandPrice: Yup.string()
      .required("Land price is required")
      .test("is-numeric", "Land price must be a valid number", (value) => {
        if (!value) return false;
        const unformatted = unformatNumber(value);
        return !isNaN(Number(unformatted)) && Number(unformatted) >= 0;
      }),
    clientDeclarationNumberOfPlots: Yup.number()
      .required("Number of plots is required")
      .min(1, "Number of plots must be at least 1"),
    clientDeclarationSiteLocation: Yup.string()
      .required("Site location is required"),
    clientDeclarationPlotNumber: Yup.string()
      .trim()
      .required("Plot number is required")
      .matches(
        /^[a-zA-Z0-9, ]*$/,
        "Plot number can only contain letters, numbers, and commas.",
      ),
    branches: Yup.string().required("Branch is required"),
    clientDeclarationSignature: Yup.string()
      .required("Signature is required")
      .test("is-not-empty", "Signature is required", (value) => {
        return (
          value &&
          value !==
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAAJYCAYAAACado6zAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADPSURBVHhe7dAxAQAwDMCw/f8vfwBkyS8O..."
        );
      }),
    clientDeclarationDate: Yup.date()
      .required("Date is required")
      .nullable()
      .typeError("Invalid date format, use DD-MM-YYYY"),
  });

  const formik = useFormik({
    initialValues: {
      clientDeclarationLandPrice: formData.clientDeclarationLandPrice
        ? formatNumberWithCommas(formData.clientDeclarationLandPrice)
        : "",
      clientDeclarationNumberOfPlots:
        formData.clientDeclarationNumberOfPlots || "",
      clientDeclarationSiteLocation:
        formData.clientDeclarationSiteLocation || "",
      clientDeclarationPlotNumber: formData.clientDeclarationPlotNumber || "",
      branches: formData.branches || "",
      clientDeclarationSignature: formData.clientDeclarationSignature || "",
      clientDeclarationDate: formData.clientDeclarationDate || null,
      clientDeclarationClientName:
        formData.clientDeclarationClientName || initialClientName,
    },
    validationSchema,
    onSubmit: (values) => {
      const unformattedLandPrice = unformatNumber(
        values.clientDeclarationLandPrice,
      );
      setFormData({
        ...formData,
        ...values,
        clientDeclarationLandPrice: unformattedLandPrice,
      });
      if (nextSection) {
        nextSection();
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
  } = formik;

  const selectedBranchName = useMemo(() => {
    if (!values.branches) return "";
    const found = branchesList.find(
      (b) => String(b.id) === String(values.branches),
    );
    return found ? found.name : String(values.branches);
  }, [values.branches, branchesList]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFieldValue("clientDeclarationSignature", "");
  };

  const getCanvasCoordinates = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let x: number, y: number;

    if ("touches" in event) {
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
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
      <p className="font-semibold text-lg md:text-2xl text-center text-gray-900">
        Section 3: Client's Declaration
      </p>

      <div className="w-full">
        <p className="text-sm md:text-base text-center text-gray-700 leading-relaxed">
          {isIndividual ? (
            <>
              I{" "}
              <span className="font-semibold text-primary">
                {fullName || "Your Name"}
              </span>{" "}
              {spouseName && (
                <span className="font-semibold text-primary">{spouseName}</span>
              )}{" "}
            </>
          ) : (
            <>
              We, <span className="font-semibold text-primary">{clubName}</span>{" "}
              (represented by Representative{" "}
              <span className="font-semibold text-primary">{repName}</span>
              ){" "}
            </>
          )}
          hereby affirm that all information provided as requirement for LAND
          PURCHASE are correct,{" "}
          <span className="font-semibold">PINELEAF ESTATE</span> shall not be
          held responsible for any inaccurate information provided by the
          client.
        </p>
      </div>

      <div className="relative w-full">
        <label
          htmlFor="clientDeclarationClientName"
          className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2"
        >
          Client Name
        </label>
        <div className={parentClass}>
          <FaUser className="text-primary" />
          <input
            type="text"
            name="clientDeclarationClientName"
            id="clientDeclarationClientName"
            className={`${inputClass} bg-gray-100 cursor-not-allowed`}
            value={initialClientName}
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="relative">
          <FormattedNumberInput
            label="Land Price"
            name="clientDeclarationLandPrice"
            id="clientDeclarationLandPrice"
            icon={<BiMoney className="text-primary" />}
            inputContClassName={parentClass}
            className={inputClass}
            placeholder="Enter land price"
            value={values.clientDeclarationLandPrice}
            onChange={(val) => {
              setFieldValue("clientDeclarationLandPrice", val);
            }}
            onBlur={() => {
              setFieldTouched("clientDeclarationLandPrice", true);
            }}
            error={
              touched.clientDeclarationLandPrice &&
              Boolean(errors.clientDeclarationLandPrice)
            }
            helperText={
              touched.clientDeclarationLandPrice
                ? (errors.clientDeclarationLandPrice as string)
                : undefined
            }
          />
        </div>

        <div className="relative">
          <label
            htmlFor="clientDeclarationNumberOfPlots"
            className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2"
          >
            Number of Plots
          </label>
          <div className={parentClass}>
            <BiMap className="text-primary" />
            <input
              type="number"
              name="clientDeclarationNumberOfPlots"
              id="clientDeclarationNumberOfPlots"
              className={inputClass}
              value={values.clientDeclarationNumberOfPlots}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          {touched.clientDeclarationNumberOfPlots &&
            errors.clientDeclarationNumberOfPlots && (
              <div className="text-xs md:text-sm text-red-500 mt-1">
                {errors.clientDeclarationNumberOfPlots}
              </div>
            )}
        </div>

        <div className="relative lg:col-span-1 md:col-span-2">
          <label
            htmlFor="clientDeclarationSiteLocation"
            className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2"
          >
            Property Name
          </label>
          <SearchablePropertyInput
            selectedItem={selectedProperty}
            value={
              selectedProperty?.name ||
              (typeof values.clientDeclarationSiteLocation === "string"
                ? values.clientDeclarationSiteLocation
                : "")
            }
            placeholder="Search property name..."
            clearable={true}
            icon={<BiMap className="text-primary" />}
            inputContClassName={`${parentClass} relative ${
              touched.clientDeclarationSiteLocation &&
              errors.clientDeclarationSiteLocation
                ? "border-red-500"
                : "border-gray-300"
            }`}
            className={inputClass}
            onSelect={(property) => {
              setSelectedProperty(property);
              setFieldValue(
                "clientDeclarationSiteLocation",
                property?.id ?? "",
              );
              setFieldTouched("clientDeclarationSiteLocation", true);
            }}
            onClear={() => {
              setSelectedProperty(null);
              setFieldValue("clientDeclarationSiteLocation", "");
              setFieldTouched("clientDeclarationSiteLocation", true);
            }}
            onBlur={() => {
              setFieldTouched("clientDeclarationSiteLocation", true);
            }}
          />
          {touched.clientDeclarationSiteLocation &&
            errors.clientDeclarationSiteLocation && (
              <div className="text-xs md:text-sm text-red-500 mt-1">
                {errors.clientDeclarationSiteLocation}
              </div>
            )}
        </div>

        <div className="relative w-full lg:col-span-1 md:col-span-2">
          <label
            htmlFor="branches"
            className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2"
          >
            Branch (Please select the branch closest to you)
          </label>
          <SearchableInput<BranchItem>
            fetcher={fetchBranches}
            options={branchesList}
            value={selectedBranchName}
            displayKey="name"
            placeholder={isLoadingBranches ? "Loading branches..." : "Select Branch"}
            disabled={isLoadingBranches}
            isSelector={true}
            clearable={true}
            fetchOnEmpty={true}
            icon={<BiMap className="text-primary" />}
            inputContClassName={`${parentClass} relative ${
              touched.branches && errors.branches
                ? "border-red-500"
                : "border-gray-300"
            }`}
            className={inputClass}
            renderOption={(item, isSelected) => (
              <p className="font-semibold text-gray-900">{item.name}</p>
            )}
            onSelect={(branch: BranchItem) => {
              setFieldValue("branches", branch.id);
              setFieldTouched("branches", true);
            }}
            onClear={() => {
              setFieldValue("branches", "");
              setFieldTouched("branches", true);
            }}
            onInputChange={() => {
              setFieldTouched("branches", true);
            }}
          />
          {touched.branches && errors.branches && (
            <div className="text-xs md:text-sm text-red-500 mt-1">
              {errors.branches}
            </div>
          )}
        </div>

        <div className="relative md:col-span-2">
          <label
            htmlFor="clientDeclarationPlotNumber"
            className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2"
          >
            Please list out your plot numbers
          </label>
          <div className={parentClass + " h-[100px]! py-2 items-start"}>
            <BiMap className="text-primary" />
            <textarea
              rows={4}
              name="clientDeclarationPlotNumber"
              id="clientDeclarationPlotNumber"
              className={inputClass + " resize-none"}
              value={values.clientDeclarationPlotNumber}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          {touched.clientDeclarationPlotNumber &&
            errors.clientDeclarationPlotNumber && (
              <div className="text-xs md:text-sm text-red-500 mt-1">
                {errors.clientDeclarationPlotNumber}
              </div>
            )}
        </div>
      </div>

      <div className="relative w-full">
        <label
          htmlFor="clientDeclarationSignature"
          className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2"
        >
          Signature
        </label>
        <div className="relative mt-1">
          <MdOutlineSignLanguage className="absolute top-8 transform -translate-y-1/2 left-3 text-primary text-sm md:text-base" />
          <canvas
            ref={canvasRef}
            id="clientDeclarationSignature"
            width="600"
            height="150"
            className="block w-full h-32 md:h-40 rounded-md border border-gray-300 shadow-sm bg-white"
            onMouseDown={(e) => {
              e.preventDefault();
              isDrawing.current = true;
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.lineWidth = 2;
              ctx.lineCap = "round";
              ctx.strokeStyle = "#000000";
              const { x, y } = getCanvasCoordinates(e, canvas);
              ctx.beginPath();
              ctx.moveTo(x, y);
              lastTouch.current = { x, y };
            }}
            onMouseMove={(e) => {
              if (!isDrawing.current) return;
              e.preventDefault();
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              const { x, y } = getCanvasCoordinates(e, canvas);
              ctx.lineTo(x, y);
              ctx.stroke();
              lastTouch.current = { x, y };
            }}
            onMouseUp={() => {
              isDrawing.current = false;
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.closePath();
              setFieldValue("clientDeclarationSignature", canvas.toDataURL());
            }}
            onMouseOut={() => {
              isDrawing.current = false;
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.closePath();
              setFieldValue("clientDeclarationSignature", canvas.toDataURL());
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isDrawing.current = true;
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.lineWidth = 2;
              ctx.lineCap = "round";
              ctx.strokeStyle = "#000000";
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
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
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
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.closePath();
              setFieldValue("clientDeclarationSignature", canvas.toDataURL());
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isDrawing.current = false;
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.closePath();
              setFieldValue("clientDeclarationSignature", canvas.toDataURL());
            }}
            style={{ touchAction: "none" }}
          ></canvas>
          <div className="mt-2">
            <button
              type="button"
              onClick={clearSignature}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary transition duration-300"
            >
              Clear Signature
            </button>
          </div>
          {touched.clientDeclarationSignature &&
            errors.clientDeclarationSignature && (
              <div className="text-xs md:text-sm text-red-500 mt-1">
                {errors.clientDeclarationSignature}
              </div>
            )}
        </div>
      </div>

      <div className="relative w-full">
        <label
          htmlFor="clientDeclarationDate"
          className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2"
        >
          Date
        </label>
        <div className={parentClass}>
          <FaCalendarAlt className="text-primary z-10" />
          <DatePicker
            selected={
              values.clientDeclarationDate
                ? new Date(values.clientDeclarationDate)
                : null
            }
            onChange={(date: Date | null) =>
              setFieldValue("clientDeclarationDate", date)
            }
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
        {touched.clientDeclarationDate && errors.clientDeclarationDate && (
          <div className="text-xs md:text-sm text-red-500 mt-1">
            {errors.clientDeclarationDate as string}
          </div>
        )}
      </div>

      <div className="w-full flex flex-col md:flex-row justify-between gap-3 md:gap-4 mt-6 md:mt-8">
        <button
          type="button"
          onClick={prevSection}
          className="px-4 py-2 md:px-5 md:py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 w-full md:w-auto"
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-4 py-2 md:px-5 md:py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary transition duration-300 w-full md:w-auto"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Section3;
