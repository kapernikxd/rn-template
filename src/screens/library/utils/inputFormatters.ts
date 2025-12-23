export const sanitizeNumericInput = (
  value: string,
  max: number,
  maxLength: number,
) => {
  const digits = value.replace(/\D/g, "").slice(0, maxLength);
  if (!digits) return "";

  const numeric = Number(digits);
  if (Number.isNaN(numeric)) return "";

  return numeric > max ? String(max) : digits;
};

export const formatTimeValue = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (!digits) return "";

  const hoursRaw = digits.slice(0, 2);
  const minutesRaw = digits.slice(2);

  const hoursNumber = Math.min(Number(hoursRaw), 23);
  const hoursString =
    digits.length >= 2
      ? hoursNumber.toString().padStart(2, "0")
      : hoursNumber.toString();

  if (digits.length <= 2) {
    return hoursString;
  }

  const minutesNumber = Math.min(Number(minutesRaw), 59);
  const minutesString = minutesNumber.toString().padStart(2, "0");

  return `${hoursString}:${minutesString}`;
};
