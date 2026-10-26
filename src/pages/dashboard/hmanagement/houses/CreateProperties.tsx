import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { FaArrowLeft } from "react-icons/fa6";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { getErrorMessage } from "../../../../helpers/api";
import FormattedNumberInput from "../../../../components/FormattedNumberInput";
import {
  useHouse,
  useCreateHouse,
  useUpdateHouse,
} from "../../../../hooks/useHouse";

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // TanStack Query for loading property when in edit mode
  const { data: property, isLoading: isFetchingProperty, error } = useHouse(
    isEditMode ? id : null,
  );

  // TanStack Mutations for creating and updating
  const createMutation = useCreateHouse();
  const updateMutation = useUpdateHouse();

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
    if (error) {
      toast.error(getErrorMessage(error, "Failed to load property details"));
      navigate("/dashboard/manage/properties");
    }
  }, [error, navigate]);

  useEffect(() => {
    if (property) {
      setFormValues({
        name: property.name || "",
        estate_name: property.estate_name || "",
        location: property.location || "",
        type: property.type || "",
        price: property.price || "",
        total_units: property.total_units || "",
        description: property.description || "",
        no_of_bedrooms: property.no_of_bedrooms || "",
      });

      if (property.images && Array.isArray(property.images)) {
        const fullImageUrls = property.images.map(
          (img: string) => `${HM_STORAGE_API_URL}${img}`,
        );
        setImagePreviews(fullImageUrls);
      }
    }
  }, [property]);

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
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, formData });
        toast.success("Property updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Property created successfully");
      }
      navigate("/dashboard/manage/properties");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && isFetchingProperty) {
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
                      placeholder="e.g. Pineleaf Estate"
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
                      as="select"
                      id="type"
                      name="type"
                      className={inputClasses}
                    >
                      <option value="">Select Type</option>
                      <option value="apartment">Apartment</option>
                      <option value="duplex">Duplex</option>
                      <option value="terrace">Terrace</option>
                      <option value="bungalow">Bungalow</option>
                      <option value="land">Land</option>
                    </Field>
                    <ErrorMessage
                      name="type"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Field name="price">
                      {({
                        field,
                        form,
                      }: {
                        field: { name: string; value: string | number };
                        form: {
                          setFieldValue: (
                            field: string,
                            value: string | number,
                          ) => void;
                          setFieldTouched: (
                            field: string,
                            isTouched?: boolean,
                          ) => void;
                          errors: Record<string, string>;
                          touched: Record<string, boolean>;
                        };
                      }) => (
                        <FormattedNumberInput
                          label="Price (₦)"
                          name="price"
                          value={field.value}
                          onChange={(val) => form.setFieldValue("price", val)}
                          onBlur={() => form.setFieldTouched("price", true)}
                          placeholder="e.g. 50,000,000"
                          error={form.touched.price && Boolean(form.errors.price)}
                          helperText={form.touched.price && form.errors.price}
                        />
                      )}
                    </Field>
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
                      placeholder="e.g. 10"
                    />
                    <ErrorMessage
                      name="total_units"
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
                      placeholder="e.g. 3"
                    />
                    <ErrorMessage
                      name="no_of_bedrooms"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className={labelClasses}>
                      Description
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={4}
                      className="mt-1 block w-full rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary p-3.5 text-sm outline-none transition duration-200 bg-white"
                      placeholder="Detailed property description..."
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>
              </section>

              {/* Property Images Section */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3 mb-6">
                  Property Images
                </h3>

                <div className="space-y-4">
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer bg-white"
                  >
                    <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-sm font-semibold text-gray-700">
                      Click to upload or drag and drop images
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, JPEG up to 10MB each
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border border-gray-200 h-28 bg-white shadow-xs"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition shadow-sm cursor-pointer"
                          >
                            <FaTimes className="w-3 h-3" />
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
                  disabled={isSubmitting || isSaving}
                  className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isSubmitting || isSaving
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
