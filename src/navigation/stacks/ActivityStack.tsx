import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ActivityScreen } from '../../screens/activity/screens/ActivityScreen';
import type { ActivityStackParamList } from '../types';

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export const ActivityStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerLargeTitle: true,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name="Activity"
      component={ActivityScreen}
      options={{
        title: 'Активность',
      }}
    />
  </Stack.Navigator>
);
