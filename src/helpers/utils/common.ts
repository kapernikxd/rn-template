export function isEmpty(value: any): boolean {
  if (value == null) return true; // null или undefined
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false; // для чисел, boolean и т.д.
}