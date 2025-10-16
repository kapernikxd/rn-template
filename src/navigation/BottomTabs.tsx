import { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ActivityScreen } from '../screens/ActivityScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';

type TabIconName = 'home' | 'search' | 'bell' | 'user';

type TabConfig = {
  name: keyof RootTabParamList;
  label: string;
  icon: TabIconName;
  component: () => JSX.Element;
};

export type RootTabParamList = {
  Home: undefined;
  Search: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TABS: TabConfig[] = [
  { name: 'Home', label: 'Главная', icon: 'home', component: HomeScreen },
  { name: 'Search', label: 'Поиск', icon: 'search', component: SearchScreen },
  { name: 'Activity', label: 'События', icon: 'bell', component: ActivityScreen },
  { name: 'Profile', label: 'Профиль', icon: 'user', component: ProfileScreen },
];

export const BottomTabs = () => {
  const tabBarScreenOptions = useMemo(
    () =>
      ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }) as const,
    [],
  );

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={tabBarScreenOptions}>
        {TABS.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <View style={styles.iconContainer}>
                  <View
                    style={[
                      styles.iconWrapper,
                      focused && styles.iconWrapperActive,
                    ]}
                  >
                    <Feather
                      name={tab.icon}
                      size={20}
                      color={focused ? '#1E1E1E' : color}
                    />
                  </View>
                  <Text style={[styles.label, focused && styles.labelActive]}>
                    {tab.label}
                  </Text>
                </View>
              ),
              tabBarActiveTintColor: '#1E1E1E',
              tabBarInactiveTintColor: '#9CA3AF',
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#E0E7FF',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },
  labelActive: {
    color: '#1E1E1E',
    fontWeight: '600',
  },
});
