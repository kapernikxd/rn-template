import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DiscoverScreen } from '../../features/discover/screens/DiscoverScreen';
import { DiscoverCollectionScreen } from '../../features/discover/screens/DiscoverCollectionScreen';
import type { DiscoverStackParamList } from '../types';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export const DiscoverStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerLargeTitle: true,
      headerShadowVisible: false,
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
