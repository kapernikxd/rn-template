import React, { useMemo, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { MainTabsNavigator } from './MainTabsNavigator';
import { AuthStack } from './stacks/AuthStack';
import { ROUTES, type RootStackParamList } from './types';
import { useRootStore, useStoreData } from '../store/StoreProvider';
import { ScreenLoader, MainLayout } from '../components';
import { TermsOfUseScreen } from '../screens/docs';
import { AiAgentScreen, AiAgentCreateScreen, AiAgentEditScreen } from '../screens/aibot';
import Onboarding from '../screens/onboarding/Onboarding';
import { useOnboarding } from '../helpers/hooks/useOnboarding';
import { BottomAdBanner } from '../components/ads/BottomAdBanner';
import { AnalyticsEvent, trackEvent } from '../services/analytics/events';
import { YandexBottomAdBanner } from '../components/ads/yandex';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);
  const routeNameRef = useRef<string | undefined>();
  const { authStore, configStore } = useRootStore();
  const hasAttemptedAutoLogin = useStoreData(
    authStore,
    (store) => store.hasAttemptedAutoLogin,
  );
  const adsEnabled = useStoreData(configStore, (store) => store.adsEnabled);

  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
    }),
    [],
  );

  const {
    ready: isOnboardingReady,
    seen: hasSeenOnboarding,
    markSeen: markOnboardingSeen,
  } = useOnboarding();

  if (!hasAttemptedAutoLogin || !isOnboardingReady) {
    return <ScreenLoader />;
  }

  if (!hasSeenOnboarding) {
    return (
      <Onboarding
        onFinish={() => {
          markOnboardingSeen().catch((error) => {
            console.error('Failed to mark onboarding as seen', error);
          });
        }}
      />
    );
  }
  return (
    <View style={styles.appContainer}>
      <View style={styles.navigatorContainer}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            const currentRoute = navigationRef.current?.getCurrentRoute();
            routeNameRef.current = currentRoute?.name;

            if (currentRoute?.name) {
              void trackEvent(AnalyticsEvent.ScreenView, {
                route: currentRoute.name,
              });
            }
          }}
          onStateChange={() => {
            const currentRoute = navigationRef.current?.getCurrentRoute();
            if (!currentRoute?.name || routeNameRef.current === currentRoute.name) {
              return;
            }

            routeNameRef.current = currentRoute.name;
            void trackEvent(AnalyticsEvent.ScreenView, {
              route: currentRoute.name,
            });
          }}
        >
          <RootStack.Navigator initialRouteName={ROUTES.RootTabs} screenOptions={screenOptions}>
            <RootStack.Screen name={ROUTES.RootTabs}>
              {() => (
                <MainLayout>
                  <MainTabsNavigator showLabels={false} />
                </MainLayout>
              )}
            </RootStack.Screen>
            <RootStack.Screen name={ROUTES.Auth} component={AuthStack} />
            <RootStack.Screen name={ROUTES.TermsOfUse} component={TermsOfUseScreen} />
            <RootStack.Screen name={ROUTES.AiAgent}>
              {(props) => (
                <MainLayout>
                  <AiAgentScreen {...props} />
                </MainLayout>
              )}
            </RootStack.Screen>
            <RootStack.Screen name={ROUTES.AiAgentCreate}>
              {(props) => (
                <MainLayout>
                  <AiAgentCreateScreen />
                </MainLayout>
              )}
            </RootStack.Screen>
            <RootStack.Screen name={ROUTES.AiAgentEdit}>
              {(props) => (
                <MainLayout>
                  <AiAgentEditScreen {...props} />
                </MainLayout>
              )}
            </RootStack.Screen>
          </RootStack.Navigator>
        </NavigationContainer>
      </View>
      {adsEnabled ? <YandexBottomAdBanner /> : null}
    </View>
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
