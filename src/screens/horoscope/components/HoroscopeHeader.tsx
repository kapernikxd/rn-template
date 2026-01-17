import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';
import { TokenBadge } from '../../../components';

type DashboardHeaderProps = {
  onPressFilters?: () => void;
  adsEnabled?: boolean;
  tokenBalance?: number | null;
  onBalanceChange?: (balance: number) => void;
  desciption?: string;
};

export const HoroscopeHeader: React.FC<DashboardHeaderProps> = ({
  adsEnabled,
  tokenBalance,
  onBalanceChange,
  onPressFilters,
  desciption,
}) => {
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
        right: {
          minWidth: 40,
          alignItems: 'flex-end',
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
          { desciption ? desciption : t('screens.dashboard.header.subtitle')}
        </Text>
      </View>

      <View style={styles.right}>
        {adsEnabled ? (
          <TokenBadge balance={tokenBalance ?? undefined} onBalanceChange={onBalanceChange} />
        ) : null}
      </View>
    </View>
  );
};
