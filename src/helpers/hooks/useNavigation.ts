import { useCallback } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import {
  type AuthRedirect,
  type MainTabParamList,
  type RootStackParamList,
  ROUTES,
} from '../../navigation/types';
import { useRootStore, useStoreData } from '../../store/StoreProvider';

/**
 * Хук-обёртка для навигации.
 * Следим, чтобы в params попадали ТОЛЬКО сериализуемые значения (plain-данные).
 */
export const usePortalNavigation = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { authStore } = useRootStore();
  const myUserId = useStoreData(authStore, (store) => store.user?.id ?? null);

  const goToMain = useCallback(
    (
      tab: keyof MainTabParamList = ROUTES.DashboardTab,
      params?: MainTabParamList[keyof MainTabParamList],
    ) => {
      // reset допустим, главное — сериализуемые params
      navigation.reset({
        index: 0,
        routes: [
          {
            name: ROUTES.RootTabs,
            params: {
              screen: tab,
              params, // <= не кладём сюда функции/классы/инстансы/события
            },
          } as never,
        ],
      });
    },
    [navigation],
  );

  const goToProfile = useCallback(
    (userId: string) => {
      if (!userId) return;

      const currentMyId = myUserId ?? authStore.getMyId() ?? null;

      if (currentMyId && userId === currentMyId) {
        navigation.navigate(ROUTES.RootTabs, {
          screen: ROUTES.ProfileTab,
          params: {
            screen: ROUTES.Profile,
          },
        });
        return;
      }

      navigation.navigate(ROUTES.RootTabs, {
        screen: ROUTES.ProfileTab,
        params: {
          screen: ROUTES.UserProfile,
          params: {
            userId,
          },
        },
      });
    },
    [authStore, myUserId, navigation],
  );

  return {
    goToLogin: useCallback(
      (redirectTo?: AuthRedirect) =>
        navigation.navigate(ROUTES.Auth, {
          screen: ROUTES.Login,
          params: redirectTo ? { redirectTo } : undefined,
        }),
      [navigation],
    ),
    goToOtp: useCallback(
      (email: string, options?: { reset?: boolean; redirect?: AuthRedirect }) =>
        navigation.navigate(ROUTES.Auth, {
          screen: ROUTES.Otp,
          params: {
            email,
            reset: !!options?.reset,
            redirectTo: options?.redirect,
          },
        }),
      [navigation],
    ),
    goToForgotPassword: useCallback(
      () =>
        navigation.navigate(ROUTES.Auth, {
          screen: ROUTES.ForgotPassword,
        }),
      [navigation],
    ),
    goToRegister: useCallback(
      () =>
        navigation.navigate(ROUTES.Auth, {
          screen: ROUTES.Register,
        }),
      [navigation],
    ),
    goToChangePassword: useCallback(
      (link: string) =>
        navigation.navigate(ROUTES.Auth, {
          screen: ROUTES.ChangePassword,
          params: { link },
        }),
      [navigation],
    ),

    goToChatMessages: useCallback(
      ({ chatId }: { chatId: string }) =>
        navigation.navigate(ROUTES.RootTabs, {
          screen: ROUTES.ChatsTab,
          params: {
            screen: ROUTES.ChatMessages,
            params: {
              chatId,
            },
          },
        }),
      [navigation],
    ),
    goToMain,

    goToProfile,

    goBack: useCallback(() => navigation.goBack(), [navigation]),
    canGoBack: useCallback(() => navigation.canGoBack(), [navigation]),

    goToTermOfUse: useCallback(() => navigation.navigate(ROUTES.TermsOfUse), [navigation]),
    goToAiBotProfile: useCallback(
      (aiBotId: string) => navigation.navigate(ROUTES.AiAgent, { aiBotId }),
      [navigation],
    ),
  };
};
