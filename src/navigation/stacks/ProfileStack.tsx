import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { ProfileSettingsScreen } from '../../features/profile/screens/ProfileSettingsScreen';
import type { ProfileStackParamList } from '../types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

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
      component={ProfileScreen}
      options={{
        title: 'Профиль',
      }}
    />
    <Stack.Screen
      name="ProfileSettings"
      component={ProfileSettingsScreen}
      options={{
        title: 'Настройки',
        headerBackTitle: 'Назад',
      }}
    />
  </Stack.Navigator>
);
