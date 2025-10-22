import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabsNavigator } from './MainTabsNavigator';
import { AuthStack } from './stacks/AuthStack';
import { ROUTES, type RootStackParamList } from './types';
import { useRootStore, useStoreData } from '../store/StoreProvider';
import { ScreenLoader, MainLayout } from '../components';
import { TermsOfUseScreen } from '../screens/docs';
import { AiAgentScreen } from '../screens/aibot';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { authStore } = useRootStore();
  const hasAttemptedAutoLogin = useStoreData(
    authStore,
    (store) => store.hasAttemptedAutoLogin,
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
    }),
    [],
  );

  if (!hasAttemptedAutoLogin) {
    return <ScreenLoader />;
  }

  return (
    <NavigationContainer>
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
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
