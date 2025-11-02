import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SettingsScreen } from '../../screens/settings';
import { ROUTES, type SettingsParamList } from '../types';

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
  </Stack.Navigator>
);
