// src/screens/Library/hooks/useLayoutAnimation.ts
import { useCallback, useEffect } from "react";
import { LayoutAnimation, Platform, UIManager } from "react-native";

export const useLayoutAnimation = () => {
  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const animate = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  return { animate };
};
