import { useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICON: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Search: 'search',
  Notifications: 'notifications',
  Settings: 'settings',
};

const TAB_ICON_OUTLINE: Record<
  keyof RootTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  Home: 'home-outline',
  Search: 'search-outline',
  Notifications: 'notifications-outline',
  Settings: 'settings-outline',
};

type ScreenOptionsProps = {
  route: RouteProp<RootTabParamList, keyof RootTabParamList>;
};

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const screenOptions = useCallback(
    ({ route }: ScreenOptionsProps): BottomTabNavigationOptions => ({
      headerShown: false,
      tabBarActiveTintColor: isDarkMode ? '#fff' : '#111',
      tabBarInactiveTintColor: isDarkMode ? '#8b8b8b' : '#8a8a8a',
      tabBarStyle: {
        backgroundColor: isDarkMode ? '#111' : '#fff',
        borderTopColor: isDarkMode ? '#222' : '#e5e5e5',
      },
      tabBarIcon: ({ focused, color, size }) => (
        <Ionicons
          name={focused ? TAB_ICON[route.name] : TAB_ICON_OUTLINE[route.name]}
          size={size}
          color={color}
        />
      ),
    }),
    [isDarkMode],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
