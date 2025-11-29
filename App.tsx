import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from 'rn-vs-lb/theme';
import { StoreProvider } from './src/store/StoreProvider';
import { AppNavigator } from './src/navigation';
import { Theme } from './src/constants/theme';
import { Host } from 'react-native-portalize';
import CustomSnackbar from './src/components/CustomSnackbar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ForceUpdateWrapper } from './src/components/layouts/ForceUpdateWrapper';

import i18n from './src/helpers/i18n';
import { getPreferredLanguage } from './src/helpers/i18n/languageStorage';

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

  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const storedLanguage = await getPreferredLanguage();

        if (storedLanguage) {
          await i18n.changeLanguage(storedLanguage);
        }
      } catch (error) {
        console.warn('Failed to initialize preferred language', error);
      } finally {
        setIsLanguageReady(true);
      }
    };

    void initializeLanguage();
  }, []);

  if (!isLanguageReady) {
    return null;
  }

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
  return (
    <ForceUpdateWrapper>
      <AppNavigator />
      <CustomSnackbar />
    </ForceUpdateWrapper>
  );
};
