import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'rn-vs-lb/theme';
import { StoreProvider } from './src/store/StoreProvider';
import { AppNavigator } from './src/navigation';
import { Theme } from './src/constants/theme';
import { Host } from 'react-native-portalize';

export default function App() {
  return (
    <Host>
      <SafeAreaProvider>
        <ThemeProvider theme={Theme}>
          <StatusBar style="auto" />
          <StoreProvider>
            <AppNavigator />
          </StoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </Host>
  );
}
