import { parseISO } from "date-fns";

export const parseSafeDate = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal;
  }
  if (typeof dateVal === "number") {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateVal === "string") {
    const trimmed = dateVal.trim();
    if (!trimmed || trimmed === "N/A" || trimmed === "null" || trimmed === "undefined") {
      return null;
    }

    // Convert MySQL "YYYY-MM-DD HH:mm:ss" to ISO "YYYY-MM-DDTHH:mm:ss" for cross-browser support (e.g. Safari)
    const normalized =
      trimmed.includes(" ") && !trimmed.includes("T")
        ? trimmed.replace(" ", "T")
        : trimmed;

    try {
      const parsed = parseISO(normalized);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {
      // Fall back to native Date
    }

    const nativeDate = new Date(normalized);
    if (!isNaN(nativeDate.getTime())) {
      return nativeDate;
    }
  }
  return null;
};

export const formatISODateToCustom = (isoString) => {
    if (!isoString) {
        return '';
    }

    const date = parseSafeDate(isoString);
    if (!date) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}${ampm}`;
};


export const formatterUtility = (amount, noSign = false, currencyType = "naira") => {
  if (amount === null || amount === undefined) {
    return "";
  }
  const pickedSign = currencyType === "naira" ? "₦" : currencyType === "euro" ? "€" : currencyType === "dollar" ? "$" : "₦"
  const sign = noSign ? "" : pickedSign;
  return `${sign}${amount.toLocaleString("en-NG")}`;
};

/**
 * Formats a number with thousands separators.
 * @param value - The number or string to format.
 * @returns A formatted string (e.g., "1,000,000").
 */
export const formatNumberWithCommas = (value) => {
  const num = Number(value);
  if (isNaN(num)) {
    return "";
  }
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Removes all non-digit characters from a string.
 * @param value - The string to unformat.
 * @returns A string containing only digits.
 */
export const unformatNumber = (value) => {
  return value.replace(/\D/g, '');
};



export function formatUnderScores(
  input,
  { reverse = false, capitalize = false } = {},
) {
  if (reverse) {
    // Replace spaces with underscores
    return input.trim().replace(/\s+/g, "_");
  }

  // Original logic: Replace underscores with spaces
  let formatted = input.replace(/_/g, " ");

  if (capitalize) {
    formatted = formatted
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return formatted;
}