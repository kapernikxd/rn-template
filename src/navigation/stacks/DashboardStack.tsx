import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '../../screens/dashboard/DashboardScreen';
import { DashboardDetailsScreen } from '../../screens/dashboard/DashboardDetailsScreen';
import type { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="DashboardDetails"
      component={DashboardDetailsScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
