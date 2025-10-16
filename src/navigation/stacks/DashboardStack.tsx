import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { DashboardDetailsScreen } from '../../features/dashboard/screens/DashboardDetailsScreen';
import type { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerLargeTitle: true,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Главная',
      }}
    />
    <Stack.Screen
      name="DashboardDetails"
      component={DashboardDetailsScreen}
      options={{
        title: 'Подробности',
        headerBackTitle: 'Назад',
      }}
    />
  </Stack.Navigator>
);
