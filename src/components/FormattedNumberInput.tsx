import React, { useState, useEffect } from "react";
import {
  formatNumberWithCommas,
  unformatNumber,
} from "../helpers/formatterUtility";

export interface FormattedNumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "form"
> {
  field?: {
    name?: string;
    value?: any;
    onBlur?: (e: any) => void;
    onChange?: (e: any) => void;
  };
  form?: {
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean,
    ) => void;
    [key: string]: any;
  };
  value?: any;
  onChange?: (val: any) => void;
  onBlur?: (e: any) => void;
  name?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  field,
  form,
  value: manualValue,
  onChange: manualChange,
  onBlur: manualBlur,
  name: manualName,
  label,
  error,
  helperText,
  className = "",
  ...rest
}) => {
  const name = field?.name || manualName;
  const value = field?.value ?? manualValue;
  const onBlur = field?.onBlur || manualBlur;

  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    setDisplayValue(value ? formatNumberWithCommas(String(value)) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue.endsWith(".")) {
      setDisplayValue(inputValue);
      return;
    }

    const numericValue = unformatNumber(inputValue);
    setDisplayValue(numericValue ? formatNumberWithCommas(numericValue) : "");

    if (form && name) {
      form.setFieldValue(name, numericValue);
    } else if (manualChange) {
      manualChange(numericValue);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        {...rest}
        name={name}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        inputMode="decimal"
        className={`w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary md:text-sm ${className}`}
      />
      {error && helperText && (
        <p className="mt-1 text-sm text-red-600">{helperText}</p>
      )}
    </div>
  );
};

export default FormattedNumberInput;
