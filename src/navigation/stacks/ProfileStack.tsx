import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileScreen } from '../../screens/profile/screens/ProfileScreen';
import { ProfileSettingsScreen } from '../../screens/profile/screens/ProfileSettingsScreen';
import { UserProfileScreen } from '../../screens/chats/UserProfileScreen';
import {
  AccountSettingsScreen,
  ChangePasswordScreen,
  EditProfilesScreen,
  NotificationSettingsScreen,
  SocialProfilesScreen,
} from '../../screens/profile/Settings';
import { ROUTES, type ProfileStackParamList } from '../types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.ProfileSettings}
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name={ROUTES.Profile}
      component={ProfileScreen}
      options={{
        title: 'Профиль',
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileSettings}
      component={ProfileSettingsScreen}
      options={{
        title: 'Настройки',
        headerBackTitle: 'Назад',
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileEdit}
      component={EditProfilesScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileAccountSettings}
      component={AccountSettingsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileChangePassword}
      component={ChangePasswordScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileSocialProfiles}
      component={SocialProfilesScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfileNotificationSettings}
      component={NotificationSettingsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.UserProfile}
      component={UserProfileScreen}
      options={{
        title: 'Профиль пользователя',
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
