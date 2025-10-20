// navigation/types.ts
import type {
  NavigatorScreenParams,
  RouteProp,
} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, CompositeScreenProps } from '@react-navigation/native';

/**
 * 1) Единый источник имён роутов (без хардкода строк по проекту)
 *    Если потребуется переименовать — меняем здесь.
 */
export const ROUTES = {
  // auth screens
  Register: 'Register',
  Otp: 'Otp',
  Login: 'Login',
  ForgotPassword: 'ForgotPassword',
  ChangePassword: 'ChangePassword',

  // Tabs
  DashboardTab: 'DashboardTab',
  DiscoverTab: 'DiscoverTab',
  ChatsTab: 'ChatsTab',
  ProfileTab: 'ProfileTab',

  // Dashboard stack
  Dashboard: 'Dashboard',
  DashboardDetails: 'DashboardDetails',

  // Discover stack
  Discover: 'Discover',
  DiscoverCollection: 'DiscoverCollection',

  // Chats stack
  Chats: 'Chats',
  ChatMessages: 'ChatMessages',

  // Profile stack
  Profile: 'Profile',
  ProfileSettings: 'ProfileSettings',
  ProfileEdit: 'ProfileEdit',
  ProfileAccountSettings: 'ProfileAccountSettings',
  ProfileChangePassword: 'ProfileChangePassword',
  ProfileSocialProfiles: 'ProfileSocialProfiles',
  ProfileNotificationSettings: 'ProfileNotificationSettings',

  // Root-level (модалки/auth и т.п.)
  RootTabs: 'RootTabs',
  Auth: 'Auth',

  //docs
  TermsOfUse: 'TermsOfUse',
} as const;
export type RouteName = typeof ROUTES[keyof typeof ROUTES];

/**
 * 2) ParamList'ы для каждого стэка
 *    Пиши `undefined`, если параметров нет — это best practice в React Navigation.
 */
export type DashboardStackParamList = {
  [ROUTES.Dashboard]: undefined;
  [ROUTES.DashboardDetails]: undefined;
};

export type DiscoverStackParamList = {
  [ROUTES.Discover]: undefined;
  [ROUTES.DiscoverCollection]: { collectionId: string };
};

export type ChatsStackParamList = {
  [ROUTES.Chats]: undefined;
  [ROUTES.ChatMessages]: { chatId: string; title: string };
};

export type ProfileStackParamList = {
  [ROUTES.Profile]: undefined;
  [ROUTES.ProfileSettings]: undefined;
  [ROUTES.ProfileEdit]: undefined;
  [ROUTES.ProfileAccountSettings]: undefined;
  [ROUTES.ProfileChangePassword]: undefined;
  [ROUTES.ProfileSocialProfiles]: undefined;
  [ROUTES.ProfileNotificationSettings]: undefined;
};

/**
 * 3) Tabs: кладём внутрь NavigatorScreenParams соответствующих стэков
 */
export type MainTabParamList = {
  [ROUTES.DashboardTab]: NavigatorScreenParams<DashboardStackParamList>;
  [ROUTES.DiscoverTab]: NavigatorScreenParams<DiscoverStackParamList>;
  [ROUTES.ChatsTab]: NavigatorScreenParams<ChatsStackParamList>;
  [ROUTES.ProfileTab]: NavigatorScreenParams<ProfileStackParamList>;
};

export type AuthRedirect = {
  [Tab in keyof MainTabParamList]: {
    tab: Tab;
    params?: MainTabParamList[Tab];
  };
}[keyof MainTabParamList];

export type AuthStackParamList = {
  [ROUTES.Login]: { redirectTo?: AuthRedirect } | undefined;
  [ROUTES.Register]: undefined;
  [ROUTES.Otp]: { email: string; reset?: boolean; redirectTo?: AuthRedirect };
  [ROUTES.ForgotPassword]: undefined;
  [ROUTES.ChangePassword]: { link: string };
};

/**
 * 4) Root: обычно содержит Tabs и, например, модальные экраны
 */
export type RootStackParamList = {
  [ROUTES.RootTabs]: NavigatorScreenParams<MainTabParamList>;
  [ROUTES.Auth]: NavigatorScreenParams<AuthStackParamList>;

  [ROUTES.TermsOfUse]: undefined;
};

/**
 * 5) Удобные алиасы типов для экранов/навигации
 *    — чтобы в компонентах было меньше «жвачки» из generics
 */

// Навигация по табам целиком
export type TabsNav = BottomTabNavigationProp<MainTabParamList>;

// Навигация по корневому стеку
export type RootNav = NativeStackNavigationProp<RootStackParamList>;

// Навигация конкретного стэка:
export type DashboardNav = NativeStackNavigationProp<DashboardStackParamList>;
export type DiscoverNav = NativeStackNavigationProp<DiscoverStackParamList>;
export type ChatsNav = NativeStackNavigationProp<ChatsStackParamList>;
export type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

// Пример: пропсы экрана Dashboard, вложенного в табы + стек
export type DashboardScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, typeof ROUTES.Dashboard>,
  BottomTabScreenProps<MainTabParamList, typeof ROUTES.DashboardTab>
>;

// Пример: пропсы экрана коллекции Discover
export type DiscoverCollectionScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DiscoverStackParamList, typeof ROUTES.DiscoverCollection>,
  BottomTabScreenProps<MainTabParamList, typeof ROUTES.DiscoverTab>
>;

// Удобные хелперы для useRoute
export type DashboardRoute = RouteProp<
  DashboardStackParamList,
  typeof ROUTES.Dashboard
>;
export type DiscoverCollectionRoute = RouteProp<
  DiscoverStackParamList,
  typeof ROUTES.DiscoverCollection
>;

export type ChatMessagesRoute = RouteProp<
  ChatsStackParamList,
  typeof ROUTES.ChatMessages
>;

/**
 * 6) (опционально) module augmentation:
 *    чтобы DevTools/Linking и навигация знали о RootParamList глобально
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
