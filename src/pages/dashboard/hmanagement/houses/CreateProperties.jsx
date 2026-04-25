import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaArrowLeft, FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import api, { getErrorMessage } from "../../../../utilities/api";
import assets from "../../../../assets/assests";

const CreateProperties = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const initialValues = {
    name: "",
    estate_name: "",
    location: "",
    type: "",
    price: "",
    total_units: "",
    description: "",
    no_of_bedrooms: "",
  };

  const [formValues, setFormValues] = useState(initialValues);

  useEffect(() => {
    if (isEditMode) {
      const fetchProperty = async () => {
        try {
          const response = await api.get(`/api/properties/${id}`, {
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
          // If there are existing images, we might want to show them
          if (data.images && Array.isArray(data.images)) {
            // Assuming data.images contains URLs
            setImagePreviews(data.images);
          }
        } catch (err) {
          toast.error(getErrorMessage(err));
          navigate("/dashboard/manage/listings");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditMode, navigate]);

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
      .min(1),
    description: Yup.string().required("Description is required"),
    no_of_bedrooms: Yup.number()
      .required("Number of bedrooms is required")
      .integer()
      .min(0),
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });

    images.forEach((image) => {
      formData.append("images[]", image);
    });

    try {
      if (isEditMode) {
        // Many APIs require _method="PUT" for FormData with PUT
        formData.append("_method", "PUT");
        await api.put(`/api/properties/${id}`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data" 
            },
        });
        toast.success("Property updated successfully");
      } else {
        await api.post("/api/properties", formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data" 
            },
        });
        toast.success("Property created successfully");
      }
      navigate("/dashboard/manage/listings");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  const inputClasses =
    "mt-1 block w-full rounded-md border border-gray-300 focus:border-primary focus:ring-primary h-[50px] px-3 text-sm outline-none";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
          <button
            onClick={() => navigate("/dashboard/manage/listings")}
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <img src={assets.logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Property" : "Create New Property"}
          </h1>
        </div>

        <Formik
          initialValues={formValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className={labelClasses}>
                    Property Name
                  </label>
                  <Field
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
                  <Field name="type" as="select" className={inputClasses}>
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
                    name="price"
                    type="number"
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

              <div>
                <label htmlFor="description" className={labelClasses}>
                  Description
                </label>
                <Field
                  name="description"
                  as="textarea"
                  rows="4"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 text-sm outline-none"
                  placeholder="Describe the property details..."
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div>
                <label className={labelClasses}>Property Images</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-secClr">
                        <span>Upload files</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleImageChange}
                          className="sr-only"
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/manage/listings")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-secClr text-white rounded-lg hover:bg-secClr/90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
