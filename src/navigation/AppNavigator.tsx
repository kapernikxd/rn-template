import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useMemo } from 'react';

import { MainTabsNavigator } from './MainTabsNavigator';

export const AppNavigator = () => {
  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: '#1E40AF',
        background: '#FFFFFF',
        card: '#FFFFFF',
        text: '#1F2937',
        border: '#E5E7EB',
      },
    }),
    [],
  );

  return (
    <NavigationContainer theme={theme}>
      <MainTabsNavigator />
    </NavigationContainer>
  );
};
