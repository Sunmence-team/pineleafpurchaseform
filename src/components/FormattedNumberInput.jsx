import React, { useState, useEffect } from "react";
import { formatNumberWithCommas, unformatNumber } from "../utilities/formatterUtility";

// // Change this line in your FormattedNumberInput.jsx
// const FormattedNumberInput = ({
//   field, // Formik passes this
//   form,  // And this
//   ...rest
// }) => {
//   // Destructure what you need from 'field'
//   const { name, value } = field;

//   const [displayValue, setDisplayValue] = useState("");

//   useEffect(() => {
//     setDisplayValue(value ? formatNumberWithCommas(value) : "");
//   }, [value]);

//   const handleChange = (e) => {
//     const inputValue = e.target.value;

//     if (inputValue.endsWith(".")) {
//       setDisplayValue(inputValue);
//       return;
//     }

//     const rawValue = unformatNumber(inputValue);
//     const numericValue = rawValue ? parseFloat(rawValue) : "";

//     setDisplayValue(rawValue ? formatNumberWithCommas(rawValue) : "");

//     // Use form.setFieldValue to update Formik's state with the raw number
//     form.setFieldValue(name, numericValue);
//   };

//   return (
//     <input
//       {...rest}
//       name={name} // Pass name so Formik tracks it
//       type="text"
//       value={displayValue}
//       onChange={handleChange}
//       onBlur={field.onBlur} // Important for validation/touched state
//       inputMode="decimal"
//     />
//   );
// };

const FormattedNumberInput = ({
  field, // Injected by <Field />
  form, // Injected by <Field />
  value: manualValue, // Manual prop
  onChange: manualChange, // Manual prop
  onBlur: manualBlur, // Manual prop
  name: manualName, // Manual prop
  ...rest
}) => {
  // Use the injected Formik prop OR the manual prop
  const name = field?.name || manualName;
  const value = field?.value ?? manualValue;
  const onBlur = field?.onBlur || manualBlur;

  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    setDisplayValue(value ? formatNumberWithCommas(value) : "");
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue.endsWith(".")) {
      setDisplayValue(inputValue);
      return;
    }

    const rawValue = unformatNumber(inputValue);
    const numericValue = rawValue ? parseFloat(rawValue) : "";
    setDisplayValue(rawValue ? formatNumberWithCommas(rawValue) : "");

    // Logic: If using <Field />, update via form helper.
    // If manual, call the manual onChange.
    if (form && name) {
      form.setFieldValue(name, numericValue);
    } else if (manualChange) {
      manualChange(numericValue);
    }
  };

  return (
    <input
      {...rest}
      name={name}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      inputMode="decimal"
    />
  );
};

export default FormattedNumberInput;
