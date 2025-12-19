// src/screens/Library/utils/clampNumber.ts
export const clampNumber = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(Math.max(value, min), max);
};
