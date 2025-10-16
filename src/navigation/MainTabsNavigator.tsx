import { useMemo, type ComponentType } from 'react';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const MainTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        { backgroundColor: '#FFFFFF', borderTopColor: '#E5E7EB', paddingBottom: 16 + bottom },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS.find(({ name }) => name === route.name);

        if (!tab) {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused ? colors.primary : '#9CA3AF';
        const href = buildHref(route.name, route.params);

        return (
          <PlatformPressable
            key={route.key}
            href={href}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : undefined}
            accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
            testID={descriptors[route.key].options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <View style={styles.iconContainer}>
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                <Feather name={tab.icon} size={20} color={color} />
              </View>
              <Text style={[styles.label, isFocused && [styles.labelActive, { color: colors.primary }]]}>
                {tab.label}
              </Text>
            </View>
          </PlatformPressable>
        );
      })}
    </View>
  );
};

export const MainTabsNavigator = () => {
  const tabBarScreenOptions = useMemo(
    () => ({
      headerShown: false,
    }),
    [],
  );

  return (
    <Tab.Navigator screenOptions={tabBarScreenOptions} tabBar={(props) => <MainTabBar {...props} />}>
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} options={{ title: tab.label }} />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
