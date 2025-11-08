import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ActionSheetIOS,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, type SizesType } from 'rn-vs-lb/theme';
import { useRewardedAdTokens } from '../../helpers/hooks/useRewardedAdTokens';

type Props = {
  message?: string;
  countdownText: string | null;
  tokenCost: number;
  tokenBalance: number | null;
  onUnlock: () => void;
  isUnlocking: boolean;
  onTokenBalanceRefresh?: () => Promise<unknown> | void;
};

const ChatLimitLockedNotice = ({
  message,
  countdownText,
  tokenCost,
  tokenBalance,
  onUnlock,
  isUnlocking,
  onTokenBalanceRefresh,
}: Props) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(sizes, theme), [sizes, theme]);
  const resolvedMessage = message ?? t('components.chat.limitNotice.message');

  const handleRewardEarned = useCallback(
    (_: number) => void onTokenBalanceRefresh?.(),
    [onTokenBalanceRefresh],
  );

  const { balance: rewardedBalance, isAdLoaded, showRewardedAd } =
    useRewardedAdTokens({ onRewardEarned: handleRewardEarned });
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
  }, [tokenBalance, rewardedBalance]);

  const hasBalance = !Number.isNaN(effectiveTokenBalance);

  // --- Меню: iOS — ActionSheet, Android/Web — Modal ---
  const [menuVisible, setMenuVisible] = useState(false);
  const closeMenu = useCallback(() => setMenuVisible(false), []);
  const openMenu = useCallback(() => {
    if (Platform.OS === 'ios') {
      const options = [
        t('components.chat.limitNotice.watchAd') +
          (isAdLoaded ? '' : ` ${t('components.chat.limitNotice.unavailableSuffix')}`),
        t('components.chat.limitNotice.refreshBalance'),
        t('components.chat.limitNotice.whatAreTokens'),
        t('common.cancel'),
      ];
      const cancelButtonIndex = 3;
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex, userInterfaceStyle: 'automatic' },
        (idx) => {
          if (idx === 0 && isAdLoaded) showRewardedAd();
          else if (idx === 1) void onTokenBalanceRefresh?.();
          else if (idx === 2) {
            // роут на FAQ/модалку — на твой вкус
          }
        },
      );
    } else {
      setMenuVisible(true);
    }
  }, [
    isAdLoaded,
    onTokenBalanceRefresh,
    showRewardedAd,
    t,
  ]);

  const onWatchAd = useCallback(() => {
    if (isAdLoaded) {
      closeMenu();
      showRewardedAd();
    }
  }, [isAdLoaded, showRewardedAd, closeMenu]);

  const onRefreshBalance = useCallback(() => {
    closeMenu();
    void onTokenBalanceRefresh?.();
  }, [onTokenBalanceRefresh, closeMenu]);

  return (
    <>
      <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]}>
        {/* верх */}
        <View style={styles.topRow}>
          <Text
            style={styles.lock}
            accessibilityRole="image"
            accessibilityLabel={t('components.chat.limitNotice.accessibility.locked')}
          >
            🔒
          </Text>
          <Text style={[typography.bodySm, styles.title, { color: theme.title }]} numberOfLines={1}>
            {resolvedMessage}
          </Text>
          <Pressable onPress={openMenu} hitSlop={8} style={styles.dotsBtn} accessibilityRole="button">
            <Ionicons name="ellipsis-horizontal" size={18} color={theme.text} />
          </Pressable>
        </View>

        {/* подзаголовок */}
        <Text style={[typography.body, { color: theme.text }]} numberOfLines={1}>
          {countdownText
            ? t('components.chat.limitNotice.countdownWithValue', { countdown: countdownText })
            : t('components.chat.limitNotice.countdownShort')}
        </Text>

        {/* метрики */}
        <View style={styles.metricsRow}>
          <Pill
            text={t('components.chat.limitNotice.pillCost', { count: tokenCost })}
            borderColor={theme.primary}
            bgColor={theme.primary + '14'}
            textColor={theme.primary}
          />
          <Pill
            text={
              hasBalance
                ? t('components.chat.limitNotice.pillBalance', { count: effectiveTokenBalance })
                : t('components.chat.limitNotice.pillBalanceUnavailable')
            }
            borderColor={theme.border}
            bgColor={theme.grey + '10'}
            textColor={theme.text}
          />
        </View>

        {/* кнопки */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={onUnlock}
            disabled={isUnlocking}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: theme.primary, opacity: isUnlocking ? 0.7 : pressed ? 0.9 : 1 },
            ]}
            accessibilityRole="button"
          >
            {isUnlocking ? (
              <View style={styles.btnContent}>
                <ActivityIndicator size="small" color={theme.white} />
                <Text style={[typography.body, styles.primaryText]}>
                  {t('components.chat.limitNotice.checking')}
                </Text>
              </View>
            ) : (
              <Text style={[typography.body, styles.primaryText]} numberOfLines={1}>
                {t('components.chat.limitNotice.unlockButton', { count: tokenCost })}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={openMenu}
            style={({ pressed }) => [
              styles.ghostBtn,
              { borderColor: theme.primary, opacity: pressed ? 0.9 : 1 },
            ]}
            accessibilityRole="button"
          >
            <Ionicons name="flash-outline" size={14} color={theme.primary} />
            <Text style={[typography.body, { color: theme.primary }]} numberOfLines={1}>
              {t('components.chat.limitNotice.more')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ANDROID/WEB MENU (Modal) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={modalStyles.backdrop} onPress={closeMenu} />
        <View style={[modalStyles.sheet, { backgroundColor: theme.card }]}>
          <SheetItem
            icon={<Ionicons name="play-circle-outline" size={18} color={isAdLoaded ? '#16a34a' : theme.greyText} />}
            title={t('components.chat.limitNotice.watchAd')}
            subtitle={adStatusText}
            disabled={!isAdLoaded}
            onPress={onWatchAd}
            typography={typography}
            theme={theme}
          />
          <SheetItem
            icon={<Ionicons name="refresh-outline" size={18} color={theme.text} />}
            title={t('components.chat.limitNotice.refreshBalance')}
            subtitle={t('components.chat.limitNotice.refreshBalanceDescription')}
            onPress={onRefreshBalance}
            typography={typography}
            theme={theme}
          />
          <SheetItem
            icon={<Ionicons name="help-circle-outline" size={18} color={theme.text} />}
            title={t('components.chat.limitNotice.whatAreTokens')}
            subtitle={t('components.chat.limitNotice.whatAreTokensDescription')}
            onPress={closeMenu}
            typography={typography}
            theme={theme}
          />
          <View style={{ height: 6 }} />
        </View>
      </Modal>
    </>
  );
};

const Pill = ({
  text,
  borderColor,
  bgColor,
  textColor,
}: {
  text: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}) => (
  <View style={[pillStyles.base, { borderColor, backgroundColor: bgColor }]}>
    <Text style={[pillStyles.text, { color: textColor }]} numberOfLines={1}>
      {text}
    </Text>
  </View>
);

const SheetItem = ({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
  typography,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
  typography: any;
  theme: any;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      menuItemStyles.row,
      { opacity: disabled ? 0.45 : pressed ? 0.9 : 1 },
    ]}
  >
    <View style={menuItemStyles.icon}>{icon}</View>
    <View style={menuItemStyles.texts}>
      <Text style={[typography.body, { color: theme.title }]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[typography.body, { color: theme.text }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  </Pressable>
);

const getStyles = (sizes: SizesType, theme: any) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: sizes.radius_sm ?? 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 6,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    lock: { fontSize: 16, lineHeight: 16 },
    title: { flex: 1 },
    dotsBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

    metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

    actionsRow: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    primaryBtn: {
      flex: 1,
      height: 34,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: { color: theme?.white },
    btnContent: { flexDirection: 'row', gap: 6, alignItems: 'center' },

    ghostBtn: {
      height: 34,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
  });

const pillStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { fontSize: 11, lineHeight: 14 },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000055',
  },
  sheet: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});

const menuItemStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  icon: { width: 22, alignItems: 'center' },
  texts: { flex: 1, gap: 2 },
});

export default ChatLimitLockedNotice;
