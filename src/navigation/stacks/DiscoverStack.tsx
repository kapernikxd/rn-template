import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DiscoverScreen } from '../../screens/discover/screens/DiscoverScreen';
import { DiscoverCollectionScreen } from '../../screens/discover/screens/DiscoverCollectionScreen';
import type { DiscoverStackParamList } from '../types';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export const DiscoverStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name="Discover"
      component={DiscoverScreen}
      options={{
        title: 'Коллекции',
      }}
    />
    <Stack.Screen
      name="DiscoverCollection"
      component={DiscoverCollectionScreen}
      options={({ route }) => ({
        title: `Подборка ${route.params.collectionId}`,
        headerBackTitle: 'Назад',
      })}
    />
  </Stack.Navigator>
);
