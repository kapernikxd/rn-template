import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';
import type { HoroscopeCategory } from '../../../types/astrology';
import { CARD_WIDTH } from '../DashboardScreen';
import { splitHoroscopeIntoParagraphs } from './HoroscopeDescription';
import { useTranslation } from 'react-i18next';

type HoroscopeCardCategory = Exclude<HoroscopeCategory, 'general'>;

export type HoroscopeCardData = {
  key: HoroscopeCardCategory;
  title: string;
  description?: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  accent: string;
};

type HoroscopeCardProps = {
  item: HoroscopeCardData;
  content?: string;
  isLoading: boolean;
  isUnlocked: boolean;
  onPress: () => void;
};

export const HoroscopeCard: React.FC<HoroscopeCardProps> = ({
  item,
  content,
  isLoading,
  isUnlocked,
  onPress,
}) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const previewText = useMemo(() => {
    const paragraphs = splitHoroscopeIntoParagraphs(content);

    if (paragraphs.length > 0) {
      return paragraphs[0];
    }

    return item.description;
  }, [content, item.description]);

  const statusLabel = useMemo(() => {
    if (isLoading) {
      return t('screens.dashboard.horoscope.card.status.loading');
    }

    return isUnlocked
      ? t('screens.dashboard.horoscope.card.status.unlocked')
      : t('screens.dashboard.horoscope.card.status.locked');
  }, [isLoading, isUnlocked, t]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: CARD_WIDTH,
          minHeight: 120,
          backgroundColor: theme.card,
          borderRadius: sizes.radius_lg as number,
          padding: sizes.lg as number,
          justifyContent: 'space-between',
          overflow: 'hidden',

          // тень / "поднятая" карточка
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 10,
          elevation: 3,
        },
        cardPressed: {
          transform: [{ scale: 0.98 }],
          opacity: 0.9,
        },
        accentStrip: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: item.accent,
        },
        content: {
          marginTop: sizes.sm as number,
          gap: sizes.sm as number,
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        leftHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.sm as number,
          flexShrink: 1,
        },
        iconWrapper: {
          backgroundColor: item.accent,
          borderRadius: sizes.radius as number,
          padding: sizes.sm as number,
        },
        title: {
          ...typography.titleH6,
          flexShrink: 1,
        },
        statusWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.xs as number,
        },
        statusText: {
          ...typography.bodySm,
          color: theme.greyText,
        },
        description: {
          ...typography.body,
          color: theme.title,
        },
        descriptionLocked: {
          opacity: 0.7,
        },
        footerHint: {
          ...typography.bodySm,
          color: theme.greyText,
          marginTop: sizes.xs as number,
        },
      }),
    [
      item.accent,
      sizes.lg,
      sizes.radius_lg,
      sizes.radius,
      sizes.sm,
      sizes.xs,
      theme.card,
      theme.greyText,
      theme.title,
      typography.body,
      typography.bodySm,
      typography.titleH6,
    ],
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={t('screens.dashboard.horoscope.card.accessibility.open', { title: item.title })}
      hitSlop={8}
    >
      <View style={styles.accentStrip} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.leftHeader}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={theme.background}
              />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          <View style={styles.statusWrapper}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.greyText} />
            ) : (
              <Feather
                name={isUnlocked ? 'unlock' : 'lock'}
                size={18}
                color={theme.greyText}
              />
            )}
            <Text style={styles.statusText} numberOfLines={1}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {previewText ? (
          <Text
            style={[
              styles.description,
              !isUnlocked && styles.descriptionLocked,
            ]}
            numberOfLines={3}
          >
            {previewText}
          </Text>
        ) : null}

        {!isUnlocked && !isLoading && (
          <Text style={styles.footerHint} numberOfLines={1}>
            {t('screens.dashboard.horoscope.card.lockedHint')}
          </Text>
        )}
      </View>
    </Pressable>
  );
};
