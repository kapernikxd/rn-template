import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SettingsScreen } from '../../screens/settings';
import { ROUTES, type SettingsParamList } from '../types';
import { NotificationSettingsScreen, ProfileInfoSettingsScreen } from '../../screens/profile/Settings';

const Stack = createNativeStackNavigator<SettingsParamList>();

export const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name={ROUTES.Settings}
      component={SettingsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={ROUTES.ProfleSettings}
      component={ProfileInfoSettingsScreen}
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
  </Stack.Navigator>
);
