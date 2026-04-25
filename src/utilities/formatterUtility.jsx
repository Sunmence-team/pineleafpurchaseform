export const formatISODateToCustom = (isoString) => {
    if (!isoString) {
        return '';
    }

    const date = new Date(isoString);

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
