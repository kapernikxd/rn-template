import React, { useEffect, type ReactNode } from 'react';
import { useTheme } from 'rn-vs-lb/theme';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { SafeAreaColorProvider } from '../../store/SafeAreaColorProvider';

export type MainLayoutProps = {
  children: ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { authStore, onlineStore, chatStore } = useRootStore();
  const isAuthenticated = useStoreData(authStore, (store) => store.isAuthenticated);
  const { theme } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      void onlineStore.connectSocket();
      void chatStore.hasUnreadMessages();
    } else {
      onlineStore.disconnectSocket();
    }
    return () => {
      onlineStore.disconnectSocket();
    };
  }, [isAuthenticated, onlineStore]);

  return (
    <SafeAreaColorProvider defaultContentColor={theme.background}>
      {children}
    </SafeAreaColorProvider>
  );
};
