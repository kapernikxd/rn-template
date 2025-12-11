import React, { FC, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type SizesType } from 'rn-vs-lb/theme';

import { useRewardedAdTokensBySource } from '../../helpers/hooks/useRewardedAdTokensBySource';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { resolveAdSource } from '../../types/ads';

interface ChatLimitLockedNoticeProps {
  message?: string;
  countdownText: string | null;
  tokenCost: number;
  tokenBalance: number | null;
  onUnlock: () => void;
  isUnlocking: boolean;
  onTokenBalanceRefresh?: () => Promise<unknown> | void;
}

const ChatLimitLockedNotice: FC<ChatLimitLockedNoticeProps> = ({
  message,
  countdownText,
  tokenCost,
  tokenBalance,
  onUnlock,
  isUnlocking,
  onTokenBalanceRefresh,
}) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(() => getStyles(sizes, theme), [sizes, theme]);
  const resolvedMessage = message ?? t('components.chat.limitNotice.message');

  const handleRewardEarned = useCallback(
    (_updatedBalance: number) => {
      void onTokenBalanceRefresh?.();
    },
    [onTokenBalanceRefresh],
  );

  const { configStore } = useRootStore();
  const adsSourceFromConfig = useStoreData(
    configStore,
    (store) => store.adsConfig.ADS_SOURCE,
  );
  const { balance: rewardedBalance, isAdLoaded, showRewardedAd } =
    useRewardedAdTokensBySource(
      { onRewardEarned: handleRewardEarned },
      resolveAdSource(adsSourceFromConfig),
    );

  const adStatusText = useMemo(
    () =>
      t(
        isAdLoaded
          ? 'components.chat.limitNotice.adReady'
          : 'components.chat.limitNotice.adLoading',
      ),
    [isAdLoaded, t],
  );

  const effectiveTokenBalance = useMemo(() => {
    if (tokenBalance === null) return rewardedBalance;
    return Math.max(tokenBalance, rewardedBalance);
  }, [rewardedBalance, tokenBalance]);

  const hasBalance = !Number.isNaN(effectiveTokenBalance);
  const enoughForUnlock = hasBalance && effectiveTokenBalance >= tokenCost;

  return (
    <View
      style={[
        styles.container,
        { borderColor: theme.border, backgroundColor: theme.card },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.lockEmoji]} accessibilityRole="image" accessibilityLabel="Заблокировано">
          🔒
        </Text>
        <View style={styles.headerText}>
          <Text style={[typography.titleH6, { color: theme.title }]}>
            {resolvedMessage}
          </Text>
          <Text style={[typography.bodySm, { color: theme.text }]}>
            {countdownText
              ? t('components.chat.limitNotice.countdownWithValue', { countdown: countdownText })
              : t('components.chat.limitNotice.countdown')}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Cost / Balance */}
      <View style={styles.rowsGap}>
        <View style={styles.rowBetween}>
          <Text style={[typography.body, { color: theme.text }]}>
            {t('components.chat.limitNotice.costLabel')}
          </Text>
          <View
            style={[
              styles.pill,
              { backgroundColor: theme.primary + '22', borderColor: theme.primary },
            ]}
          >
            <Text style={[typography.bodySm, { color: theme.primary }]}> 
              {t('components.chat.limitNotice.costValue', { count: tokenCost })}
            </Text>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <Text style={[typography.body, { color: theme.text }]}>
            {t('components.chat.limitNotice.balanceLabel')}
          </Text>
          <View
            style={[
              styles.pill,
              {
                backgroundColor: hasBalance
                  ? enoughForUnlock
                    ? '#16a34a22' /* зелёный мягкий */
                    : '#ef444422' /* красный мягкий */
                  : theme.grey + '22',
                borderColor: hasBalance
                  ? enoughForUnlock
                    ? '#16a34a'
                    : '#ef4444'
                  : theme.border,
              },
            ]}
          >
            <Text
              style={[
                typography.bodySm,
                {
                  color: hasBalance
                    ? enoughForUnlock
                      ? '#16a34a'
                      : '#ef4444'
                    : theme.greyText,
                },
              ]}
            >
              {hasBalance
                ? t('components.chat.limitNotice.balanceValue', {
                    count: effectiveTokenBalance,
                  })
                : t('components.chat.limitNotice.balanceUnavailable')}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsGap}>
        <Pressable
          onPress={onUnlock}
          disabled={isUnlocking}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: theme.primary,
              opacity: isUnlocking ? 0.7 : pressed ? 0.85 : 1,
              shadowColor: theme.primary,
            },
          ]}
        >
          {isUnlocking ? (
            <View style={styles.btnContent}>
              <ActivityIndicator size="small" color={theme.white} />
              <Text style={[typography.body, styles.primaryBtnText]}>
                {t('components.chat.limitNotice.checking')}
              </Text>
            </View>
          ) : (
            <Text style={[typography.body, styles.primaryBtnText]}>
              {t('components.chat.limitNotice.unlockButton', { count: tokenCost })}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={showRewardedAd}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              borderColor: theme.primary,
              backgroundColor: theme.card,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={[typography.body, { color: theme.primary }]}>
            {t('components.chat.limitNotice.watchAd')}
          </Text>
          <Text
            style={[
              typography.bodySm,
              { color: isAdLoaded ? '#16a34a' : theme.text },
            ]}
          >
            {adStatusText}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (sizes: SizesType, theme: any) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius: sizes.radius ?? 12,
      paddingVertical: typeof sizes.sm === 'number' ? sizes.sm : 12,
      paddingHorizontal: typeof sizes.sm === 'number' ? sizes.sm : 12,
      gap: typeof sizes.sm === 'number' ? sizes.sm : 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 2,
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: typeof sizes.xs === 'number' ? sizes.xs : 8,
    },
    lockEmoji: {
      fontSize: 22,
      lineHeight: 22,
    },
    headerText: {
      flex: 1,
      gap: 2,
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      opacity: 0.7,
    },

    rowsGap: {
      gap: typeof sizes.xs === 'number' ? sizes.xs : 8,
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },

    actionsGap: {
      gap: typeof sizes.xs === 'number' ? sizes.xs : 8,
    },
    primaryBtn: {
      borderRadius: sizes.radius_sm ?? 10,
      paddingVertical: typeof sizes.xs === 'number' ? sizes.xs : 8,
      alignItems: 'center',
      justifyContent: 'center',
      // лёгкая тень для кнопки
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 1,
    },
    primaryBtnText: {
      color: theme?.white,
    },
    btnContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    secondaryBtn: {
      borderWidth: 1,
      borderRadius: sizes.radius_sm ?? 10,
      paddingVertical: typeof sizes.xs === 'number' ? sizes.xs : 8,
      paddingHorizontal: typeof sizes.sm === 'number' ? sizes.sm : 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: typeof sizes.xs === 'number' ? sizes.xs / 2 : 4,
    },
  });

export default ChatLimitLockedNotice;
