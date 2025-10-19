import { NavigationProp, useNavigation } from '@react-navigation/native';

import {
  type AuthRedirect,
  type MainTabParamList,
  type RootStackParamList,
  ROUTES,
} from '../../navigation/types';

export const usePortalNavigation = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const goToMain = (
    tab: keyof MainTabParamList = ROUTES.DashboardTab,
    params?: MainTabParamList[keyof MainTabParamList],
  ) => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: ROUTES.RootTabs,
          params: {
            screen: tab,
            params,
          },
        } as never,
      ],
    });
  };

  return {
    goToLogin: (redirect?: AuthRedirect) =>
      navigation.navigate(ROUTES.Auth, {
        screen: ROUTES.Login,
        params: redirect ? { redirectTo: redirect } : undefined,
      }),
    goToOtp: (email: string, options?: { reset?: boolean; redirect?: AuthRedirect }) =>
      navigation.navigate(ROUTES.Auth, {
        screen: ROUTES.Otp,
        params: { email, reset: options?.reset, redirectTo: options?.redirect },
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

    goToMain,

    goToTermOfUse: () => navigation.navigate(ROUTES.TermsOfUse),
  };
};
