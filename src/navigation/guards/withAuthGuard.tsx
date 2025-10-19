import React, { useCallback, useMemo } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { ScreenLoader } from '../../components/ScreenLoader';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { ROUTES, type AuthRedirect, type MainTabParamList, type RootStackParamList } from '../types';

type GuardOptions = {
  redirect?: AuthRedirect;
};

export function withAuthGuard<P extends { route?: { params?: Record<string, unknown> } }>(
  Component: React.ComponentType<P>,
  options?: GuardOptions,
): React.ComponentType<P> {
  const GuardedComponent: React.FC<P> = (props) => {
    const { authStore } = useRootStore();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const isAuthenticated = useStoreData(authStore, (store) => store.isAuthenticated);
    const hasAttemptedAutoLogin = useStoreData(
      authStore,
      (store) => store.hasAttemptedAutoLogin,
    );

    const redirectConfig = useMemo(() => {
      const baseRedirect = options?.redirect ?? { tab: ROUTES.DashboardTab };
      const params = baseRedirect.params;
      const routeParams = props.route?.params;

      if (!routeParams) {
        return baseRedirect;
      }

      if (params && typeof params === 'object') {
        const existingNestedParams = (params as { params?: Record<string, unknown> }).params;

        return {
          ...baseRedirect,
          params: {
            ...params,
            params: {
              ...(existingNestedParams ?? {}),
              ...routeParams,
            },
          },
        } as AuthRedirect;
      }

      return {
        ...baseRedirect,
        params: {
          params: routeParams,
        } as MainTabParamList[keyof MainTabParamList],
      } as AuthRedirect;
    }, [options?.redirect, props.route?.params]);

    useFocusEffect(
      useCallback(() => {
        if (hasAttemptedAutoLogin && !isAuthenticated) {
          navigation.navigate(ROUTES.Auth, {
            screen: ROUTES.Login,
            params: { redirectTo: redirectConfig },
          });
        }
      }, [hasAttemptedAutoLogin, isAuthenticated, navigation, redirectConfig]),
    );

    if (!hasAttemptedAutoLogin) {
      return <ScreenLoader />;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  const wrappedName = Component.displayName || Component.name || 'Component';
  GuardedComponent.displayName = `withAuthGuard(${wrappedName})`;

  return GuardedComponent;
}
