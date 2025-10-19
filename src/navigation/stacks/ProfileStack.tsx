import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileScreen } from '../../screens/profile/screens/ProfileScreen';
import { ProfileSettingsScreen } from '../../screens/profile/screens/ProfileSettingsScreen';
import {
  AccountSettingsScreen,
  ChangePasswordScreen,
  EditProfilesScreen,
  NotificationSettingsScreen,
  SocialProfilesScreen,
} from '../../screens/profile/Settings';
import { withAuthGuard } from '../guards/withAuthGuard';
import { ROUTES, type ProfileStackParamList } from '../types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const GuardedProfileScreen = withAuthGuard(ProfileScreen, {
  redirect: {
    tab: ROUTES.ProfileTab,
    params: { screen: ROUTES.Profile },
  },
});

const GuardedProfileSettingsScreen = withAuthGuard(ProfileSettingsScreen, {
  redirect: {
    tab: ROUTES.ProfileTab,
    params: { screen: ROUTES.ProfileSettings },
  },
});

const GuardedEditProfileScreen = withAuthGuard(EditProfilesScreen, {
  redirect: {
    tab: ROUTES.ProfileTab,
    params: { screen: ROUTES.ProfileEdit },
  },
});

const GuardedAccountSettingsScreen = withAuthGuard(AccountSettingsScreen, {
  redirect: {
    tab: ROUTES.ProfileTab,
    params: { screen: ROUTES.ProfileAccountSettings },
  },
});

const GuardedChangePasswordScreen = withAuthGuard(ChangePasswordScreen, {
  redirect: {
    tab: ROUTES.ProfileTab,
    params: { screen: ROUTES.ProfileChangePassword },
  },
});

const GuardedSocialProfilesScreen = withAuthGuard(SocialProfilesScreen, {
  redirect: {
    tab: ROUTES.ProfileTab,
    params: { screen: ROUTES.ProfileSocialProfiles },
  },
});

const GuardedNotificationSettingsScreen = withAuthGuard(NotificationSettingsScreen, {
  redirect: {
    tab: ROUTES.ProfileTab,
    params: { screen: ROUTES.ProfileNotificationSettings },
  },
});

export const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShadowVisible: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name={ROUTES.Profile}
      component={GuardedProfileScreen}
      options={{
        title: 'Профиль',
        headerLargeTitle: true,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileSettings}
      component={GuardedProfileSettingsScreen}
      options={{
        title: 'Настройки',
        headerBackTitle: 'Назад',
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileEdit}
      component={GuardedEditProfileScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileAccountSettings}
      component={GuardedAccountSettingsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileChangePassword}
      component={GuardedChangePasswordScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileSocialProfiles}
      component={GuardedSocialProfilesScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileNotificationSettings}
      component={GuardedNotificationSettingsScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
