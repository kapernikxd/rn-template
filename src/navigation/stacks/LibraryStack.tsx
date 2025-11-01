import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LibraryScreen } from '../../screens/library';
import { ROUTES, type LibraryStackParamList } from '../types';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export const LibraryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name={ROUTES.Library}
      component={LibraryScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

export default LibraryStack;
