import React, { useState, useEffect } from "react";
import { formatNumberWithCommas, unformatNumber } from "../utilities/formatterUtility";

// Change this line in your FormattedNumberInput.jsx
const FormattedNumberInput = ({
  field, // Formik passes this
  form,  // And this
  ...rest
}) => {
  // Destructure what you need from 'field'
  const { name, value } = field;
  
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

    // Use form.setFieldValue to update Formik's state with the raw number
    form.setFieldValue(name, numericValue);
  };

  return (
    <input
      {...rest}
      name={name} // Pass name so Formik tracks it
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={field.onBlur} // Important for validation/touched state
      inputMode="decimal"
    />
  );
};

export default FormattedNumberInput;