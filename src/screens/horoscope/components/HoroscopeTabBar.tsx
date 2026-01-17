import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { TabBarAi as TabBar } from 'rn-vs-lb';
import { useTranslation } from 'react-i18next';

const TAB_KEYS = ['yesterday', 'today', 'tomorrow', 'week', 'month'] as const;

type HoroscopeTabBarProps = {
  activeIndex: number;
  onChange: (index: number) => void;
};

export const HoroscopeTabBar: React.FC<HoroscopeTabBarProps> = ({ activeIndex, onChange }) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: sizes.sm as number,
        },
        divider: {
          height: 1,
          backgroundColor: theme.border,
          marginTop: sizes.xs as number,
        },
      }),
    [theme, typography, sizes],
  );

  const tabs = useMemo(
    () =>
      TAB_KEYS.map((key) => ({
        key,
        label: t(`screens.dashboard.horoscope.tabs.${key}`),
      })),
    [t],
  );

  return (
    <View style={styles.container}>
        <TabBar
          tabs={tabs}
          activeIndex={activeIndex}
          onChange={onChange}
          activeColor={theme.title}
          inactiveColor={theme.text}
          indicatorColor="#F7C977"
          indicatorHeight={3}
          fontSize={16}
          fontWeightActive="700"
          fontWeightInactive="500"
          tabHorizontalPadding={0}
          gap={20}
        />
      <View style={styles.divider} />
    </View>
  );
};