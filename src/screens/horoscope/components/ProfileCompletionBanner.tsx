import React, { useCallback, useMemo } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type ThemeType, type SizesType } from 'rn-vs-lb/theme';
import type { TypographytType } from 'rn-vs-lb/theme/styles/styleSheet';
import { useTranslation } from 'react-i18next';

export type ProfileCompletionBannerProps = {
  completion: number;
  onPress: () => void;
  onClose: () => void;
};

type CreateStylesParams = {
  theme: ThemeType;
  sizes: SizesType;
  typography: TypographytType;
};

const createStyles = ({ theme, sizes, typography }: CreateStylesParams) =>
  StyleSheet.create({
    pressable: {
      borderRadius: sizes.radius_lg as number,
      overflow: 'hidden',
    },
    pressed: {
      opacity: 0.92,
    },
    gradient: {
      padding: sizes.lg as number,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconWrapper: {
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      padding: sizes.sm as number,
      borderRadius: sizes.radius as number,
      marginRight: sizes.md as number,
    },
    textContainer: {
      flex: 1,
      gap: sizes.xs as number,
    },
    title: {
      ...typography.titleH6,
      color: theme.white,
    },
    subtitle: {
      ...typography.body,
      color: theme.white,
      opacity: 0.9,
    },
    closeButton: {
      marginLeft: sizes.md as number,
      padding: sizes.xs as number,
      borderRadius: sizes.radius_sm as number,
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
    },
    closeButtonPressed: {
      opacity: 0.7,
    },
    progressContainer: {
      marginTop: sizes.md as number,
      gap: sizes.xs as number,
    },
    progressLabel: {
      ...typography.bodySm,
      color: theme.white,
      opacity: 0.85,
    },
    progressBar: {
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderRadius: sizes.radius_sm as number,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.white,
      borderRadius: sizes.radius_sm as number,
    },
  });

export const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({
  completion,
  onPress,
  onClose,
}) => {
  const { theme, sizes, typography } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles({ theme, sizes, typography }), [
    theme,
    sizes,
    typography,
  ]);

  const normalizedCompletion = Math.max(0, Math.min(1, completion));
  const percentage = Math.round(normalizedCompletion * 100);
  const progressWidth = percentage > 0 ? Math.max(percentage, 8) : 0;

  const description = useMemo(
    () =>
      percentage > 0
        ? t('screens.dashboard.profileBanner.partial', { percentage })
        : t('screens.dashboard.profileBanner.initial'),
    [percentage, t],
  );

  const handleClose = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      onClose();
    },
    [onClose],
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('screens.dashboard.profileBanner.accessibility.open')}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[theme.primary, theme.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="account-star" size={28} color={theme.white} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('screens.dashboard.profileBanner.title')}</Text>
            <Text style={styles.subtitle}>{description}</Text>
          </View>

          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={t('screens.dashboard.profileBanner.accessibility.close')}
            hitSlop={8}
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          >
            <Feather name="x" size={18} color={theme.white} />
          </Pressable>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            {t('screens.dashboard.profileBanner.progressLabel', { percentage })}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};
