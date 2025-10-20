import React, { createContext, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { useTheme } from 'rn-vs-lb/theme';

type SafeAreaColors = {
  topColor?: string;
  bottomColor?: string;
  contentColor?: string;
};

type SafeAreaColorContextType = {
  colors: SafeAreaColors;
  setColors: (newColors: SafeAreaColors) => void;
};

const SafeAreaColorContext = createContext<SafeAreaColorContextType | null>(null);

export const useSafeAreaColors = () => {
  const ctx = useContext(SafeAreaColorContext);
  if (!ctx) throw new Error('useSafeAreaColors must be used within SafeAreaColorProvider');
  return ctx;
};

export const SafeAreaColorProvider = ({
  children,
  defaultContentColor = '#fff',
  defaultTopColor,
  defaultBottomColor,
}: {
  children: ReactNode;
  defaultContentColor?: string;
  defaultTopColor?: string;
  defaultBottomColor?: string;
}) => {
  const { theme } = useTheme();
  const [colors, setColors] = useState<SafeAreaColors>({
    topColor: defaultTopColor ?? defaultContentColor,
    bottomColor: defaultBottomColor ?? theme.white,
    contentColor: defaultContentColor,
  });

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaColorContext.Provider value={{ colors, setColors }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.contentColor }}
      >
        {/* Верхняя safe-area зона */}
        {insets.top > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: insets.top,
              backgroundColor: colors.topColor ?? colors.contentColor,
            }}
          />
        )}

        {/* Нижняя safe-area зона */}
        {insets.bottom > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: insets.bottom,
              backgroundColor: colors.bottomColor ?? colors.contentColor,
            }}
          />
        )}

        {children}
      </SafeAreaView>
    </SafeAreaColorContext.Provider>
  );
};
