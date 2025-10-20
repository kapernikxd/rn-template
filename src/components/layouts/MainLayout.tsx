import React, { useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from 'rn-vs-lb/theme';

import { useRootStore, useStoreData } from '../../store/StoreProvider';

export type MainLayoutProps = {
  children: ReactNode;
  edges?: Edge[];
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  topBackgroundColor?: string;
  bottomBackgroundColor?: string;
  backgroundSplit?: number;
};

export const MainLayout = ({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  containerStyle,
  contentStyle,
  topBackgroundColor,
  bottomBackgroundColor,
  backgroundSplit = 0.5,
}: MainLayoutProps) => {
  const { authStore, onlineStore } = useRootStore();
  const isAuthenticated = useStoreData(authStore, (store) => store.isAuthenticated);
  const { theme } = useTheme();

  const gradientColors = useMemo(
    () => ({
      top: topBackgroundColor ?? theme.background,
      bottom:
        bottomBackgroundColor ?? topBackgroundColor ?? theme.background,
    }),
    [bottomBackgroundColor, theme.background, topBackgroundColor],
  );
  const split = useMemo(
    () => Math.min(Math.max(backgroundSplit, 0), 1),
    [backgroundSplit],
  );

  useEffect(() => {
    if (isAuthenticated) {
      void onlineStore.connectSocket();
    } else {
      onlineStore.disconnectSocket();
    }

    return () => {
      onlineStore.disconnectSocket();
    };
  }, [isAuthenticated, onlineStore]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.background} pointerEvents="none">
        <View
          style={[
            styles.backgroundSection,
            {
              flex: split,
              backgroundColor: gradientColors.top,
            },
          ]}
        />
        <View
          style={[
            styles.backgroundSection,
            {
              flex: 1 - split,
              backgroundColor: gradientColors.bottom,
            },
          ]}
        />
      </View>

      <SafeAreaView edges={edges} style={[styles.safeArea, contentStyle]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  backgroundSection: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
