import { NavigationContainer } from '@react-navigation/native';

import { MainTabsNavigator } from './MainTabsNavigator';

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <MainTabsNavigator showLabels={false}/>
    </NavigationContainer>
  );
};
