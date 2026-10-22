import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { FaArrowLeft } from "react-icons/fa6";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { hmApi, getErrorMessage } from "../../../../helpers/api";
import FormattedNumberInput from "../../../../components/FormattedNumberInput";

const HM_STORAGE_API_URL = import.meta.env.VITE_HM_STORAGE_BASE_URL;

interface PropertyFormValues {
  name: string;
  estate_name: string;
  location: string;
  type: string;
  price: string | number;
  total_units: string | number;
  description: string;
  no_of_bedrooms: string | number;
}

const CreateProperties: React.FC = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const initialValues: PropertyFormValues = {
    name: "",
    estate_name: "",
    location: "",
    type: "",
    price: "",
    total_units: "",
    description: "",
    no_of_bedrooms: "",
  };

  const [formValues, setFormValues] =
    useState<PropertyFormValues>(initialValues);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchProperty = async () => {
        try {
          const response = await hmApi.get(`/api/admin/properties/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = response.data.data || response.data;
          setFormValues({
            name: data.name || "",
            estate_name: data.estate_name || "",
            location: data.location || "",
            type: data.type || "",
            price: data.price || "",
            total_units: data.total_units || "",
            description: data.description || "",
            no_of_bedrooms: data.no_of_bedrooms || "",
          });

          if (data.images && Array.isArray(data.images)) {
            const fullImageUrls = data.images.map(
              (img: string) => `${HM_STORAGE_API_URL}${img}`,
            );
            setImagePreviews(fullImageUrls);
          }
        } catch (err) {
          toast.error(getErrorMessage(err));
          navigate("/dashboard/manage/properties");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditMode, navigate, token]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Property name is required"),
    estate_name: Yup.string().required("Estate name is required"),
    location: Yup.string().required("Location is required"),
    type: Yup.string().required("Property type is required"),
    price: Yup.number()
      .required("Price is required")
      .positive("Price must be positive"),
    total_units: Yup.number()
      .required("Total units is required")
      .integer()
      .min(1, "Total units must be at least 1"),
    description: Yup.string().required("Description is required"),
    no_of_bedrooms: Yup.number()
      .required("Number of bedrooms is required")
      .integer()
      .min(0, "Number of bedrooms must be 0 or more"),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      updateImages(files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      updateImages(files);
    }
  };

  const updateImages = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (
    values: PropertyFormValues,
    { setSubmitting }: FormikHelpers<PropertyFormValues>,
  ) => {
    const formData = new FormData();
    (Object.keys(values) as (keyof PropertyFormValues)[]).forEach((key) => {
      formData.append(key, String(values[key]));
    });

    images.forEach((image) => {
      formData.append("images[]", image);
    });

    try {
      if (isEditMode) {
        await hmApi.post(`/api/admin/properties/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Property updated successfully");
      } else {
        await hmApi.post("/api/admin/properties", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Property created successfully");
      }
      navigate("/dashboard/manage/properties");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  const inputClasses =
    "mt-1 block w-full rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary h-[50px] px-3.5 text-sm outline-none transition duration-200 bg-white";
  const labelClasses =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header matching View style */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/manage/properties")}
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Property" : "Create New Property"}
          </h1>
        </div>
      </div>

      <div className="bg-secondary p-6 md:p-8 rounded-xl border border-primary/10">
        <Formik
          initialValues={formValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-8">
              {/* Basic Information */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
                  Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className={labelClasses}>
                      Property Name
                    </label>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      className={inputClasses}
                      placeholder="e.g. Luxury 3 Bedroom Flat"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="estate_name" className={labelClasses}>
                      Estate Name
                    </label>
                    <Field
                      id="estate_name"
                      name="estate_name"
                      type="text"
                      className={inputClasses}
                      placeholder="e.g. Pineleaf Gardens"
                    />
                    <ErrorMessage
                      name="estate_name"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className={labelClasses}>
                      Location
                    </label>
                    <Field
                      id="location"
                      name="location"
                      type="text"
                      className={inputClasses}
                      placeholder="e.g. Lekki Phase 1, Lagos"
                    />
                    <ErrorMessage
                      name="location"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className={labelClasses}>
                      Property Type
                    </label>
                    <Field
                      id="type"
                      name="type"
                      as="select"
                      className={inputClasses}
                    >
                      <option value="">Select Type</option>
                      <option value="bungalow">Bungalow</option>
                      <option value="duplex">Duplex</option>
                      <option value="flat">Flat</option>
                      <option value="commercial">Commercial</option>
                    </Field>
                    <ErrorMessage
                      name="type"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className={labelClasses}>
                      Price (₦)
                    </label>
                    <Field
                      id="price"
                      name="price"
                      component={FormattedNumberInput}
                      className={inputClasses}
                      placeholder="0.00"
                    />
                    <ErrorMessage
                      name="price"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="no_of_bedrooms" className={labelClasses}>
                      Number of Bedrooms
                    </label>
                    <Field
                      id="no_of_bedrooms"
                      name="no_of_bedrooms"
                      type="number"
                      className={inputClasses}
                      placeholder="0"
                    />
                    <ErrorMessage
                      name="no_of_bedrooms"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="total_units" className={labelClasses}>
                      Total Units
                    </label>
                    <Field
                      id="total_units"
                      name="total_units"
                      type="number"
                      className={inputClasses}
                      placeholder="1"
                    />
                    <ErrorMessage
                      name="total_units"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>
              </section>

              {/* Description */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
                  Description
                </h3>
                <div>
                  <label htmlFor="description" className={labelClasses}>
                    Property Details & Features
                  </label>
                  <Field
                    id="description"
                    name="description"
                    as="textarea"
                    rows={4}
                    className="mt-1 block w-full rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary p-3.5 text-sm outline-none transition duration-200 bg-white"
                    placeholder="Describe the property details..."
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </section>

              {/* Images */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
                  Property Images
                </h3>
                <div>
                  <label
                    htmlFor="propertyImages"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary transition cursor-pointer relative bg-white"
                  >
                    <div className="space-y-2 text-center">
                      <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="font-semibold text-primary hover:text-primary/90">
                          Upload files
                        </span>
                        <input
                          type="file"
                          multiple
                          onChange={handleImageChange}
                          className="sr-only"
                          accept="image/*"
                          id="propertyImages"
                        />
                        <span className="pl-1">or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            className="h-24 w-24 object-cover rounded-xl border border-gray-200 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/manage/properties")}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update Property"
                      : "Create Property"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateProperties;
