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
import { View, StyleSheet } from 'react-native';
import { BottomAdBanner } from './src/components/ads/BottomAdBanner';
import { ADS_ENABLED } from './src/constants/links';

export default function App() {
  return (
    <Host>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider theme={Theme}>
            <StatusBar style="auto" />
            <StoreProvider>
              <ForceUpdateWrapper>
                <View style={styles.appContainer}>
                  <View style={styles.navigatorContainer}>
                    <AppNavigator />
                  </View>
                  {ADS_ENABLED ? <BottomAdBanner /> : null}
                </View>
                <CustomSnackbar />
              </ForceUpdateWrapper>
            </StoreProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Host>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  navigatorContainer: {
    flex: 1,
  },
});
