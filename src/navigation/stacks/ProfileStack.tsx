import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileScreen } from '../../screens/profile/screens/ProfileScreen';
import { ProfileSettingsScreen } from '../../screens/profile/screens/ProfileSettingsScreen';
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

export const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerLargeTitle: true,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name="Profile"
      component={GuardedProfileScreen}
      options={{
        title: 'Профиль',
      }}
    />
    <Stack.Screen
      name="ProfileSettings"
      component={GuardedProfileSettingsScreen}
      options={{
        title: 'Настройки',
        headerBackTitle: 'Назад',
      }}
    />
  </Stack.Navigator>
);
