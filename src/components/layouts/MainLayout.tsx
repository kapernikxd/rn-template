import React, { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from 'rn-vs-lb/theme';

import { useRootStore, useStoreData } from '../../store/StoreProvider';

export type MainLayoutProps = {
  children: ReactNode;
  edges?: Edge[];
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
};

export const MainLayout = ({
  children,
  edges = ['top', 'bottom'],
  containerStyle,
  contentStyle,
}: MainLayoutProps) => {
  const { authStore, onlineStore } = useRootStore();
  const isAuthenticated = useStoreData(authStore, (store) => store.isAuthenticated);
  const { theme } = useTheme();

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
    <View style={{flex: 1}}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
