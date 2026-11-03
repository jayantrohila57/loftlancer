export const LOCAL_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

export const LOCAL_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  ...LOCAL_DATE_FORMAT,
  hour: "numeric",
  minute: "2-digit",
};

function toDate(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** en-US short month dates for product UI (e.g. Oct 13, 2026). */
export function formatDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = LOCAL_DATE_FORMAT,
) {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatDateTime(value: Date | string | number) {
  return formatDate(value, LOCAL_DATE_TIME_FORMAT);
}
