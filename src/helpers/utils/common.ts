export function isEmpty(value: any): boolean {
  if (value == null) return true; // null или undefined
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false; // для чисел, boolean и т.д.
}

export function capitalizeFirstLetter(text?: string): string {
  if (!text) return ""
  const trimmed = text.trim();
  if (trimmed.length === 0) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}