import { useMemo, type ComponentType } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ActivityStack } from './stacks/ActivityStack';
import { DashboardStack } from './stacks/DashboardStack';
import { DiscoverStack } from './stacks/DiscoverStack';
import { ProfileStack } from './stacks/ProfileStack';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabConfig = {
  name: keyof MainTabParamList;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  component: ComponentType;
};

const TABS: TabConfig[] = [
  { name: 'DashboardTab', label: 'Главная', icon: 'home', component: DashboardStack },
  { name: 'DiscoverTab', label: 'Обзор', icon: 'grid', component: DiscoverStack },
  { name: 'ActivityTab', label: 'Активность', icon: 'bell', component: ActivityStack },
  { name: 'ProfileTab', label: 'Профиль', icon: 'user', component: ProfileStack },
];

export const MainTabsNavigator = () => {
  const { colors } = useTheme();

  const tabBarScreenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
    }),
    [],
  );

  return (
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
                    focused && [styles.iconWrapperActive, { backgroundColor: colors.primary + '22' }],
                  ]}
                >
                  <Feather
                    name={tab.icon}
                    size={20}
                    color={focused ? colors.primary : color}
                  />
                </View>
                <Text style={[styles.label, focused && [styles.labelActive, { color: colors.primary }]]}>
                  {tab.label}
                </Text>
              </View>
            ),
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: '#9CA3AF',
          }}
        />
      ))}
    </Tab.Navigator>
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
    fontWeight: '600',
    color: '#1E1E1E',
  },
});
