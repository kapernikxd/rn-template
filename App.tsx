import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from 'rn-vs-lb/theme';
import { StoreProvider, useRootStore, useStoreData } from './src/store/StoreProvider';
import { AppNavigator } from './src/navigation';
import { Theme } from './src/constants/theme';
import { Host } from 'react-native-portalize';
import CustomSnackbar from './src/components/CustomSnackbar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ForceUpdateWrapper } from './src/components/layouts/ForceUpdateWrapper';
import { View, StyleSheet } from 'react-native';
import { BottomAdBanner } from './src/components/ads/BottomAdBanner';

import './src/helpers/i18n';

const AppStatusBar = () => {
  const { isDark, theme } = useTheme();

  return (
    <StatusBar
      style={isDark ? 'light' : 'dark'}
      backgroundColor={theme.background}
    />
  );
};

export default function App() {
  // useEffect(() => {
  //   initAppMetrica();
  //   reportAppOpen();
  // }, []);

  return (
    <Host>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider theme={Theme}>
            <AppStatusBar />
            <StoreProvider>
              <AppWithConfig />
            </StoreProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Host>
  );
}

const AppWithConfig = () => {
  const { configStore } = useRootStore();
  const adsEnabled = useStoreData(configStore, (store) => store.adsEnabled);

  return (
    <ForceUpdateWrapper>
      <View style={styles.appContainer}>
        <View style={styles.navigatorContainer}>
          <AppNavigator />
        </View>
        {adsEnabled ? <BottomAdBanner /> : null}
      </View>
      <CustomSnackbar />
    </ForceUpdateWrapper>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  navigatorContainer: {
    flex: 1,
  },
});
