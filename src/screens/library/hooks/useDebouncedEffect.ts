// src/screens/Library/hooks/useDebouncedEffect.ts
import { useEffect } from "react";

export const useDebouncedEffect = (effect: () => void, delayMs: number, deps: any[]) => {
  useEffect(() => {
    const t = setTimeout(() => effect(), delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
