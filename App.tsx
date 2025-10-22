import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'rn-vs-lb/theme';
import { StoreProvider } from './src/store/StoreProvider';
import { AppNavigator } from './src/navigation';
import { Theme } from './src/constants/theme';
import { Host } from 'react-native-portalize';
import CustomSnackbar from './src/components/CustomSnackbar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ForceUpdateWrapper } from './src/components/layouts/ForceUpdateWrapper';

export default function App() {
  return (
    <Host>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider theme={Theme}>
            <StatusBar style="auto" />
            <StoreProvider>
              <ForceUpdateWrapper>
                <AppNavigator />
                <CustomSnackbar />
              </ForceUpdateWrapper>
            </StoreProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Host>
  );
}
