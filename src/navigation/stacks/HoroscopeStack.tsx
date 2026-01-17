import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HoroscopeStackParamList, ROUTES } from '../types';
import { HoroscopeScreen } from '../../screens/horoscope/HoroscopeScreen';

const Stack = createNativeStackNavigator<HoroscopeStackParamList>();

export const HoroscopeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen
      name={ROUTES.Horoscope}
      component={HoroscopeScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
