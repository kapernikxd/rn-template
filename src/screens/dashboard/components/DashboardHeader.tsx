import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';

type DashboardHeaderProps = {
  onPressFilters?: () => void;
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onPressFilters }) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: sizes.xs as number,
        },
        left: {
          gap: sizes.xs as number,
        },
        logoWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        ai: {
          fontSize: 24,
          fontWeight: '900',
          color: theme.primary,
          marginRight: 4,
          letterSpacing: 0.5,
          textShadowColor: 'rgba(0,0,0,0.25)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        },
        logoText: {
          fontSize: 24,
          fontWeight: '700',
          color: theme.title,
          letterSpacing: 0.5,
        },
        moon: {
          fontSize: 22,
          marginLeft: 4,
          textShadowColor: 'rgba(0,0,0,0.22)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        },
        subtitle: {
          ...typography.bodySm,
          color: theme.greyText,
        },
        button: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.card,
        },
      }),
    [theme, typography, sizes],
  );

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logoWrapper}>
          <Text style={styles.ai}>AI</Text>
          <Text style={styles.logoText}>Astrology</Text>
          <Text style={styles.moon}> 🌙</Text>
        </View>
        <Text style={styles.subtitle}>
          {t('screens.dashboard.header.subtitle')}
        </Text>
      </View>

      {/* Если захочешь включить фильтры — просто раскомментируй */}
      {/* <Pressable
        onPress={onPressFilters}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={t('screens.dashboard.header.accessibility.openFilters')}
        hitSlop={8}
      >
        <Feather name="sliders" size={20} color={theme.title} />
      </Pressable> */}
    </View>
  );
};
