import { NavigationProp, useNavigation } from '@react-navigation/native';

import {
  type AuthRedirect,
  type MainTabParamList,
  type RootStackParamList,
  ROUTES,
} from '../../navigation/types';

/**
 * Хук-обёртка для навигации.
 * Следим, чтобы в params попадали ТОЛЬКО сериализуемые значения (plain-данные).
 */
export const usePortalNavigation = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const goToMain = (
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
  };

  return {
    goToLogin: (redirectTo?: AuthRedirect) =>
      navigation.navigate(ROUTES.Auth, {
        screen: ROUTES.Login,
        params: redirectTo ? { redirectTo } : undefined,
      }),
    goToOtp: (email: string, options?: { reset?: boolean; redirect?: AuthRedirect }) =>
      navigation.navigate(ROUTES.Auth, {
        screen: ROUTES.Otp,
        params: {
          email,
          reset: !!options?.reset,
          redirectTo: options?.redirect,
        },
      }),
    goToForgotPassword: () =>
      navigation.navigate(ROUTES.Auth, {
        screen: ROUTES.ForgotPassword,
      }),
    goToRegister: () =>
      navigation.navigate(ROUTES.Auth, {
        screen: ROUTES.Register,
      }),
    goToChangePassword: (link: string) =>
      navigation.navigate(ROUTES.Auth, {
        screen: ROUTES.ChangePassword,
        params: { link },
      }),

    goToChatMessages: ({ chatId }: { chatId: string }) =>
      navigation.navigate(ROUTES.RootTabs, {
        screen: ROUTES.ChatsTab,
        params: {
          screen: ROUTES.ChatMessages,
          params: {
            chatId,
          },
        },
      }),
    goToMain,

    goToProfile: (userId: string) => navigation.goBack(),

    goBack: () => navigation.goBack(),

    goToTermOfUse: () => navigation.navigate(ROUTES.TermsOfUse),
  };
};
