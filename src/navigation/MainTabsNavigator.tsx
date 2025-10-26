import React, { useEffect, useMemo, type ComponentType } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useLinkBuilder } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatsStack } from './stacks/ChatsStack';
import { DashboardStack } from './stacks/DashboardStack';
import { ProfileStack } from './stacks/ProfileStack';
import type { MainTabParamList } from './types';
import { useTheme } from 'rn-vs-lb/theme';
import { useRootStore, useStoreData } from '../store/StoreProvider';
import { Dot } from 'rn-vs-lb';
import { AiAgentCreateScreen } from '../screens/aibot';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabConfig = {
  name: keyof MainTabParamList;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  component: ComponentType;
};

const TABS: TabConfig[] = [
  { name: 'DashboardTab', label: 'Главная', icon: 'home', component: DashboardStack },
  { name: 'CreateBotTab', label: 'AI-агенты', icon: 'zap', component: AiAgentCreateScreen },
  { name: 'ChatsTab', label: 'Чаты', icon: 'message-circle', component: ChatsStack },
  { name: 'ProfileTab', label: 'Профиль', icon: 'user', component: ProfileStack },
];

type MainTabBarProps = BottomTabBarProps & {
  showLabels?: boolean;
};

const ICON_SIZE = 44;
const ICON_RADIUS = ICON_SIZE / 2;

const MainTabBar = ({ state, descriptors, navigation, showLabels = true }: MainTabBarProps) => {
  const { theme, isDark } = useTheme();
  const { onlineStore } = useRootStore();
  const hasUserNewMessage = useStoreData(onlineStore, (store) => store.hasUnreadPrivate);
  const { buildHref } = useLinkBuilder();
  const isWeb = Platform.OS === 'web';
  const activeRouteName = state.routes[state.index]?.name;

  useEffect(() => {
    if (activeRouteName === 'ChatsTab' && hasUserNewMessage) {
      onlineStore.setUserNewMessage(false);
    }
  }, [activeRouteName, hasUserNewMessage, onlineStore]);

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.white,
          borderTopColor: theme.border,
          paddingBottom: 0,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS.find(({ name }) => name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;
        const iconColor = isFocused ? isDark ? theme.black : theme.white : theme.black;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as any, route.params as never);
          }
        };
        const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

        // web: оставляем href; native: без href
        const href = isWeb ? buildHref(route.name, route.params) : undefined;

        // Кнопка только на круге: этот элемент и задаёт borderRadius + overflow
        const CircleButton = isWeb ? PlatformPressable : Pressable;
        const circleProps: any = isWeb
          ? {
            ...(href ? { href } : {}),
          }
          : {
            android_ripple: { color: theme.primaryLight + '22', borderless: false, radius: ICON_RADIUS + 4 },
          };

        return (
          <View key={route.key} style={styles.tabButton}>
            <CircleButton
              {...circleProps}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : undefined}
              accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
              testID={descriptors[route.key].options.tabBarButtonTestID}
              style={[
                styles.circlePressable,
                isFocused && { backgroundColor: "#212020" }, // активный круглый фон
              ]}
            >
              <Feather name={tab.icon} size={20} color={iconColor} />
            </CircleButton>

            {route.name === "ChatsTab" && <Dot style={{
              backgroundColor: theme.danger, right: 30,
              top: 6,
            }} display={hasUserNewMessage}/>}

            {showLabels ? (
              <Text style={[styles.label, isFocused && [styles.labelActive, { color: theme.primaryLight }]]}>
                {tab.label}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

type MainTabsNavigatorProps = {
  showLabels?: boolean;
};

export const MainTabsNavigator = ({ showLabels = true }: MainTabsNavigatorProps) => {
  const insets = useSafeAreaInsets();

  const tabBarScreenOptions = useMemo(
    () => ({
      headerShown: false as const,
    }),
    [],
  );

  return (
    <SafeAreaInsetsContext.Provider value={{ ...insets, bottom: 0 }}>
      <Tab.Navigator
        screenOptions={tabBarScreenOptions}
        tabBar={(props) => <MainTabBar {...props} showLabels={showLabels} />}
      >
        {TABS.map((tab) => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} options={{ title: tab.label }} />
        ))}
      </Tab.Navigator>
    </SafeAreaInsetsContext.Provider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 65,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // ВАЖНО: это и есть «круглая кнопка».
  // Размер = круг, borderRadius = половина, overflow: 'hidden' — обрезает риппл.
  circlePressable: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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

export default MainTabsNavigator;
