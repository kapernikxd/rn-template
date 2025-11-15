import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { TabBarAi as TabBar } from 'rn-vs-lb';


const tabs = [
  { key: 'yesterday', label: 'Вчера' },
  { key: 'today', label: 'Сегодня' },
  { key: 'tomorrow', label: 'Завтра' },
  { key: 'week', label: 'На неделю' },
  { key: 'month', label: 'На месяц' },
];

type HoroscopeTabBarProps = {
  activeIndex: number;
  onChange: (index: number) => void;
};

export const HoroscopeTabBar: React.FC<HoroscopeTabBarProps> = ({ activeIndex, onChange }) => {
  const { theme, typography, sizes } = useTheme();

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