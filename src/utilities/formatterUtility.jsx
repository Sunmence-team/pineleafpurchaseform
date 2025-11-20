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