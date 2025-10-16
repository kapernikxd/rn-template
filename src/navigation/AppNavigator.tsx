import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BottomTabNavigator from './BottomTabNavigator';

const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1a73e8',
    background: '#ffffff',
    card: '#ffffff',
    text: '#111111',
    border: '#e5e5e5',
    notification: '#1a73e8',
  },
};

const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#8ab4f8',
    background: '#000000',
    card: '#121212',
    text: '#ffffff',
    border: '#222222',
    notification: '#8ab4f8',
  },
};

export default function AppNavigator() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
