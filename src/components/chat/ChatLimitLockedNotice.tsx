import React, { FC, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, type SizesType } from 'rn-vs-lb/theme';

import { useRewardedAdTokens } from '../../helpers/hooks/useRewardedAdTokens';

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
  message = 'Лимит сообщений исчерпан',
  countdownText,
  tokenCost,
  tokenBalance,
  onUnlock,
  isUnlocking,
  onTokenBalanceRefresh,
}) => {
  const { theme, typography, sizes } = useTheme();
  const handleRewardEarned = useCallback(
    (_updatedBalance: number) => {
      void onTokenBalanceRefresh?.();
    },
    [onTokenBalanceRefresh],
  );
  const { balance: rewardedBalance, isAdLoaded, showRewardedAd } = useRewardedAdTokens({
    onRewardEarned: handleRewardEarned,
  });
  const styles = getStyles(sizes);
  const adStatusText = useMemo(
    () => (isAdLoaded ? 'Реклама готова к показу' : 'Реклама загружается...'),
    [isAdLoaded],
  );
  const effectiveTokenBalance = useMemo(() => {
    if (tokenBalance === null) {
      return rewardedBalance;
    }

    return Math.max(tokenBalance, rewardedBalance);
  }, [rewardedBalance, tokenBalance]);

  return (
    <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.card }]}> 
      <Text style={[typography.titleH6Regular, { color: theme.title }]}>{message}</Text>
      <Text style={[typography.bodySm, { color: theme.text }]}>
        {countdownText
          ? `Подождите ${countdownText} или используйте токены.`
          : 'Подождите окончания таймера или используйте токены.'}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={onUnlock}
        disabled={isUnlocking}
      >
        <Text style={[typography.body, { color: theme.white }]}>
          {isUnlocking ? 'Проверяем...' : `Продолжить за ${tokenCost} токенов`}
        </Text>
      </TouchableOpacity>
      <Text style={[typography.bodySm, { color: theme.greyText }]}>    
        {Number.isNaN(effectiveTokenBalance)
          ? 'Баланс токенов недоступен'
          : `Доступно токенов: ${effectiveTokenBalance}`}
      </Text>
      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: theme.primary }]}
        onPress={showRewardedAd}
        activeOpacity={0.85}
      >
        <Text style={[typography.body, { color: theme.primary }]}>Посмотреть рекламу</Text>
        <Text style={[typography.bodySm, { color: theme.text }]}>{adStatusText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (sizes: SizesType) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius: sizes.radius ?? 12,
      paddingVertical: typeof sizes.sm === 'number' ? sizes.sm : 12,
      paddingHorizontal: typeof sizes.sm === 'number' ? sizes.sm : 12,
      gap: typeof sizes.xs === 'number' ? sizes.xs : 8,
    },
    button: {
      borderRadius: sizes.radius_sm ?? 10,
      paddingVertical: typeof sizes.xs === 'number' ? sizes.xs : 8,
      alignItems: 'center',
    },
    secondaryButton: {
      borderWidth: 1,
      borderRadius: sizes.radius_sm ?? 10,
      paddingVertical: typeof sizes.xs === 'number' ? sizes.xs : 8,
      alignItems: 'center',
      paddingHorizontal: typeof sizes.sm === 'number' ? sizes.sm : 12,
      gap: typeof sizes.xs === 'number' ? sizes.xs / 2 : 4,
    },
  });

export default ChatLimitLockedNotice;
